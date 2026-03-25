import { eq } from 'drizzle-orm';
import { db } from '@/drizzle';
import { personas } from '@/drizzle/schema/personas';
import { calculateMessageCostMicros } from '@/lib/billing/openaiCost';
import {
  clampPersonaReplyText,
  maxCompletionTokensForPersonaReply,
} from '@/lib/billing/plans';
import { type ProductLink } from '@/lib/instagram/productLinkDecision';

export type PersonaRecord = {
  id: number;
  data: Record<string, unknown>;
};

export type NormalizedPersona = {
  id: string;
  active: boolean;
  transparencyMode: boolean;
  personality: Record<string, unknown>;
  productLinks: ProductLink[];
};

export type PersonaReplySurface = 'instagram' | 'telegram';

function normalizeProductLinks(rawLinks: unknown): ProductLink[] {
  if (!Array.isArray(rawLinks)) return [];

  const normalized: ProductLink[] = [];

  for (const link of rawLinks) {
    if (typeof link === 'string') {
      normalized.push({ url: link, actionType: 'buy', sendingBehavior: 'proactive' });
      continue;
    }

    if (!link || typeof link !== 'object') continue;
    const candidate = link as {
      id?: string;
      url?: string;
      actionType?: string;
      sendingBehavior?: string;
    };
    if (!candidate.url) continue;
    normalized.push({
      id: candidate.id,
      url: candidate.url,
      actionType: candidate.actionType || 'buy',
      sendingBehavior: candidate.sendingBehavior || 'proactive',
    });
  }

  return normalized;
}

export function normalizePersona(row: PersonaRecord): NormalizedPersona {
  const payload = row.data || {};
  const nested = payload.data && typeof payload.data === 'object' ? (payload.data as Record<string, unknown>) : {};

  const active = Boolean(payload.active ?? nested.active ?? false);
  const transparencyMode = Boolean(payload.transparencyMode ?? nested.transparencyMode ?? true);
  const personality =
    (nested.personality as Record<string, unknown>) ||
    (payload.personality as Record<string, unknown>) ||
    payload;
  const productLinks = normalizeProductLinks(nested.productLinks ?? payload.productLinks ?? []);

  return {
    id: String(row.id),
    active,
    transparencyMode,
    personality,
    productLinks,
  };
}

export async function getActivePersonaForUser(userId: string): Promise<NormalizedPersona | null> {
  const rows = (await db
    .select({
      id: personas.id,
      data: personas.data,
    })
    .from(personas)
    .where(eq(personas.userId, userId))) as PersonaRecord[];

  if (rows.length === 0) return null;

  const normalized = rows.map(normalizePersona);
  const active = normalized.find((persona) => persona.active);
  return active ?? normalized[0] ?? null;
}

export function getDelayBoundsFromPersona(persona: NormalizedPersona | null): {
  delayMin: number;
  delayMax: number;
} {
  if (!persona?.personality) {
    return { delayMin: 0, delayMax: 0 };
  }

  const delayMin = Number(persona.personality.delayMin);
  const delayMax = Number(persona.personality.delayMax);

  const min = Number.isFinite(delayMin) && delayMin >= 0 ? delayMin : 0;
  const max = Number.isFinite(delayMax) && delayMax >= min ? delayMax : min;

  return { delayMin: min, delayMax: max };
}

export function personaToPrompt(persona: NormalizedPersona): string {
  const compact = JSON.stringify(persona.personality ?? {});
  return compact.length > 5000 ? compact.slice(0, 5000) : compact;
}

export function buildSystemPrompt(
  persona: NormalizedPersona,
  promoInstruction: string,
  surface: PersonaReplySurface
): string {
  const transparencyInstruction =
    surface === 'instagram'
      ? persona.transparencyMode
        ? 'Always disclose naturally that you are an AI assistant for this Instagram account.'
        : 'Do not mention system internals. Write as a personal account assistant with natural tone.'
      : persona.transparencyMode
        ? 'Always disclose naturally that you are an AI assistant for this Telegram account.'
        : 'Do not mention system internals. Write as a personal account assistant with natural tone.';

  const intro =
    surface === 'instagram'
      ? 'You are replying to Instagram DMs for a persona account.'
      : 'You are replying on Telegram (direct messages and/or linked channels) for a persona account.';

  return [
    intro,
    'Respond to each message according to this system prompt, the persona profile, and the chat history. Consider the context of the ongoing conversation.',
    transparencyInstruction,
    'Stay concise, helpful, and match the user language (German or English).',
    'Avoid spammy promotion and avoid repeating links unless explicitly asked.',
    promoInstruction,
    `Persona profile JSON: ${personaToPrompt(persona)}`,
  ].join('\n');
}

export async function generateAiReply(
  systemPrompt: string,
  history: Array<{ role: 'user' | 'assistant'; content: string }>,
  latestUserMessage: string,
  options: { maxReplyChars: number }
): Promise<{
  replyText: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  apiCostMicros: number;
}> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is missing');
  }

  const { maxReplyChars } = options;
  const lengthRule = `Reply length: your entire message must be between 1 and ${maxReplyChars} characters inclusive. Never exceed ${maxReplyChars} characters. Count spaces and punctuation.`;

  const model = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';
  const messages = [
    { role: 'system', content: `${systemPrompt}\n${lengthRule}` },
    ...history.map((item) => ({ role: item.role, content: item.content })),
    { role: 'user', content: `Nachricht: ${latestUserMessage}` },
  ];

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.7,
      max_tokens: maxCompletionTokensForPersonaReply(maxReplyChars),
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`OpenAI request failed: ${response.status} ${body}`);
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
    usage?: {
      prompt_tokens?: number;
      completion_tokens?: number;
      total_tokens?: number;
    };
  };
  let content = payload.choices?.[0]?.message?.content?.trim() ?? '';
  content = clampPersonaReplyText(content, maxReplyChars);
  if (!content) {
    content =
      maxReplyChars <= 1 ? '.' : clampPersonaReplyText('OK.', maxReplyChars);
  } else if (content.length > maxReplyChars) {
    content = clampPersonaReplyText(content, maxReplyChars);
  }

  const promptTokens = Number(payload.usage?.prompt_tokens || 0);
  const completionTokens = Number(payload.usage?.completion_tokens || 0);
  const totalTokens =
    Number(payload.usage?.total_tokens || 0) ||
    (Number.isFinite(promptTokens) && Number.isFinite(completionTokens)
      ? promptTokens + completionTokens
      : 0);
  const apiCostMicros = calculateMessageCostMicros({
    promptTokens: Math.max(0, promptTokens),
    completionTokens: Math.max(0, completionTokens),
  });

  return {
    replyText: content,
    model,
    promptTokens: Math.max(0, promptTokens),
    completionTokens: Math.max(0, completionTokens),
    totalTokens: Math.max(0, totalTokens),
    apiCostMicros,
  };
}

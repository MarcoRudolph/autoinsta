import { and, desc, eq } from 'drizzle-orm';
import { db } from '@/drizzle';
import {
  instagramConnections,
  instagramDeliveryAudit,
  instagramMessages,
  instagramPromoAudit,
  instagramThreads,
} from '@/drizzle/schema/instagram';
import { personas } from '@/drizzle/schema/personas';
import { decideProductLink, type ProductLink } from './productLinkDecision';

type MessageKind = 'dm' | 'comment';
type MessageDirection = 'incoming' | 'outgoing' | 'unknown';

export type StoredMessageInput = {
  igAccountId: string;
  threadKey: string;
  platformMessageId: string;
  messageKind: MessageKind;
  direction: MessageDirection;
  senderIgId: string | null;
  recipientIgId: string | null;
  messageText: string | null;
  sentAt: string;
  rawPayload: unknown;
  participantIgId: string | null;
};

export type ThreadState = {
  incomingMessageCount: number;
  outgoingMessageCount: number;
  lastPromoAt: string | null;
};

type ConnectionRecord = {
  igAccountId: string;
  userId: string | null;
  accessToken: string | null;
};

type PersonaRecord = {
  id: number;
  data: Record<string, unknown>;
};

type NormalizedPersona = {
  id: string;
  active: boolean;
  transparencyMode: boolean;
  personality: Record<string, unknown>;
  productLinks: ProductLink[];
};

type DmOrchestrationInput = {
  inboundMessage: StoredMessageInput;
  threadState: ThreadState;
};

type GraphApiErrorPayload = {
  message?: string;
  type?: string;
  code?: number;
  error_subcode?: number;
  is_transient?: boolean;
};

type GraphApiResponsePayload = {
  message_id?: string;
  error?: GraphApiErrorPayload;
};

class GraphApiRequestError extends Error {
  statusCode: number;
  errorCode?: number;
  errorType?: string;
  isRetryable: boolean;
  retryCount: number;

  constructor(input: {
    message: string;
    statusCode: number;
    errorCode?: number;
    errorType?: string;
    isRetryable: boolean;
    retryCount: number;
  }) {
    super(input.message);
    this.name = 'GraphApiRequestError';
    this.statusCode = input.statusCode;
    this.errorCode = input.errorCode;
    this.errorType = input.errorType;
    this.isRetryable = input.isRetryable;
    this.retryCount = input.retryCount;
  }
}

const GRAPH_API_VERSION = 'v23.0';
const DM_PIPELINE_DEBUG = process.env.DM_PIPELINE_DEBUG !== '0';

function logDmDebug(event: string, details: Record<string, unknown>) {
  if (!DM_PIPELINE_DEBUG) return;
  console.log(`[dmPipeline] ${event}`, details);
}

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

function normalizePersona(row: PersonaRecord): NormalizedPersona {
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

async function getConnectionByAccountId(igAccountId: string): Promise<ConnectionRecord | null> {
  const rows = await db
    .select({
      igAccountId: instagramConnections.igAccountId,
      userId: instagramConnections.userId,
      accessToken: instagramConnections.accessToken,
    })
    .from(instagramConnections)
    .where(eq(instagramConnections.igAccountId, igAccountId))
    .limit(1);

  return rows[0] ?? null;
}

async function getActivePersonaForUser(userId: string): Promise<NormalizedPersona | null> {
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
  return active || normalized[0];
}

async function getRecentThreadMessages(
  igAccountId: string,
  threadKey: string,
  excludeMessageId: string
): Promise<Array<{ role: 'user' | 'assistant'; content: string }>> {
  const rows = await db
    .select({
      platformMessageId: instagramMessages.platformMessageId,
      direction: instagramMessages.direction,
      messageText: instagramMessages.messageText,
    })
    .from(instagramMessages)
    .where(and(eq(instagramMessages.igAccountId, igAccountId), eq(instagramMessages.threadKey, threadKey)))
    .orderBy(desc(instagramMessages.sentAt))
    .limit(20);

  return rows
    .filter(
      (row) =>
        row.platformMessageId !== excludeMessageId &&
        typeof row.messageText === 'string' &&
        row.messageText.trim().length > 0 &&
        (row.direction === 'incoming' || row.direction === 'outgoing')
    )
    .reverse()
    .map((row) => ({
      role: row.direction === 'incoming' ? 'user' : 'assistant',
      content: row.messageText as string,
    }));
}

function personaToPrompt(persona: NormalizedPersona): string {
  const compact = JSON.stringify(persona.personality ?? {});
  return compact.length > 5000 ? compact.slice(0, 5000) : compact;
}

function buildSystemPrompt(persona: NormalizedPersona, promoInstruction: string): string {
  const transparencyInstruction = persona.transparencyMode
    ? 'Always disclose naturally that you are an AI assistant for this Instagram account.'
    : 'Do not mention system internals. Write as a personal account assistant with natural tone.';

  return [
    'You are replying to Instagram DMs for a persona account.',
    transparencyInstruction,
    'Stay concise, helpful, and match the user language (German or English).',
    'Avoid spammy promotion and avoid repeating links unless explicitly asked.',
    promoInstruction,
    `Persona profile JSON: ${personaToPrompt(persona)}`,
  ].join('\n');
}

async function generateAiReply(
  systemPrompt: string,
  history: Array<{ role: 'user' | 'assistant'; content: string }>,
  latestUserMessage: string
): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is missing');
  }

  const model = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';
  const messages = [
    { role: 'system', content: systemPrompt },
    ...history.map((item) => ({ role: item.role, content: item.content })),
    { role: 'user', content: latestUserMessage },
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
      max_tokens: 250,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`OpenAI request failed: ${response.status} ${body}`);
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = payload.choices?.[0]?.message?.content?.trim();
  if (!content) {
    throw new Error('OpenAI returned empty content');
  }
  return content;
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function classifyGraphError(status: number, payload: GraphApiResponsePayload): {
  message: string;
  code?: number;
  type?: string;
  retryable: boolean;
} {
  const error = payload.error;
  const message = error?.message || `Graph request failed with status ${status}`;
  const code = error?.code;
  const type = error?.type;
  const retryable =
    Boolean(error?.is_transient) ||
    status === 429 ||
    status >= 500 ||
    code === 2 ||
    code === 4 ||
    code === 17 ||
    code === 341;

  return { message, code, type, retryable };
}

async function insertDeliveryAudit(input: {
  igAccountId: string;
  threadKey: string;
  direction: 'incoming' | 'outgoing';
  status: 'succeeded' | 'failed';
  providerMessageId?: string | null;
  errorCode?: number;
  errorType?: string;
  errorMessage?: string;
  retryCount?: number;
  metadata?: Record<string, unknown>;
}) {
  await db.insert(instagramDeliveryAudit).values({
    igAccountId: input.igAccountId,
    threadKey: input.threadKey,
    direction: input.direction,
    status: input.status,
    providerMessageId: input.providerMessageId || null,
    errorCode: input.errorCode ?? null,
    errorType: input.errorType ?? null,
    errorMessage: input.errorMessage ?? null,
    retryCount: input.retryCount ?? 0,
    metadata: input.metadata ?? null,
  });
}

async function sendInstagramDm(
  igAccountId: string,
  threadKey: string,
  recipientIgId: string,
  text: string,
  accessToken: string
): Promise<{ platformMessageId: string }> {
  const endpoint = `https://graph.facebook.com/${GRAPH_API_VERSION}/${igAccountId}/messages`;
  let lastError: GraphApiRequestError | null = null;

  for (let attempt = 0; attempt < 2; attempt += 1) {
    const response = await fetch(`${endpoint}?access_token=${encodeURIComponent(accessToken)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        recipient: { id: recipientIgId },
        messaging_type: 'RESPONSE',
        message: { text },
      }),
    });

    const payload = (await response.json()) as GraphApiResponsePayload;

    if (response.ok && payload.message_id) {
      await insertDeliveryAudit({
        igAccountId,
        threadKey,
        direction: 'outgoing',
        status: 'succeeded',
        providerMessageId: payload.message_id,
        retryCount: attempt,
        metadata: { recipientIgId },
      });
      return { platformMessageId: payload.message_id };
    }

    const classified = classifyGraphError(response.status, payload);
    lastError = new GraphApiRequestError({
      message: classified.message,
      statusCode: response.status,
      errorCode: classified.code,
      errorType: classified.type,
      isRetryable: classified.retryable,
      retryCount: attempt,
    });

    if (classified.retryable && attempt < 1) {
      await wait(500 * (attempt + 1));
      continue;
    }
    break;
  }

  if (lastError) {
    await insertDeliveryAudit({
      igAccountId,
      threadKey,
      direction: 'outgoing',
      status: 'failed',
      errorCode: lastError.errorCode,
      errorType: lastError.errorType,
      errorMessage: lastError.message,
      retryCount: lastError.retryCount,
      metadata: {
        statusCode: lastError.statusCode,
        isRetryable: lastError.isRetryable,
      },
    });
    throw lastError;
  }

  throw new GraphApiRequestError({
    message: 'Graph API failed',
    statusCode: 500,
    isRetryable: false,
    retryCount: 0,
  });
}

async function setThreadPromoState(igAccountId: string, threadKey: string, platformMessageId: string) {
  await db
    .update(instagramThreads)
    .set({
      lastPromoAt: new Date(),
      lastPromoMessageId: platformMessageId,
      updatedAt: new Date(),
    })
    .where(and(eq(instagramThreads.igAccountId, igAccountId), eq(instagramThreads.threadKey, threadKey)));
}

async function insertPromoAudit(input: {
  igAccountId: string;
  threadKey: string;
  platformMessageId?: string | null;
  personaId?: string | null;
  decision: 'promo_sent' | 'promo_skipped';
  reason: string;
  selectedLinkUrl?: string | null;
  selectedActionType?: string | null;
  selectedSendingBehavior?: string | null;
  metadata?: Record<string, unknown>;
}) {
  await db.insert(instagramPromoAudit).values({
    igAccountId: input.igAccountId,
    threadKey: input.threadKey,
    platformMessageId: input.platformMessageId || null,
    personaId: input.personaId || null,
    decision: input.decision,
    reason: input.reason,
    selectedLinkUrl: input.selectedLinkUrl || null,
    selectedActionType: input.selectedActionType || null,
    selectedSendingBehavior: input.selectedSendingBehavior || null,
    metadata: input.metadata || null,
  });
}

async function loadThreadState(igAccountId: string, threadKey: string): Promise<ThreadState> {
  const data = await db
    .select({
      incomingMessageCount: instagramThreads.incomingMessageCount,
      outgoingMessageCount: instagramThreads.outgoingMessageCount,
      lastPromoAt: instagramThreads.lastPromoAt,
    })
    .from(instagramThreads)
    .where(and(eq(instagramThreads.igAccountId, igAccountId), eq(instagramThreads.threadKey, threadKey)))
    .limit(1);

  const row = data[0];

  return {
    incomingMessageCount: Number(row?.incomingMessageCount || 0),
    outgoingMessageCount: Number(row?.outgoingMessageCount || 0),
    lastPromoAt: row?.lastPromoAt ? row.lastPromoAt.toISOString() : null,
  };
}

export async function recordInstagramMessage(
  message: StoredMessageInput
): Promise<{ inserted: boolean; threadState: ThreadState; reason: 'inserted' | 'duplicate' | 'error' }> {
  let existing: Array<{ platformMessageId: string }> = [];
  try {
    existing = await db
      .select({ platformMessageId: instagramMessages.platformMessageId })
      .from(instagramMessages)
      .where(eq(instagramMessages.platformMessageId, message.platformMessageId))
      .limit(1);
  } catch (error) {
    console.error('[dmPipeline] Failed to check existing message', {
      igAccountId: message.igAccountId,
      threadKey: message.threadKey,
      platformMessageId: message.platformMessageId,
      error: error instanceof Error ? error.message : String(error),
    });
    return {
      inserted: false,
      threadState: await loadThreadState(message.igAccountId, message.threadKey),
      reason: 'error',
    };
  }

  if (existing.length > 0) {
    logDmDebug('duplicate_message', {
      igAccountId: message.igAccountId,
      threadKey: message.threadKey,
      platformMessageId: message.platformMessageId,
    });
    return {
      inserted: false,
      threadState: await loadThreadState(message.igAccountId, message.threadKey),
      reason: 'duplicate',
    };
  }

  try {
    await db.insert(instagramMessages).values({
      igAccountId: message.igAccountId,
      threadKey: message.threadKey,
      platformMessageId: message.platformMessageId,
      messageKind: message.messageKind,
      direction: message.direction,
      senderIgId: message.senderIgId,
      recipientIgId: message.recipientIgId,
      messageText: message.messageText,
      sentAt: new Date(message.sentAt),
      rawPayload: message.rawPayload,
    });
  } catch (error) {
    console.error('[dmPipeline] Failed to insert instagram_messages row', {
      igAccountId: message.igAccountId,
      threadKey: message.threadKey,
      platformMessageId: message.platformMessageId,
      direction: message.direction,
      messageKind: message.messageKind,
      error: error instanceof Error ? error.message : String(error),
    });
    return {
      inserted: false,
      threadState: await loadThreadState(message.igAccountId, message.threadKey),
      reason: 'error',
    };
  }

  let existingThread:
    | {
        incomingMessageCount: number;
        outgoingMessageCount: number;
        lastIncomingAt: Date | null;
        lastOutgoingAt: Date | null;
        lastPromoAt: Date | null;
        lastPromoMessageId: string | null;
      }
    | undefined;

  try {
    const threadRows = await db
      .select({
        incomingMessageCount: instagramThreads.incomingMessageCount,
        outgoingMessageCount: instagramThreads.outgoingMessageCount,
        lastIncomingAt: instagramThreads.lastIncomingAt,
        lastOutgoingAt: instagramThreads.lastOutgoingAt,
        lastPromoAt: instagramThreads.lastPromoAt,
        lastPromoMessageId: instagramThreads.lastPromoMessageId,
      })
      .from(instagramThreads)
      .where(and(eq(instagramThreads.igAccountId, message.igAccountId), eq(instagramThreads.threadKey, message.threadKey)))
      .limit(1);
    existingThread = threadRows[0];
  } catch (error) {
    console.error('[dmPipeline] Failed to read instagram_threads row', {
      igAccountId: message.igAccountId,
      threadKey: message.threadKey,
      platformMessageId: message.platformMessageId,
      error: error instanceof Error ? error.message : String(error),
    });
  }

  const isIncoming = message.direction === 'incoming';
  const incomingCount = Number(existingThread?.incomingMessageCount || 0) + (isIncoming ? 1 : 0);
  const outgoingCount = Number(existingThread?.outgoingMessageCount || 0) + (isIncoming ? 0 : 1);
  const sentAtDate = new Date(message.sentAt);

  try {
    await db
      .insert(instagramThreads)
      .values({
        igAccountId: message.igAccountId,
        threadKey: message.threadKey,
        participantIgId: message.participantIgId,
        incomingMessageCount: incomingCount,
        outgoingMessageCount: outgoingCount,
        lastIncomingAt: isIncoming ? sentAtDate : existingThread?.lastIncomingAt || null,
        lastOutgoingAt: isIncoming ? existingThread?.lastOutgoingAt || null : sentAtDate,
        lastMessageAt: sentAtDate,
        lastPromoAt: existingThread?.lastPromoAt || null,
        lastPromoMessageId: existingThread?.lastPromoMessageId || null,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [instagramThreads.igAccountId, instagramThreads.threadKey],
        set: {
          participantIgId: message.participantIgId,
          incomingMessageCount: incomingCount,
          outgoingMessageCount: outgoingCount,
          lastIncomingAt: isIncoming ? sentAtDate : existingThread?.lastIncomingAt || null,
          lastOutgoingAt: isIncoming ? existingThread?.lastOutgoingAt || null : sentAtDate,
          lastMessageAt: sentAtDate,
          lastPromoAt: existingThread?.lastPromoAt || null,
          lastPromoMessageId: existingThread?.lastPromoMessageId || null,
          updatedAt: new Date(),
        },
      });
  } catch (error) {
    console.error('[dmPipeline] Failed to upsert instagram_threads row', {
      igAccountId: message.igAccountId,
      threadKey: message.threadKey,
      platformMessageId: message.platformMessageId,
      incomingCount,
      outgoingCount,
      error: error instanceof Error ? error.message : String(error),
    });
    return {
      inserted: false,
      threadState: await loadThreadState(message.igAccountId, message.threadKey),
      reason: 'error',
    };
  }

  try {
    await db
      .update(instagramConnections)
      .set({ webhookVerified: true, updatedAt: new Date() })
      .where(eq(instagramConnections.igAccountId, message.igAccountId));
  } catch (error) {
    console.error('[dmPipeline] Failed to mark webhook_verified on instagram_connections', {
      igAccountId: message.igAccountId,
      threadKey: message.threadKey,
      platformMessageId: message.platformMessageId,
      error: error instanceof Error ? error.message : String(error),
    });
  }

  logDmDebug('message_recorded', {
    igAccountId: message.igAccountId,
    threadKey: message.threadKey,
    platformMessageId: message.platformMessageId,
    direction: message.direction,
    messageKind: message.messageKind,
    incomingCount,
    outgoingCount,
  });

  return {
    inserted: true,
    threadState: {
      incomingMessageCount: incomingCount,
      outgoingMessageCount: outgoingCount,
      lastPromoAt: existingThread?.lastPromoAt ? existingThread.lastPromoAt.toISOString() : null,
    },
    reason: 'inserted',
  };
}

export async function processIncomingDm(input: DmOrchestrationInput): Promise<void> {
  const { inboundMessage, threadState } = input;
  if (!inboundMessage.messageText || !inboundMessage.senderIgId) {
    return;
  }

  const connection = await getConnectionByAccountId(inboundMessage.igAccountId);
  const accessToken = connection?.accessToken || process.env.INSTAGRAM_ACCESS_TOKEN || null;
  if (!connection || !connection.userId || !accessToken) {
    await insertPromoAudit({
      igAccountId: inboundMessage.igAccountId,
      threadKey: inboundMessage.threadKey,
      platformMessageId: inboundMessage.platformMessageId,
      decision: 'promo_skipped',
      reason: 'missing_connection_or_token',
    });
    return;
  }

  const persona = await getActivePersonaForUser(connection.userId);
  if (!persona) {
    await insertPromoAudit({
      igAccountId: inboundMessage.igAccountId,
      threadKey: inboundMessage.threadKey,
      platformMessageId: inboundMessage.platformMessageId,
      decision: 'promo_skipped',
      reason: 'missing_persona',
    });
    return;
  }

  const decision = decideProductLink({
    links: persona.productLinks,
    incomingMessageCount: threadState.incomingMessageCount,
    lastPromoAt: threadState.lastPromoAt,
    latestUserMessage: inboundMessage.messageText,
    now: new Date(),
  });

  const promoInstruction = decision.shouldSendPromo
    ? `Include exactly one short and natural recommendation with this URL: ${decision.selectedLink.url}. Action type: ${
        decision.selectedLink.actionType || 'buy'
      }.`
    : 'Do not include product links unless explicitly asked in the current message.';

  const history = await getRecentThreadMessages(
    inboundMessage.igAccountId,
    inboundMessage.threadKey,
    inboundMessage.platformMessageId
  );

  const replyText = await generateAiReply(
    buildSystemPrompt(persona, promoInstruction),
    history,
    inboundMessage.messageText
  );

  const sent = await sendInstagramDm(
    inboundMessage.igAccountId,
    inboundMessage.threadKey,
    inboundMessage.senderIgId,
    replyText,
    accessToken
  );

  const sentAt = new Date().toISOString();
  await recordInstagramMessage({
    igAccountId: inboundMessage.igAccountId,
    threadKey: inboundMessage.threadKey,
    platformMessageId: sent.platformMessageId,
    messageKind: 'dm',
    direction: 'outgoing',
    senderIgId: inboundMessage.igAccountId,
    recipientIgId: inboundMessage.senderIgId,
    messageText: replyText,
    sentAt,
    rawPayload: {
      sourceMessageId: inboundMessage.platformMessageId,
      providerResponse: sent,
    },
    participantIgId: inboundMessage.senderIgId,
  });

  if (decision.shouldSendPromo) {
    await setThreadPromoState(inboundMessage.igAccountId, inboundMessage.threadKey, sent.platformMessageId);
  }

  await insertPromoAudit({
    igAccountId: inboundMessage.igAccountId,
    threadKey: inboundMessage.threadKey,
    platformMessageId: sent.platformMessageId,
    personaId: persona.id,
    decision: decision.shouldSendPromo ? 'promo_sent' : 'promo_skipped',
    reason: decision.reason,
    selectedLinkUrl: decision.shouldSendPromo ? decision.selectedLink.url : null,
    selectedActionType: decision.shouldSendPromo ? decision.selectedLink.actionType || null : null,
    selectedSendingBehavior: decision.shouldSendPromo ? decision.selectedLink.sendingBehavior || null : null,
    metadata: {
      incomingMessageCount: threadState.incomingMessageCount,
      outgoingMessageCount: threadState.outgoingMessageCount,
    },
  });
}

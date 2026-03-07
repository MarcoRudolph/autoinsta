import { createClient } from '@supabase/supabase-js';
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
  ig_account_id: string;
  user_id: string | null;
  access_token: string | null;
};

type PersonaRecord = {
  id: string;
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
let loggedMissingAdminClient = false;

function logDmDebug(event: string, details: Record<string, unknown>) {
  if (!DM_PIPELINE_DEBUG) return;
  console.log(`[dmPipeline] ${event}`, details);
}

function createAdminSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    if (!loggedMissingAdminClient) {
      loggedMissingAdminClient = true;
      console.error('[dmPipeline] Missing admin supabase env', {
        hasSupabaseUrl: Boolean(supabaseUrl),
        hasServiceRoleKey: Boolean(serviceRoleKey),
      });
    }
    return null;
  }
  return createClient(supabaseUrl, serviceRoleKey);
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
    id: row.id,
    active,
    transparencyMode,
    personality,
    productLinks,
  };
}

async function getConnectionByAccountId(igAccountId: string): Promise<ConnectionRecord | null> {
  const supabase = createAdminSupabaseClient();
  if (!supabase) return null;

  const { data } = await supabase
    .from('instagram_connections')
    .select('ig_account_id,user_id,access_token')
    .eq('ig_account_id', igAccountId)
    .limit(1)
    .maybeSingle();

  return (data as ConnectionRecord | null) ?? null;
}

async function getActivePersonaForUser(userId: string): Promise<NormalizedPersona | null> {
  const supabase = createAdminSupabaseClient();
  if (!supabase) return null;

  const { data } = await supabase.from('personas').select('id,data').eq('userId', userId);
  const rows = (data as PersonaRecord[] | null) || [];
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
  const supabase = createAdminSupabaseClient();
  if (!supabase) return [];

  const { data } = await supabase
    .from('instagram_messages')
    .select('platform_message_id,direction,message_text,sent_at')
    .eq('ig_account_id', igAccountId)
    .eq('thread_key', threadKey)
    .order('sent_at', { ascending: false })
    .limit(20);

  const rows =
    (data as Array<{
      platform_message_id?: string;
      direction?: string;
      message_text?: string | null;
    }> | null) || [];

  return rows
    .filter(
      (row) =>
        row.platform_message_id !== excludeMessageId &&
        typeof row.message_text === 'string' &&
        row.message_text.trim().length > 0 &&
        (row.direction === 'incoming' || row.direction === 'outgoing')
    )
    .reverse()
    .map((row) => ({
      role: row.direction === 'incoming' ? 'user' : 'assistant',
      content: row.message_text as string,
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
  const supabase = createAdminSupabaseClient();
  if (!supabase) return;

  await supabase.from('instagram_delivery_audit').insert({
    ig_account_id: input.igAccountId,
    thread_key: input.threadKey,
    direction: input.direction,
    status: input.status,
    provider_message_id: input.providerMessageId || null,
    error_code: input.errorCode ?? null,
    error_type: input.errorType ?? null,
    error_message: input.errorMessage ?? null,
    retry_count: input.retryCount ?? 0,
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
  const supabase = createAdminSupabaseClient();
  if (!supabase) return;

  await supabase
    .from('instagram_threads')
    .update({
      last_promo_at: new Date().toISOString(),
      last_promo_message_id: platformMessageId,
      updated_at: new Date().toISOString(),
    })
    .eq('ig_account_id', igAccountId)
    .eq('thread_key', threadKey);
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
  const supabase = createAdminSupabaseClient();
  if (!supabase) return;

  await supabase.from('instagram_promo_audit').insert({
    ig_account_id: input.igAccountId,
    thread_key: input.threadKey,
    platform_message_id: input.platformMessageId || null,
    persona_id: input.personaId || null,
    decision: input.decision,
    reason: input.reason,
    selected_link_url: input.selectedLinkUrl || null,
    selected_action_type: input.selectedActionType || null,
    selected_sending_behavior: input.selectedSendingBehavior || null,
    metadata: input.metadata || null,
  });
}

async function loadThreadState(igAccountId: string, threadKey: string): Promise<ThreadState> {
  const supabase = createAdminSupabaseClient();
  if (!supabase) {
    return { incomingMessageCount: 0, outgoingMessageCount: 0, lastPromoAt: null };
  }

  const { data } = await supabase
    .from('instagram_threads')
    .select('incoming_message_count,outgoing_message_count,last_promo_at')
    .eq('ig_account_id', igAccountId)
    .eq('thread_key', threadKey)
    .limit(1)
    .maybeSingle();

  return {
    incomingMessageCount: Number(data?.incoming_message_count || 0),
    outgoingMessageCount: Number(data?.outgoing_message_count || 0),
    lastPromoAt: (data?.last_promo_at as string | null) || null,
  };
}

export async function recordInstagramMessage(
  message: StoredMessageInput
): Promise<{ inserted: boolean; threadState: ThreadState; reason: 'inserted' | 'duplicate' | 'error' }> {
  const supabase = createAdminSupabaseClient();
  if (!supabase) {
    console.error('[dmPipeline] Skipping recordInstagramMessage due to missing admin client', {
      igAccountId: message.igAccountId,
      threadKey: message.threadKey,
      platformMessageId: message.platformMessageId,
    });
    return {
      inserted: false,
      threadState: { incomingMessageCount: 0, outgoingMessageCount: 0, lastPromoAt: null },
      reason: 'error',
    };
  }

  const { data: existing, error: existingError } = await supabase
    .from('instagram_messages')
    .select('platform_message_id')
    .eq('platform_message_id', message.platformMessageId)
    .limit(1);

  if (existingError) {
    console.error('[dmPipeline] Failed to check existing message', {
      igAccountId: message.igAccountId,
      threadKey: message.threadKey,
      platformMessageId: message.platformMessageId,
      error: existingError.message,
    });
    return {
      inserted: false,
      threadState: await loadThreadState(message.igAccountId, message.threadKey),
      reason: 'error',
    };
  }

  if (existing && existing.length > 0) {
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

  const { error: insertError } = await supabase.from('instagram_messages').insert({
    ig_account_id: message.igAccountId,
    thread_key: message.threadKey,
    platform_message_id: message.platformMessageId,
    message_kind: message.messageKind,
    direction: message.direction,
    sender_ig_id: message.senderIgId,
    recipient_ig_id: message.recipientIgId,
    message_text: message.messageText,
    sent_at: message.sentAt,
    raw_payload: message.rawPayload,
  });

  if (insertError) {
    console.error('[dmPipeline] Failed to insert instagram_messages row', {
      igAccountId: message.igAccountId,
      threadKey: message.threadKey,
      platformMessageId: message.platformMessageId,
      direction: message.direction,
      messageKind: message.messageKind,
      error: insertError.message,
    });
    return {
      inserted: false,
      threadState: await loadThreadState(message.igAccountId, message.threadKey),
      reason: 'error',
    };
  }

  const { data: existingThread, error: existingThreadError } = await supabase
    .from('instagram_threads')
    .select('*')
    .eq('ig_account_id', message.igAccountId)
    .eq('thread_key', message.threadKey)
    .limit(1)
    .maybeSingle();

  if (existingThreadError) {
    console.error('[dmPipeline] Failed to read instagram_threads row', {
      igAccountId: message.igAccountId,
      threadKey: message.threadKey,
      platformMessageId: message.platformMessageId,
      error: existingThreadError.message,
    });
  }

  const isIncoming = message.direction === 'incoming';
  const incomingCount = Number(existingThread?.incoming_message_count || 0) + (isIncoming ? 1 : 0);
  const outgoingCount = Number(existingThread?.outgoing_message_count || 0) + (isIncoming ? 0 : 1);

  const { error: upsertThreadError } = await supabase.from('instagram_threads').upsert(
    {
      ig_account_id: message.igAccountId,
      thread_key: message.threadKey,
      participant_ig_id: message.participantIgId,
      incoming_message_count: incomingCount,
      outgoing_message_count: outgoingCount,
      last_incoming_at: isIncoming ? message.sentAt : existingThread?.last_incoming_at || null,
      last_outgoing_at: isIncoming ? existingThread?.last_outgoing_at || null : message.sentAt,
      last_message_at: message.sentAt,
      last_promo_at: existingThread?.last_promo_at || null,
      last_promo_message_id: existingThread?.last_promo_message_id || null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'ig_account_id,thread_key' }
  );

  if (upsertThreadError) {
    console.error('[dmPipeline] Failed to upsert instagram_threads row', {
      igAccountId: message.igAccountId,
      threadKey: message.threadKey,
      platformMessageId: message.platformMessageId,
      incomingCount,
      outgoingCount,
      error: upsertThreadError.message,
    });
    return {
      inserted: false,
      threadState: await loadThreadState(message.igAccountId, message.threadKey),
      reason: 'error',
    };
  }

  const { error: connectionUpdateError } = await supabase
    .from('instagram_connections')
    .update({ webhook_verified: true, updated_at: new Date().toISOString() })
    .eq('ig_account_id', message.igAccountId);

  if (connectionUpdateError) {
    console.error('[dmPipeline] Failed to mark webhook_verified on instagram_connections', {
      igAccountId: message.igAccountId,
      threadKey: message.threadKey,
      platformMessageId: message.platformMessageId,
      error: connectionUpdateError.message,
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
      lastPromoAt: (existingThread?.last_promo_at as string | null) || null,
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
  const accessToken = connection?.access_token || process.env.INSTAGRAM_ACCESS_TOKEN || null;
  if (!connection || !connection.user_id || !accessToken) {
    await insertPromoAudit({
      igAccountId: inboundMessage.igAccountId,
      threadKey: inboundMessage.threadKey,
      platformMessageId: inboundMessage.platformMessageId,
      decision: 'promo_skipped',
      reason: 'missing_connection_or_token',
    });
    return;
  }

  const persona = await getActivePersonaForUser(connection.user_id);
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

import { and, desc, eq } from 'drizzle-orm';
import { db } from '@/drizzle';
import {
  telegramChatLinks,
  telegramMessages,
  telegramThreads,
  telegramUserSessions,
} from '@/drizzle/schema/telegram';
import { getPersonaReplyMaxChars, normalizePlan } from '@/lib/billing/plans';
import { canAffordEstimatedMessage, recordUsageDebit } from '@/lib/billing/service';
import { decideProductLink } from '@/lib/instagram/productLinkDecision';
import {
  buildSystemPrompt,
  generateAiReply,
  getActivePersonaForUser,
  getDelayBoundsFromPersona,
} from '@/lib/persona/personaAi';
import { getUserPlan } from '@/lib/subscription';
import { gramjsSendMessageAsUser } from './gramjsUserClient';
import { decryptSessionString } from './sessionCrypto';

export type TelegramThreadState = {
  incomingMessageCount: number;
  outgoingMessageCount: number;
  lastPromoAt: string | null;
};

export type TelegramStoredMessageInput = {
  userId: string;
  threadKey: string;
  platformMessageId: string;
  messageKind: 'dm' | 'channel_post' | 'group';
  direction: 'incoming' | 'outgoing' | 'unknown';
  senderTelegramUserId: string | null;
  recipientTelegramUserId: string | null;
  chatId: string;
  messageText: string | null;
  sentAt: string;
  rawPayload: unknown;
  participantTelegramUserId: string | null;
  telegramMessageId?: number;
};

export type TelegramOrchestrationInput = {
  inboundMessage: TelegramStoredMessageInput;
  threadState: TelegramThreadState;
  updateKind: 'dm_private' | 'channel_post' | 'group_message';
};

export async function getTelegramSessionStringForUser(userId: string): Promise<string | null> {
  const rows = await db
    .select({ enc: telegramUserSessions.encryptedSession })
    .from(telegramUserSessions)
    .where(
      and(eq(telegramUserSessions.userId, userId), eq(telegramUserSessions.status, 'connected'))
    )
    .limit(1);
  const enc = rows[0]?.enc;
  if (!enc) return null;
  try {
    return decryptSessionString(enc);
  } catch {
    return null;
  }
}

export async function getTelegramIdentityByTelegramUserId(
  telegramUserId: string
): Promise<{ userId: string } | null> {
  const rows = await db
    .select({ userId: telegramUserSessions.userId })
    .from(telegramUserSessions)
    .where(
      and(
        eq(telegramUserSessions.telegramUserId, telegramUserId),
        eq(telegramUserSessions.status, 'connected')
      )
    )
    .limit(1);
  return rows[0] ?? null;
}

export async function getTelegramOwnerForChat(chatId: string): Promise<{ userId: string } | null> {
  const rows = await db
    .select({ userId: telegramChatLinks.userId })
    .from(telegramChatLinks)
    .where(and(eq(telegramChatLinks.telegramChatId, chatId), eq(telegramChatLinks.enabled, true)))
    .limit(1);
  return rows[0] ?? null;
}

async function loadTelegramThreadState(userId: string, threadKey: string): Promise<TelegramThreadState> {
  const data = await db
    .select({
      incomingMessageCount: telegramThreads.incomingMessageCount,
      outgoingMessageCount: telegramThreads.outgoingMessageCount,
      lastPromoAt: telegramThreads.lastPromoAt,
    })
    .from(telegramThreads)
    .where(and(eq(telegramThreads.userId, userId), eq(telegramThreads.threadKey, threadKey)))
    .limit(1);

  const row = data[0];
  return {
    incomingMessageCount: Number(row?.incomingMessageCount || 0),
    outgoingMessageCount: Number(row?.outgoingMessageCount || 0),
    lastPromoAt: row?.lastPromoAt ? row.lastPromoAt.toISOString() : null,
  };
}

export async function recordTelegramMessage(message: TelegramStoredMessageInput): Promise<{
  inserted: boolean;
  threadState: TelegramThreadState;
  reason: 'inserted' | 'duplicate' | 'error';
  errorMessage?: string;
}> {
  let existing: Array<{ platformMessageId: string }> = [];
  try {
    existing = await db
      .select({ platformMessageId: telegramMessages.platformMessageId })
      .from(telegramMessages)
      .where(eq(telegramMessages.platformMessageId, message.platformMessageId))
      .limit(1);
  } catch (error) {
    return {
      inserted: false,
      threadState: await loadTelegramThreadState(message.userId, message.threadKey),
      reason: 'error',
      errorMessage: error instanceof Error ? error.message : String(error),
    };
  }

  if (existing.length > 0) {
    return {
      inserted: false,
      threadState: await loadTelegramThreadState(message.userId, message.threadKey),
      reason: 'duplicate',
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
        incomingMessageCount: telegramThreads.incomingMessageCount,
        outgoingMessageCount: telegramThreads.outgoingMessageCount,
        lastIncomingAt: telegramThreads.lastIncomingAt,
        lastOutgoingAt: telegramThreads.lastOutgoingAt,
        lastPromoAt: telegramThreads.lastPromoAt,
        lastPromoMessageId: telegramThreads.lastPromoMessageId,
      })
      .from(telegramThreads)
      .where(and(eq(telegramThreads.userId, message.userId), eq(telegramThreads.threadKey, message.threadKey)))
      .limit(1);
    existingThread = threadRows[0];
  } catch {
    /* ignore */
  }

  const isIncoming = message.direction === 'incoming';
  const incomingCount = Number(existingThread?.incomingMessageCount || 0) + (isIncoming ? 1 : 0);
  const outgoingCount = Number(existingThread?.outgoingMessageCount || 0) + (isIncoming ? 0 : 1);
  const sentAtDate = new Date(message.sentAt);

  try {
    await db
      .insert(telegramThreads)
      .values({
        userId: message.userId,
        threadKey: message.threadKey,
        chatKind: message.messageKind,
        participantTelegramUserId: message.participantTelegramUserId,
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
        target: [telegramThreads.userId, telegramThreads.threadKey],
        set: {
          chatKind: message.messageKind,
          participantTelegramUserId: message.participantTelegramUserId,
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
    return {
      inserted: false,
      threadState: await loadTelegramThreadState(message.userId, message.threadKey),
      reason: 'error',
      errorMessage: error instanceof Error ? error.message : String(error),
    };
  }

  try {
    await db.insert(telegramMessages).values({
      userId: message.userId,
      threadKey: message.threadKey,
      platformMessageId: message.platformMessageId,
      messageKind: message.messageKind,
      direction: message.direction,
      senderTelegramUserId: message.senderTelegramUserId,
      recipientTelegramUserId: message.recipientTelegramUserId,
      chatId: message.chatId,
      messageText: message.messageText,
      sentAt: sentAtDate,
      rawPayload: message.rawPayload as Record<string, unknown>,
    });
  } catch (error) {
    return {
      inserted: false,
      threadState: await loadTelegramThreadState(message.userId, message.threadKey),
      reason: 'error',
      errorMessage: error instanceof Error ? error.message : String(error),
    };
  }

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

async function getRecentTelegramThreadMessages(
  userId: string,
  threadKey: string,
  excludePlatformMessageId: string
): Promise<Array<{ role: 'user' | 'assistant'; content: string }>> {
  const rows = await db
    .select({
      platformMessageId: telegramMessages.platformMessageId,
      direction: telegramMessages.direction,
      messageText: telegramMessages.messageText,
    })
    .from(telegramMessages)
    .where(and(eq(telegramMessages.userId, userId), eq(telegramMessages.threadKey, threadKey)))
    .orderBy(desc(telegramMessages.sentAt))
    .limit(20);

  return rows
    .filter(
      (row) =>
        row.platformMessageId !== excludePlatformMessageId &&
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

async function setTelegramThreadPromoState(userId: string, threadKey: string, platformMessageId: string) {
  await db
    .update(telegramThreads)
    .set({
      lastPromoAt: new Date(),
      lastPromoMessageId: platformMessageId,
      updatedAt: new Date(),
    })
    .where(and(eq(telegramThreads.userId, userId), eq(telegramThreads.threadKey, threadKey)));
}

export async function getDelayBoundsForTelegramUser(userId: string): Promise<{
  delayMin: number;
  delayMax: number;
}> {
  const persona = await getActivePersonaForUser(userId);
  return getDelayBoundsFromPersona(persona);
}

export async function processIncomingTelegram(input: TelegramOrchestrationInput): Promise<void> {
  const { inboundMessage, threadState, updateKind } = input;
  if (!inboundMessage.messageText || inboundMessage.direction !== 'incoming') {
    return;
  }

  const persona = await getActivePersonaForUser(inboundMessage.userId);
  if (!persona) {
    return;
  }

  const useProductLinkRules = updateKind === 'dm_private';
  const productDecision = useProductLinkRules
    ? decideProductLink({
        links: persona.productLinks,
        incomingMessageCount: threadState.incomingMessageCount,
        lastPromoAt: threadState.lastPromoAt,
        latestUserMessage: inboundMessage.messageText,
        now: new Date(),
      })
    : null;

  const promoInstruction =
    useProductLinkRules && productDecision
      ? productDecision.shouldSendPromo
        ? `Include exactly one short and natural recommendation with this URL: ${productDecision.selectedLink.url}. Action type: ${
            productDecision.selectedLink.actionType || 'buy'
          }.`
        : 'Do not include product links unless explicitly asked in the current message.'
      : 'Do not include product links unless explicitly asked in the current message.';

  const history = await getRecentTelegramThreadMessages(
    inboundMessage.userId,
    inboundMessage.threadKey,
    inboundMessage.platformMessageId
  );

  const subscriptionPlan = normalizePlan(await getUserPlan(inboundMessage.userId));
  const maxReplyChars = getPersonaReplyMaxChars(subscriptionPlan);

  const affordability = await canAffordEstimatedMessage(inboundMessage.userId);
  if (!affordability.allowed) {
    return;
  }

  const aiReply = await generateAiReply(
    buildSystemPrompt(persona, promoInstruction, 'telegram'),
    history,
    inboundMessage.messageText,
    { maxReplyChars }
  );

  const usageDebit = await recordUsageDebit({
    userId: inboundMessage.userId,
    igAccountId: 'telegram',
    threadKey: inboundMessage.threadKey,
    platformMessageId: `tg-ai-${inboundMessage.platformMessageId}`,
    model: aiReply.model,
    promptTokens: aiReply.promptTokens,
    completionTokens: aiReply.completionTokens,
    totalTokens: aiReply.totalTokens,
    apiCostMicros: aiReply.apiCostMicros,
    metadata: {
      source: 'processIncomingTelegram',
      updateKind,
    },
  });
  if (!usageDebit.ok) {
    return;
  }

  const sessionString = await getTelegramSessionStringForUser(inboundMessage.userId);
  if (!sessionString) {
    return;
  }

  const sent = await gramjsSendMessageAsUser({
    sessionString,
    peerId: inboundMessage.chatId,
    text: aiReply.replyText,
    replyToMsgId: inboundMessage.telegramMessageId,
  });

  const sentAt = new Date().toISOString();
  const outPlatformId = `out:${inboundMessage.chatId}:${sent.messageId}`;

  await recordTelegramMessage({
    userId: inboundMessage.userId,
    threadKey: inboundMessage.threadKey,
    platformMessageId: outPlatformId,
    messageKind: inboundMessage.messageKind,
    direction: 'outgoing',
    senderTelegramUserId: null,
    recipientTelegramUserId: inboundMessage.participantTelegramUserId,
    chatId: inboundMessage.chatId,
    messageText: aiReply.replyText,
    sentAt,
    rawPayload: { gramjs: { messageId: sent.messageId }, sourceMessageId: inboundMessage.platformMessageId },
    participantTelegramUserId: inboundMessage.participantTelegramUserId,
  });

  if (useProductLinkRules && productDecision?.shouldSendPromo) {
    await setTelegramThreadPromoState(inboundMessage.userId, inboundMessage.threadKey, outPlatformId);
  }
}

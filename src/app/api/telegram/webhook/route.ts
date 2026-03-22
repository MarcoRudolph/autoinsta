import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/drizzle';
import { telegramDmPending } from '@/drizzle/schema/telegram';
import { sendTelegramMessage } from '@/lib/telegram/botApi';
import {
  completeTelegramLink,
  extractLinkTokenFromStart,
  getTelegramIdentityByTelegramUserId,
  getTelegramOwnerForChat,
  recordTelegramMessage,
  type TelegramStoredMessageInput,
} from '@/lib/telegram/telegramPipeline';

export const runtime = 'nodejs';

const TelegramUserSchema = z.object({
  id: z.number(),
  username: z.string().optional(),
});

const ChatSchema = z.object({
  id: z.number(),
  type: z.string(),
});

const MessageSchema = z.object({
  message_id: z.number(),
  from: TelegramUserSchema.optional(),
  chat: ChatSchema,
  text: z.string().optional(),
  date: z.number().optional(),
});

const UpdateSchema = z.object({
  update_id: z.number(),
  message: MessageSchema.optional(),
  channel_post: MessageSchema.optional(),
});

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

export async function POST(request: NextRequest) {
  const expectedSecret = process.env.TELEGRAM_WEBHOOK_SECRET?.trim();
  if (expectedSecret) {
    const header = request.headers.get('x-telegram-bot-api-secret-token') ?? '';
    if (!timingSafeEqual(header, expectedSecret)) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const parsed = UpdateSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ ok: true });
  }

  const update = parsed.data;
  const msg = update.message ?? update.channel_post;
  if (!msg) {
    return NextResponse.json({ ok: true });
  }

  const chatIdStr = String(msg.chat.id);
  const fromId = msg.from ? String(msg.from.id) : null;
  const text = msg.text;
  const messageId = msg.message_id;

  const linkToken = extractLinkTokenFromStart(text);
  if (linkToken && fromId && msg.chat.type === 'private') {
    try {
      const result = await completeTelegramLink({
        token: linkToken,
        telegramUserId: fromId,
        telegramUsername: msg.from?.username ?? null,
        privateChatId: chatIdStr,
      });
      if (result.ok) {
        try {
          await sendTelegramMessage(
            chatIdStr,
            'Telegram wurde mit deinem Konto verbunden. Du kannst zum Dashboard zurückkehren.'
          );
        } catch (e) {
          console.error('[telegram/webhook] connect confirmation send failed', e);
        }
      } else {
        console.warn('[telegram/webhook] link failed', result.reason);
      }
    } catch (e) {
      console.error('[telegram/webhook] completeTelegramLink error', e);
    }
    return NextResponse.json({ ok: true });
  }

  if (!text || !text.trim()) {
    return NextResponse.json({ ok: true });
  }

  let ownerUserId: string | null = null;
  if (msg.chat.type === 'private' && fromId) {
    const ident = await getTelegramIdentityByTelegramUserId(fromId);
    ownerUserId = ident?.userId ?? null;
  } else {
    const chatOwner = await getTelegramOwnerForChat(chatIdStr);
    ownerUserId = chatOwner?.userId ?? null;
  }

  if (!ownerUserId) {
    return NextResponse.json({ ok: true });
  }

  const isChannelPost = Boolean(update.channel_post);
  const threadKey = isChannelPost
    ? `channel:${chatIdStr}`
    : msg.chat.type === 'private'
      ? `dm:${chatIdStr}`
      : `group:${chatIdStr}`;
  const messageKind = isChannelPost ? 'channel_post' : msg.chat.type === 'private' ? 'dm' : 'group';

  const platformMessageId = `${chatIdStr}:${messageId}`;
  const sentAtMs = (msg.date ?? Math.floor(Date.now() / 1000)) * 1000;

  const payload: TelegramStoredMessageInput = {
    userId: ownerUserId,
    threadKey,
    platformMessageId,
    messageKind,
    direction: 'incoming',
    senderTelegramUserId: fromId,
    recipientTelegramUserId: null,
    chatId: chatIdStr,
    messageText: text,
    sentAt: new Date(sentAtMs).toISOString(),
    rawPayload: update,
    participantTelegramUserId: fromId,
    telegramMessageId: messageId,
  };

  const { inserted, threadState } = await recordTelegramMessage(payload);
  if (!inserted) {
    return NextResponse.json({ ok: true });
  }

  const updateKind =
    msg.chat.type === 'private' ? 'dm_private' : isChannelPost ? 'channel_post' : 'group_message';

  try {
    await db.insert(telegramDmPending).values({
      userId: ownerUserId,
      threadKey,
      updateKind,
      inboundPayload: payload as unknown as Record<string, unknown>,
      threadState: threadState as unknown as Record<string, unknown>,
      status: 'pending',
    });
  } catch (error) {
    console.error('[telegram/webhook] enqueue pending failed', error);
  }

  return NextResponse.json({ ok: true });
}

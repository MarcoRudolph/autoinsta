/**
 * Long-running MTProto worker: receives Telegram user-account DMs and enqueues
 * rows in telegram_dm_pending (same shape as the former bot webhook).
 *
 * Run:
 *   POSTGRES_URL=... TELEGRAM_SESSION_SECRET=... TELEGRAM_API_ID=... TELEGRAM_API_HASH=... \
 *   APP_BASE_URL=https://your-app.com TELEGRAM_CRON_SECRET=... \
 *   npx tsx src/scripts/telegram-user-worker.ts
 */
import { createServer } from 'node:http';

import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { TelegramClient } from 'telegram';
import { NewMessage } from 'telegram/events';
import type { NewMessageEvent } from 'telegram/events';
import { StringSession } from 'telegram/sessions/StringSession.js';

import * as schema from '../drizzle/schema';
import { telegramDmPending, telegramUserSessions } from '../drizzle/schema/telegram';
import {
  recordTelegramMessage,
  type TelegramStoredMessageInput,
} from '../lib/telegram/telegramPipeline';
import { decryptSessionString } from '../lib/telegram/sessionCrypto';

function requireEnv(name: string): string {
  const v = process.env[name]?.trim();
  if (!v) throw new Error(`Missing env ${name}`);
  return v;
}

async function triggerProcessPending(): Promise<void> {
  const base = process.env.APP_BASE_URL?.replace(/\/$/, '');
  const secret =
    process.env.TELEGRAM_CRON_SECRET ||
    process.env.INSTAGRAM_CRON_SECRET ||
    process.env.CRON_SECRET;
  if (!base || !secret) return;
  try {
    await fetch(`${base}/api/telegram/process-pending`, {
      method: 'POST',
      headers: { 'x-cron-secret': secret },
    });
  } catch (e) {
    console.error('[telegram-worker] process-pending trigger failed', e);
  }
}

async function main(): Promise<void> {
  const connectionString = requireEnv('POSTGRES_URL');
  const apiId = Number(requireEnv('TELEGRAM_API_ID'));
  const apiHash = requireEnv('TELEGRAM_API_HASH');

  const portRaw = process.env.PORT?.trim();
  if (portRaw) {
    const port = Number(portRaw);
    if (Number.isFinite(port) && port > 0) {
      createServer((_req, res) => {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('ok');
      }).listen(port, '0.0.0.0', () => {
        console.log('[telegram-worker] health on', port);
      });
    }
  }

  const pool = new Pool({ connectionString });
  const db = drizzle(pool, { schema });

  const rows = await db
    .select()
    .from(telegramUserSessions)
    .where(eq(telegramUserSessions.status, 'connected'));

  const clients: TelegramClient[] = [];

  for (const row of rows) {
    if (!row.encryptedSession || !row.userId) continue;
    let sessionString: string;
    try {
      sessionString = decryptSessionString(row.encryptedSession);
    } catch (e) {
      console.error('[telegram-worker] decrypt failed for user', row.userId, e);
      continue;
    }

    const client = new TelegramClient(new StringSession(sessionString), apiId, apiHash, {
      connectionRetries: 10,
    });

    const appUserId = row.userId;

    client.addEventHandler(
      async (event: NewMessageEvent) => {
        if (!event.isPrivate) return;
        const msg = event.message;
        if (!msg || msg.out) return;
        const text = msg.text;
        if (!text || !String(text).trim()) return;

        const chatIdStr = String(event.chatId);
        const fromId = msg.senderId != null ? String(msg.senderId) : null;
        const messageId = Number(msg.id);

        const threadKey = `dm:${chatIdStr}`;
        const platformMessageId = `${chatIdStr}:${messageId}`;
        const sentAtMs = msg.date ? Number(msg.date) * 1000 : Date.now();

        const payload: TelegramStoredMessageInput = {
          userId: appUserId,
          threadKey,
          platformMessageId,
          messageKind: 'dm',
          direction: 'incoming',
          senderTelegramUserId: fromId,
          recipientTelegramUserId: null,
          chatId: chatIdStr,
          messageText: String(text),
          sentAt: new Date(sentAtMs).toISOString(),
          rawPayload: { gramjs: { id: messageId, chatId: chatIdStr } },
          participantTelegramUserId: fromId,
          telegramMessageId: messageId,
        };

        try {
          const { inserted, threadState } = await recordTelegramMessage(payload);
          if (!inserted) return;
          await db.insert(telegramDmPending).values({
            userId: appUserId,
            threadKey,
            updateKind: 'dm_private',
            inboundPayload: payload as unknown as Record<string, unknown>,
            threadState: threadState as unknown as Record<string, unknown>,
            status: 'pending',
          });
          void triggerProcessPending();
        } catch (e) {
          console.error('[telegram-worker] enqueue failed', appUserId, e);
        }
      },
      new NewMessage({ incoming: true })
    );

    await client.connect();
    if (!(await client.checkAuthorization())) {
      console.warn('[telegram-worker] session not authorized for user', appUserId);
      await client.disconnect();
      continue;
    }

    clients.push(client);
    console.log('[telegram-worker] listening as app user', appUserId);
  }

  if (clients.length === 0) {
    console.warn('[telegram-worker] no connected sessions; exiting');
    await pool.end();
    process.exit(0);
  }

  process.on('SIGINT', async () => {
    for (const c of clients) {
      try {
        await c.disconnect();
      } catch {
        /* ignore */
      }
    }
    await pool.end();
    process.exit(0);
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

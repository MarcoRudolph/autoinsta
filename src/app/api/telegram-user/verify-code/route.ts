import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/drizzle';
import { telegramUserSessions } from '@/drizzle/schema/telegram';
import { gramjsCompleteLogin } from '@/lib/telegram/gramjsUserClient';
import { encryptSessionString } from '@/lib/telegram/sessionCrypto';
import { requireAuthenticatedUser, validateRequestedUserId } from '@/lib/security/requestAuth';

export const runtime = 'nodejs';

const BodySchema = z.object({
  userId: z.string().min(1),
  phoneCode: z.string().min(3).max(12),
});

function getMissingTelegramEnv(): string[] {
  const required = ['TELEGRAM_API_ID', 'TELEGRAM_API_HASH', 'TELEGRAM_SESSION_SECRET'] as const;
  return required.filter((key) => !(process.env[key]?.trim()));
}

export async function POST(request: NextRequest) {
  const missingEnv = getMissingTelegramEnv();
  if (missingEnv.length > 0) {
    return NextResponse.json(
      { error: `Missing runtime env: ${missingEnv.join(', ')}` },
      { status: 500 }
    );
  }

  const auth = await requireAuthenticatedUser(request);
  if (auth.response) return auth.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid body', details: parsed.error.flatten() }, { status: 400 });
  }

  const { userId: requestedUserId, phoneCode } = parsed.data;
  const mismatch = validateRequestedUserId(requestedUserId, auth.userId);
  if (mismatch) return mismatch;
  const userId = auth.userId;

  const rows = await db
    .select()
    .from(telegramUserSessions)
    .where(eq(telegramUserSessions.userId, userId))
    .limit(1);
  const row = rows[0];
  if (!row || row.status !== 'awaiting_code' || !row.phoneNumber || !row.phoneCodeHash) {
    return NextResponse.json(
      { error: 'No pending login for this user. Request a new code first.' },
      { status: 400 }
    );
  }

  try {
    const login = await gramjsCompleteLogin({
      phoneNumber: row.phoneNumber,
      phoneCodeHash: row.phoneCodeHash,
      phoneCode,
    });

    if (row.intendedUsername) {
      const actual = login.telegramUsername;
      if (!actual || actual !== row.intendedUsername.toLowerCase()) {
        await db
          .update(telegramUserSessions)
          .set({
            status: 'error',
            lastError: 'telegram_username_mismatch',
            phoneCodeHash: null,
            updatedAt: new Date(),
          })
          .where(eq(telegramUserSessions.userId, userId));
        return NextResponse.json(
          {
            error:
              'The Telegram account you logged into does not match the username you entered. Use the same @username or leave username empty.',
          },
          { status: 400 }
        );
      }
    }

    const encrypted = encryptSessionString(login.sessionString);
    const now = new Date();

    await db
      .update(telegramUserSessions)
      .set({
        encryptedSession: encrypted,
        telegramUserId: login.telegramUserId,
        telegramUsername: login.telegramUsername,
        phoneCodeHash: null,
        status: 'connected',
        lastError: null,
        updatedAt: now,
      })
      .where(eq(telegramUserSessions.userId, userId));

    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    const lower = message.toLowerCase();
    if (lower.includes('password') || lower.includes('session_password_needed')) {
      return NextResponse.json(
        {
          error:
            'This account has two-factor authentication. Cloud login via SMS code alone is not supported yet; disable 2FA temporarily or contact support.',
        },
        { status: 422 }
      );
    }
    console.error('[telegram-user/verify-code]', message);
    await db
      .update(telegramUserSessions)
      .set({ lastError: message.slice(0, 500), updatedAt: new Date() })
      .where(eq(telegramUserSessions.userId, userId));
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

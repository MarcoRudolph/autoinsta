import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/drizzle';
import { telegramUserSessions } from '@/drizzle/schema/telegram';
import { gramjsSendLoginCode } from '@/lib/telegram/gramjsUserClient';
import { normalizeTelegramUsernameInput } from '@/lib/telegram/telegramUsername';

export const runtime = 'nodejs';

const BodySchema = z.object({
  userId: z.string().min(1),
  phoneNumber: z.string().min(8),
  telegramUsername: z.string().optional(),
});

function normalizePhone(raw: string): string | null {
  const digits = raw.replace(/[^\d+]/g, '');
  if (digits.length < 8) return null;
  return digits.startsWith('+') ? digits : `+${digits.replace(/^\+/, '')}`;
}

export async function POST(request: NextRequest) {
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

  const { userId, phoneNumber, telegramUsername: usernameRaw } = parsed.data;
  const phone = normalizePhone(phoneNumber);
  if (!phone) {
    return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 });
  }

  let intendedUsername: string | null = null;
  if (usernameRaw !== undefined && usernameRaw.trim().length > 0) {
    const u = normalizeTelegramUsernameInput(usernameRaw);
    if (!u) {
      return NextResponse.json({ error: 'Invalid Telegram username format' }, { status: 400 });
    }
    intendedUsername = u;
  }

  const existing = await db
    .select({ status: telegramUserSessions.status })
    .from(telegramUserSessions)
    .where(eq(telegramUserSessions.userId, userId))
    .limit(1);

  if (existing[0]?.status === 'connected') {
    return NextResponse.json({ error: 'Telegram is already connected for this account' }, { status: 409 });
  }

  try {
    const { phoneCodeHash } = await gramjsSendLoginCode(phone);
    const now = new Date();
    await db
      .insert(telegramUserSessions)
      .values({
        userId,
        phoneNumber: phone,
        phoneCodeHash,
        intendedUsername,
        status: 'awaiting_code',
        lastError: null,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: telegramUserSessions.userId,
        set: {
          phoneNumber: phone,
          phoneCodeHash,
          intendedUsername,
          encryptedSession: null,
          telegramUserId: null,
          telegramUsername: null,
          status: 'awaiting_code',
          lastError: null,
          updatedAt: now,
        },
      });

    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error('[telegram-user/request-code]', message);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

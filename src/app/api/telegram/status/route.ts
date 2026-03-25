import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/drizzle';
import { telegramUserSessions } from '@/drizzle/schema/telegram';
import { requireAuthenticatedUser, validateRequestedUserId } from '@/lib/security/requestAuth';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const auth = await requireAuthenticatedUser(request);
  if (auth.response) return auth.response;
  const mismatch = validateRequestedUserId(request.nextUrl.searchParams.get('userId'), auth.userId);
  if (mismatch) return mismatch;
  const userId = auth.userId;

  const rows = await db
    .select({
      telegramUserId: telegramUserSessions.telegramUserId,
      telegramUsername: telegramUserSessions.telegramUsername,
      status: telegramUserSessions.status,
    })
    .from(telegramUserSessions)
    .where(eq(telegramUserSessions.userId, userId))
    .limit(1);

  const row = rows[0];
  if (!row || row.status !== 'connected') {
    return NextResponse.json({ connected: false });
  }

  return NextResponse.json({
    connected: true,
    telegramUserId: row.telegramUserId,
    telegramUsername: row.telegramUsername,
  });
}

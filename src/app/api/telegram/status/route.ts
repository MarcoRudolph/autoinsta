import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/drizzle';
import { telegramUserSessions } from '@/drizzle/schema/telegram';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get('userId');
  if (!userId) {
    return NextResponse.json({ error: 'userId is required' }, { status: 400 });
  }

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

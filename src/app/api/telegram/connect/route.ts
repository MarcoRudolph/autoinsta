import { NextRequest, NextResponse } from 'next/server';
import { createTelegramLinkToken } from '@/lib/telegram/telegramPipeline';

export const runtime = 'nodejs';

/**
 * GET /api/telegram/connect?userId=<appUserId>
 * Redirects to t.me bot with start payload for linking (same pattern as Instagram auth redirect).
 */
export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get('userId');
  const botUsername = process.env.TELEGRAM_BOT_USERNAME?.replace(/^@/, '').trim();

  if (!userId) {
    return NextResponse.json({ error: 'userId is required' }, { status: 400 });
  }
  if (!botUsername) {
    return NextResponse.json({ error: 'TELEGRAM_BOT_USERNAME is not configured' }, { status: 500 });
  }

  const { token } = await createTelegramLinkToken(userId);
  const startParam = `link_${token}`;
  const url = new URL(`https://t.me/${botUsername}`);
  url.searchParams.set('start', startParam);

  return NextResponse.redirect(url.toString());
}

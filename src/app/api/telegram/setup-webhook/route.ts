import { NextRequest, NextResponse } from 'next/server';
import { registerTelegramWebhook } from '@/lib/telegram/webhookSetup';

export const runtime = 'nodejs';

/**
 * POST /api/telegram/setup-webhook
 * Registers Telegram setWebhook to this deployment. Protected by shared cron/setup secret.
 *
 * Headers: x-setup-secret or Authorization: Bearer <secret>
 * Body (optional JSON): { "webhookUrl": "https://..." , "dropPendingUpdates": false }
 *
 * Secret env (first match): TELEGRAM_SETUP_WEBHOOK_SECRET | TELEGRAM_CRON_SECRET | INSTAGRAM_CRON_SECRET | CRON_SECRET
 */
export async function POST(request: NextRequest) {
  const expected =
    process.env.TELEGRAM_SETUP_WEBHOOK_SECRET?.trim() ||
    process.env.TELEGRAM_CRON_SECRET?.trim() ||
    process.env.INSTAGRAM_CRON_SECRET?.trim() ||
    process.env.CRON_SECRET?.trim();

  const header =
    request.headers.get('x-setup-secret') ||
    request.headers.get('x-telegram-setup-secret') ||
    request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');

  if (!expected || header !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let webhookUrl: string | undefined;
  let dropPendingUpdates = false;
  try {
    const body = await request.json().catch(() => ({}));
    if (typeof body?.webhookUrl === 'string') webhookUrl = body.webhookUrl;
    if (body?.dropPendingUpdates === true) dropPendingUpdates = true;
  } catch {
    /* empty body */
  }

  const result = await registerTelegramWebhook({ webhookUrl, dropPendingUpdates });
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.description }, { status: 400 });
  }

  return NextResponse.json({ ok: true, url: result.url });
}

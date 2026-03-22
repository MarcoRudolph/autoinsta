import { NextRequest, NextResponse } from 'next/server';
import { and, eq } from 'drizzle-orm';
import { db } from '@/drizzle';
import { telegramIdentities } from '@/drizzle/schema/telegram';
import {
  fetchTelegramWebhookInfo,
  getExpectedWebhookUrl,
  getWebhookTargetBaseUrl,
  webhookInfoMatchesExpected,
} from '@/lib/telegram/webhookSetup';
import { getTelegramBotToken } from '@/lib/telegram/botApi';

export const runtime = 'nodejs';

/**
 * GET /api/telegram/integration-status?userId=<optional>
 * Read-only status for dashboard: bot token present, webhook URL vs expected, user link state.
 * Does not expose secrets.
 */
export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get('userId');

  const botConfigured = Boolean(getTelegramBotToken());
  const expectedBaseUrl = getWebhookTargetBaseUrl();
  const expectedWebhookUrl = getExpectedWebhookUrl();

  let userTelegramConnected = false;
  if (userId) {
    const rows = await db
      .select({ id: telegramIdentities.id })
      .from(telegramIdentities)
      .where(
        and(eq(telegramIdentities.userId, userId), eq(telegramIdentities.status, 'linked'))
      )
      .limit(1);
    userTelegramConnected = rows.length > 0;
  }

  if (!botConfigured) {
    return NextResponse.json({
      botConfigured: false,
      webhookRegistered: false,
      webhookUrl: null as string | null,
      webhookMatchesExpected: false,
      expectedWebhookUrl,
      expectedBaseUrl,
      pendingUpdateCount: 0,
      lastWebhookError: null as string | null,
      userTelegramConnected,
      hint: 'Set TELEGRAM_BOT_TOKEN on the server.',
    });
  }

  const infoRes = await fetchTelegramWebhookInfo();
  if (!infoRes.ok) {
    return NextResponse.json({
      botConfigured: true,
      webhookRegistered: false,
      webhookUrl: null as string | null,
      webhookMatchesExpected: false,
      expectedWebhookUrl,
      expectedBaseUrl,
      pendingUpdateCount: 0,
      lastWebhookError: infoRes.description,
      userTelegramConnected,
      hint: 'Could not read webhook info from Telegram.',
    });
  }

  const { matches, expectedUrl } = webhookInfoMatchesExpected(infoRes.info);
  const webhookUrl = infoRes.info.url || '';

  return NextResponse.json({
    botConfigured: true,
    webhookRegistered: Boolean(webhookUrl),
    webhookUrl: webhookUrl || null,
    webhookMatchesExpected: matches,
    expectedWebhookUrl: expectedUrl,
    expectedBaseUrl,
    pendingUpdateCount: infoRes.info.pendingUpdateCount ?? 0,
    lastWebhookError: infoRes.info.lastErrorMessage,
    userTelegramConnected,
    hint: !expectedBaseUrl
      ? 'Set NEXT_PUBLIC_APP_URL or TELEGRAM_WEBHOOK_BASE_URL so the app knows its public URL.'
      : !matches && webhookUrl
        ? 'Webhook points to a different URL than this deployment. Re-register from your host or POST /api/telegram/setup-webhook with the setup secret.'
        : !webhookUrl
          ? 'Webhook is not set. Enable TELEGRAM_AUTO_REGISTER_WEBHOOK or call POST /api/telegram/setup-webhook after deploy.'
          : null,
  });
}

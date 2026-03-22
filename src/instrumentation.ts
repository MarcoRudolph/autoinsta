/**
 * Runs once per server start / cold start (when enabled).
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */
export async function register(): Promise<void> {
  const enabled =
    process.env.TELEGRAM_AUTO_REGISTER_WEBHOOK === '1' ||
    process.env.TELEGRAM_AUTO_REGISTER_WEBHOOK === 'true';

  if (!enabled) return;

  if (!process.env.TELEGRAM_BOT_TOKEN?.trim()) {
    console.warn('[instrumentation] TELEGRAM_AUTO_REGISTER_WEBHOOK is set but TELEGRAM_BOT_TOKEN is missing');
    return;
  }

  try {
    const { registerTelegramWebhook } = await import('@/lib/telegram/webhookSetup');
    const result = await registerTelegramWebhook();
    if (result.ok) {
      console.log('[instrumentation] Telegram webhook registered:', result.url);
    } else {
      console.warn('[instrumentation] Telegram webhook registration failed:', result.description);
    }
  } catch (e) {
    console.error('[instrumentation] Telegram webhook registration error:', e);
  }
}

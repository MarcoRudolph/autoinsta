import openNextWorker from './.open-next/worker.js';

type EnvLike = Record<string, string | undefined>;

function resolveBaseUrl(env: EnvLike): string {
  const raw =
    env.NEXT_PUBLIC_SITE_URL ||
    env.NEXT_PUBLIC_APP_URL ||
    env.APP_BASE_URL ||
    'https://rudolpho-chat.de';
  return raw.endsWith('/') ? raw.slice(0, -1) : raw;
}

export default {
  async fetch(request: Request, env: EnvLike, ctx: ExecutionContext) {
    return openNextWorker.fetch(request, env, ctx);
  },

  async scheduled(event: ScheduledEvent, env: EnvLike, ctx: ExecutionContext) {
    const cronSecret = env.INSTAGRAM_CRON_SECRET || env.CRON_SECRET;
    if (!cronSecret) {
      console.error('[scheduled] Missing INSTAGRAM_CRON_SECRET/CRON_SECRET; skipping process-pending trigger');
      return;
    }

    const baseUrl = resolveBaseUrl(env);
    const url = `${baseUrl}/api/instagram/process-pending`;

    ctx.waitUntil(
      (async () => {
        try {
          const response = await fetch(url, {
            method: 'POST',
            headers: {
              'x-cron-secret': cronSecret,
              'user-agent': 'cloudflare-scheduled-instagram-processor',
            },
          });
          const body = await response.text();
          console.log('[scheduled] process-pending response', {
            schedule: event.cron,
            status: response.status,
            ok: response.ok,
            body: body.slice(0, 500),
          });
        } catch (error) {
          console.error('[scheduled] process-pending request failed', {
            schedule: event.cron,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      })()
    );
  },
};


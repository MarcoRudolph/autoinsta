import { getTelegramBotToken } from './botApi';

const WEBHOOK_PATH = '/api/telegram/webhook';

/** Update types the app handles (reduces payload size vs default). */
const ALLOWED_UPDATES = [
  'message',
  'channel_post',
  'edited_message',
  'edited_channel_post',
] as const;

export type TelegramWebhookInfo = {
  url: string;
  hasCustomCertificate: boolean;
  pendingUpdateCount: number;
  lastErrorDate: number | null;
  lastErrorMessage: string | null;
  maxConnections: number | null;
  allowedUpdates: string[] | null;
};

/**
 * Public base URL for the app (no trailing slash), used to build the webhook URL.
 * Priority: TELEGRAM_WEBHOOK_BASE_URL → NEXT_PUBLIC_APP_URL → https://VERCEL_URL
 */
export function getWebhookTargetBaseUrl(): string | null {
  const explicit =
    process.env.TELEGRAM_WEBHOOK_BASE_URL?.trim() || process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (explicit) {
    try {
      const u = new URL(explicit.startsWith('http') ? explicit : `https://${explicit}`);
      return `${u.protocol}//${u.host}`;
    } catch {
      return null;
    }
  }
  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) {
    const host = vercel.replace(/^https?:\/\//, '').replace(/\/$/, '');
    return `https://${host}`;
  }
  return null;
}

export function getExpectedWebhookUrl(): string | null {
  const base = getWebhookTargetBaseUrl();
  if (!base) return null;
  return `${base.replace(/\/$/, '')}${WEBHOOK_PATH}`;
}

type SetWebhookApiResponse = {
  ok?: boolean;
  description?: string;
  result?: boolean;
};

type GetWebhookInfoApiResponse = {
  ok?: boolean;
  description?: string;
  result?: TelegramWebhookInfo;
};

export async function registerTelegramWebhook(options?: {
  /** Override URL (must still end with webhook path or be full webhook URL). */
  webhookUrl?: string;
  dropPendingUpdates?: boolean;
}): Promise<{ ok: true; url: string } | { ok: false; description: string }> {
  const token = getTelegramBotToken();
  if (!token) {
    return { ok: false, description: 'TELEGRAM_BOT_TOKEN is not set' };
  }

  let url =
    options?.webhookUrl?.trim() ||
    getExpectedWebhookUrl() ||
    null;
  if (!url) {
    return {
      ok: false,
      description:
        'Cannot derive webhook URL. Set TELEGRAM_WEBHOOK_BASE_URL or NEXT_PUBLIC_APP_URL, or deploy on Vercel (VERCEL_URL).',
    };
  }

  if (!url.includes('/api/telegram/webhook')) {
    url = `${url.replace(/\/$/, '')}${WEBHOOK_PATH}`;
  }

  const secret = process.env.TELEGRAM_WEBHOOK_SECRET?.trim();
  const body: Record<string, unknown> = {
    url,
    allowed_updates: [...ALLOWED_UPDATES],
  };
  if (secret) {
    if (!/^[\w-]+$/.test(secret)) {
      return {
        ok: false,
        description:
          'TELEGRAM_WEBHOOK_SECRET may only contain A–Z, a–z, 0–9, underscore, and hyphen (Telegram API requirement).',
      };
    }
    body.secret_token = secret;
  }
  if (options?.dropPendingUpdates) {
    body.drop_pending_updates = true;
  }

  const res = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = (await res.json()) as SetWebhookApiResponse;
  if (data.ok && data.result === true) {
    return { ok: true, url };
  }
  return { ok: false, description: data.description || `HTTP ${res.status}` };
}

export async function fetchTelegramWebhookInfo(): Promise<
  { ok: true; info: TelegramWebhookInfo } | { ok: false; description: string }
> {
  const token = getTelegramBotToken();
  if (!token) {
    return { ok: false, description: 'TELEGRAM_BOT_TOKEN is not set' };
  }

  const res = await fetch(`https://api.telegram.org/bot${token}/getWebhookInfo`);
  const data = (await res.json()) as GetWebhookInfoApiResponse;
  if (data.ok && data.result) {
    return { ok: true, info: data.result };
  }
  return { ok: false, description: data.description || 'getWebhookInfo failed' };
}

export function webhookInfoMatchesExpected(info: TelegramWebhookInfo): {
  matches: boolean;
  expectedUrl: string | null;
} {
  const expected = getExpectedWebhookUrl();
  if (!expected) {
    return { matches: false, expectedUrl: null };
  }
  const current = (info.url || '').trim();
  if (!current) {
    return { matches: false, expectedUrl: expected };
  }
  try {
    const a = new URL(expected);
    const b = new URL(current);
    const matches =
      a.protocol === b.protocol && a.host === b.host && a.pathname.replace(/\/$/, '') === b.pathname.replace(/\/$/, '');
    return { matches, expectedUrl: expected };
  } catch {
    return { matches: expected === current, expectedUrl: expected };
  }
}

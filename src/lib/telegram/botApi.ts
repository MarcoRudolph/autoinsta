const TELEGRAM_API = 'https://api.telegram.org';

export type TelegramSendMessageResult = {
  messageId: number;
  raw: unknown;
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function getTelegramBotToken(): string | null {
  const t = process.env.TELEGRAM_BOT_TOKEN;
  return t && t.trim().length > 0 ? t.trim() : null;
}

export async function telegramApiCall<T>(
  method: string,
  body: Record<string, unknown>
): Promise<{ ok: true; result: T } | { ok: false; description: string; errorCode?: number; retryAfter?: number }> {
  const token = getTelegramBotToken();
  if (!token) {
    return { ok: false, description: 'TELEGRAM_BOT_TOKEN is not configured' };
  }

  const url = `${TELEGRAM_API}/bot${token}/${method}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const payload = (await response.json()) as {
    ok?: boolean;
    result?: T;
    description?: string;
    error_code?: number;
    parameters?: { retry_after?: number };
  };

  if (payload.ok && payload.result !== undefined) {
    return { ok: true, result: payload.result };
  }

  const retryAfter = payload.parameters?.retry_after;
  return {
    ok: false,
    description: payload.description || `HTTP ${response.status}`,
    errorCode: payload.error_code,
    retryAfter: typeof retryAfter === 'number' ? retryAfter : undefined,
  };
}

export async function sendTelegramMessage(
  chatId: string | number,
  text: string,
  options?: { replyToMessageId?: number; parseMode?: 'HTML' | 'Markdown' | 'MarkdownV2' }
): Promise<TelegramSendMessageResult> {
  const body: Record<string, unknown> = {
    chat_id: chatId,
    text,
  };
  if (options?.replyToMessageId !== undefined) {
    body.reply_to_message_id = options.replyToMessageId;
  }
  if (options?.parseMode) {
    body.parse_mode = options.parseMode;
  }

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const res = await telegramApiCall<{ message_id?: number }>('sendMessage', body);
    if (res.ok && typeof res.result?.message_id === 'number') {
      return { messageId: res.result.message_id, raw: res.result };
    }
    if (!res.ok && attempt < 2) {
      const waitMs =
        res.retryAfter !== undefined
          ? Math.min(10_000, (res.retryAfter + 1) * 1000)
          : 500 * (attempt + 1);
      await sleep(waitMs);
      continue;
    }
    throw new Error(res.ok ? 'Telegram sendMessage: missing message_id' : res.description);
  }

  throw new Error('Telegram sendMessage failed after retries');
}

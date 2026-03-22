const TELEGRAM_USERNAME_RE = /^[a-zA-Z0-9_]{5,32}$/;

/**
 * Normalizes user input: trim, strip leading @, lowercase. Returns null if invalid.
 */
export function normalizeTelegramUsernameInput(raw: string): string | null {
  const s = raw.trim().replace(/^@+/, '').toLowerCase();
  if (!s || !TELEGRAM_USERNAME_RE.test(s)) return null;
  return s;
}

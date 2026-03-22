export function getTelegramApiCredentials(): { apiId: number; apiHash: string } {
  const apiIdRaw = process.env.TELEGRAM_API_ID?.trim();
  const apiHash = process.env.TELEGRAM_API_HASH?.trim();
  if (!apiIdRaw || !apiHash) {
    throw new Error('TELEGRAM_API_ID and TELEGRAM_API_HASH must be set (from https://my.telegram.org)');
  }
  const apiId = Number(apiIdRaw);
  if (!Number.isFinite(apiId) || apiId <= 0) {
    throw new Error('TELEGRAM_API_ID must be a positive number');
  }
  return { apiId, apiHash };
}

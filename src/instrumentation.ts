/**
 * Next.js instrumentation hook (see next.config.js).
 * Telegram bot webhook auto-registration was removed; MTProto uses a separate worker process.
 */
export async function register(): Promise<void> {
  // Intentionally empty.
}

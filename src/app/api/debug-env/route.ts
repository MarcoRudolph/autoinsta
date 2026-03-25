import { NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { resolvePostgresUrl } from '@/drizzle';
import { requireInternalApiKey } from '@/lib/security/internalApiAuth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Diagnostic endpoint to verify POSTGRES_URL is available at runtime.
 * Returns only booleans (no values) so it can be used in production for troubleshooting.
 */
export async function GET(request: Request) {
  const authError = requireInternalApiKey(
    request,
    {
      secrets: [process.env.INTERNAL_API_SECRET, process.env.ADMIN_SECRET],
      context: 'debug',
    }
  );
  if (authError) return authError;

  let hasBindingPostgresUrl = false;
  try {
    const env = getCloudflareContext().env as Record<string, unknown> | undefined;
    hasBindingPostgresUrl =
      typeof env?.POSTGRES_URL === 'string' && env.POSTGRES_URL.length > 0;
  } catch {
    // getCloudflareContext may throw outside Worker runtime
  }

  const hasProcessEnvPostgresUrl =
    typeof process.env.POSTGRES_URL === 'string' && process.env.POSTGRES_URL.length > 0;
  const resolved = resolvePostgresUrl();

  return NextResponse.json({
    hasProcessEnvPostgresUrl,
    hasBindingPostgresUrl,
    hasResolvedPostgresUrl: resolved !== null,
  });
}

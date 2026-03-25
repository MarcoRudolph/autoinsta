import { NextResponse } from 'next/server';

type GuardOptions = {
  secrets: Array<string | null | undefined>;
  context: string;
};

function normalizeSecret(v: string | null | undefined): string | null {
  const s = v?.trim();
  return s ? s : null;
}

function readProvidedSecret(request: Request): string | null {
  const headerSecret =
    request.headers.get('x-internal-api-key') ||
    request.headers.get('x-debug-key') ||
    request.headers.get('x-admin-secret');
  const bearerSecret = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') || null;
  const querySecret = new URL(request.url).searchParams.get('key');
  return normalizeSecret(headerSecret || bearerSecret || querySecret);
}

export function requireInternalApiKey(
  request: Request,
  options: GuardOptions
): NextResponse | null {
  const configuredSecrets = options.secrets.map(normalizeSecret).filter((s): s is string => Boolean(s));
  const isProduction = process.env.NODE_ENV === 'production';

  if (configuredSecrets.length === 0) {
    if (isProduction) {
      return NextResponse.json(
        { error: `Forbidden: ${options.context} secret is not configured` },
        { status: 403 }
      );
    }
    return null;
  }

  const providedSecret = readProvidedSecret(request);
  if (!providedSecret || !configuredSecrets.includes(providedSecret)) {
    return NextResponse.json(
      { error: `Forbidden: invalid ${options.context} key` },
      { status: 403 }
    );
  }

  return null;
}

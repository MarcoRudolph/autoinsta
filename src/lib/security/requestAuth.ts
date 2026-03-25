import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { getSupabaseServerConfig } from '@/lib/supabase/serverConfig';

type AuthResult =
  | { userId: string; response?: never }
  | { userId?: never; response: NextResponse };

function extractBearerToken(request: Request): string | null {
  const authHeader = request.headers.get('authorization') || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  return token.length > 0 ? token : null;
}

export async function requireAuthenticatedUser(request: Request): Promise<AuthResult> {
  const token = extractBearerToken(request);
  if (!token) {
    return { response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }

  const config = getSupabaseServerConfig();
  if (!config) {
    return {
      response: NextResponse.json({ error: 'Server auth configuration missing' }, { status: 500 }),
    };
  }

  const supabase = createClient(config.url, config.anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user?.id) {
    return { response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }

  return { userId: data.user.id };
}

export function validateRequestedUserId(
  requestedUserId: string | null | undefined,
  authenticatedUserId: string
): NextResponse | null {
  if (!requestedUserId) return null;
  if (requestedUserId !== authenticatedUserId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  return null;
}

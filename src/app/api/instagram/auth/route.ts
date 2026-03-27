import { NextRequest, NextResponse } from 'next/server';
import { encodeOAuthState } from '@/lib/oauth/state';
import { requireAuthenticatedUser, validateRequestedUserId } from '@/lib/security/requestAuth';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const auth = await requireAuthenticatedUser(request);
  if (auth.response) return auth.response;

  const clientId =
    process.env.INSTAGRAM_APP_ID ||
    process.env.NEXT_PUBLIC_INSTAGRAM_CLIENT_ID ||
    process.env.INSTAGRAM_CLIENT_ID ||
    process.env.META_APP_ID ||
    process.env.FACEBOOK_APP_ID;
  const requestOrigin = new URL(request.url).origin;
  const requestedUserId = request.nextUrl.searchParams.get('userId');
  const mismatch = validateRequestedUserId(requestedUserId, auth.userId);
  if (mismatch) return mismatch;

  if (!clientId) {
    return NextResponse.json({ error: 'Instagram Login OAuth is not configured' }, { status: 500 });
  }

  const redirectUri = `${requestOrigin}/api/instagram/callback`;
  const scopes = [
    'instagram_business_basic',
    'instagram_business_manage_messages',
    'instagram_business_manage_comments',
    'instagram_business_content_publish',
  ];

  // Primary path: direct Instagram login.
  const url = new URL('https://www.instagram.com/oauth/authorize');
  url.searchParams.append('client_id', clientId);
  url.searchParams.append('redirect_uri', redirectUri);
  url.searchParams.append('response_type', 'code');
  url.searchParams.append('scope', scopes.join(','));
  url.searchParams.append('force_reauth', 'true');
  const state = encodeOAuthState({
    flow: 'instagram_login',
    userId: auth.userId,
  });
  url.searchParams.append('state', state);

  const responseMode = request.nextUrl.searchParams.get('mode');
  if (responseMode === 'json') {
    return NextResponse.json({ redirectUrl: url.toString() });
  }

  return NextResponse.redirect(url.toString());
}

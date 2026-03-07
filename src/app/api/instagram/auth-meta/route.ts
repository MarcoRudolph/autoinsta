import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const clientId =
    process.env.META_APP_ID ||
    process.env.FACEBOOK_APP_ID ||
    process.env.NEXT_PUBLIC_INSTAGRAM_CLIENT_ID ||
    process.env.INSTAGRAM_CLIENT_ID;
  const requestOrigin = new URL(request.url).origin;

  if (!clientId) {
    return NextResponse.json({ error: 'Meta Business OAuth is not configured' }, { status: 500 });
  }

  const redirectUri = `${requestOrigin}/api/instagram/callback`;
  const scopes = [
    'pages_show_list',
    'business_management',
    'pages_messaging',
    'instagram_basic',
    'instagram_manage_messages',
    'instagram_manage_comments',
    'pages_read_engagement',
    'pages_manage_metadata',
  ];

  const url = new URL('https://www.facebook.com/v23.0/dialog/oauth');
  url.searchParams.append('client_id', clientId);
  url.searchParams.append('redirect_uri', redirectUri);
  url.searchParams.append('response_type', 'code');
  url.searchParams.append('scope', scopes.join(','));
  url.searchParams.append('state', 'meta_business_login');

  return NextResponse.redirect(url.toString());
}

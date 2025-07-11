import { NextResponse } from 'next/server';

export async function GET() {
  const clientId = process.env.INSTAGRAM_CLIENT_ID;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  if (!clientId || !baseUrl) {
    return NextResponse.json({ error: 'Instagram OAuth not configured' }, { status: 500 });
  }

  const redirectUri = `${baseUrl}/api/instagram/callback`;
  const url = new URL('https://api.instagram.com/oauth/authorize');
  url.searchParams.append('client_id', clientId);
  url.searchParams.append('redirect_uri', redirectUri);
  url.searchParams.append('scope', 'user_profile,user_media');
  url.searchParams.append('response_type', 'code');

  return NextResponse.redirect(url.toString());
}

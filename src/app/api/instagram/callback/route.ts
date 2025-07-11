import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code');
  const clientId = process.env.INSTAGRAM_CLIENT_ID;
  const clientSecret = process.env.INSTAGRAM_CLIENT_SECRET;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  if (!clientId || !clientSecret || !baseUrl) {
    return NextResponse.redirect('/dashboard?instagramConnected=false');
  }

  if (!code) {
    return NextResponse.redirect('/dashboard?instagramConnected=false');
  }

  const redirectUri = `${baseUrl}/api/instagram/callback`;

  try {
    const tokenRes = await fetch('https://api.instagram.com/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
        code,
      }),
    });

    const tokenData = await tokenRes.json();
    if ('access_token' in tokenData) {
      const response = NextResponse.redirect('/dashboard?instagramConnected=true');
      response.cookies.set('ig_access_token', tokenData.access_token, { httpOnly: true, path: '/' });
      return response;
    }
  } catch {
    // ignore errors
  }

  return NextResponse.redirect('/dashboard?instagramConnected=false');
}

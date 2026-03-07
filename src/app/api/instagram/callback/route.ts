import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

type MetaTokenResponse = {
  access_token?: string;
  token_type?: string;
  expires_in?: number;
  error?: {
    message?: string;
    type?: string;
    code?: number;
    fbtrace_id?: string;
  };
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const oauthError = searchParams.get('error');
  const oauthErrorReason = searchParams.get('error_description') || searchParams.get('error_reason');

  // Use callback request origin so local testing redirects back correctly.
  const normalizedSiteUrl = new URL(request.url).origin;

  if (oauthError) {
    const errorMessage = encodeURIComponent(oauthErrorReason || oauthError);
    return NextResponse.redirect(
      new URL(`/dashboard?instagramConnected=false&instagramError=${errorMessage}`, normalizedSiteUrl)
    );
  }

  if (!code) {
    return NextResponse.redirect(
      new URL('/dashboard?instagramConnected=false&instagramError=Missing authorization code', normalizedSiteUrl)
    );
  }

  const redirectUri = `${normalizedSiteUrl}/api/instagram/callback`;

  const isMetaBusinessFlow = state === 'meta_business_login';
  const isInstagramLoginFlow = state === 'instagram_login' || !state;

  try {
    if (isMetaBusinessFlow) {
      const clientId =
        process.env.META_APP_ID ||
        process.env.FACEBOOK_APP_ID ||
        process.env.NEXT_PUBLIC_INSTAGRAM_CLIENT_ID ||
        process.env.INSTAGRAM_CLIENT_ID;
      const clientSecret = process.env.META_APP_SECRET || process.env.FACEBOOK_APP_SECRET;

      if (!clientId || !clientSecret) {
        return NextResponse.redirect(
          new URL(
            '/dashboard?instagramConnected=false&instagramError=Missing Meta app credentials',
            normalizedSiteUrl
          )
        );
      }

      const tokenUrl = new URL('https://graph.facebook.com/v23.0/oauth/access_token');
      tokenUrl.searchParams.append('client_id', clientId);
      tokenUrl.searchParams.append('client_secret', clientSecret);
      tokenUrl.searchParams.append('redirect_uri', redirectUri);
      tokenUrl.searchParams.append('code', code);

      const tokenResponse = await fetch(tokenUrl.toString(), { method: 'GET' });
      const tokenData = (await tokenResponse.json()) as MetaTokenResponse;

      if (!tokenResponse.ok || !tokenData.access_token) {
        const apiError = tokenData.error?.message || 'Meta token exchange failed';
        return NextResponse.redirect(
          new URL(
            `/dashboard?instagramConnected=false&instagramError=${encodeURIComponent(apiError)}`,
            normalizedSiteUrl
          )
        );
      }

      const accountResponse = await fetch(
        `https://graph.facebook.com/v23.0/me/accounts?fields=id,name,instagram_business_account{id,username}&access_token=${encodeURIComponent(
          tokenData.access_token
        )}`,
        { method: 'GET' }
      );

      if (!accountResponse.ok) {
        return NextResponse.redirect(
          new URL(
            '/dashboard?instagramConnected=false&instagramError=Unable to read connected pages/accounts',
            normalizedSiteUrl
          )
        );
      }
    } else if (isInstagramLoginFlow) {
      const clientId =
        process.env.INSTAGRAM_APP_ID ||
        process.env.NEXT_PUBLIC_INSTAGRAM_CLIENT_ID ||
        process.env.INSTAGRAM_CLIENT_ID ||
        process.env.META_APP_ID ||
        process.env.FACEBOOK_APP_ID;
      const clientSecret =
        process.env.INSTAGRAM_APP_SECRET ||
        process.env.META_APP_SECRET ||
        process.env.FACEBOOK_APP_SECRET;

      if (!clientId || !clientSecret) {
        return NextResponse.redirect(
          new URL(
            '/dashboard?instagramConnected=false&instagramError=Missing Instagram app credentials',
            normalizedSiteUrl
          )
        );
      }

      const formBody = new URLSearchParams();
      formBody.append('client_id', clientId);
      formBody.append('client_secret', clientSecret);
      formBody.append('grant_type', 'authorization_code');
      formBody.append('redirect_uri', redirectUri);
      formBody.append('code', code);

      const tokenResponse = await fetch('https://api.instagram.com/oauth/access_token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formBody.toString(),
      });

      const tokenData = (await tokenResponse.json()) as MetaTokenResponse;
      if (!tokenResponse.ok || !tokenData.access_token) {
        const apiError = tokenData.error?.message || 'Instagram token exchange failed';
        return NextResponse.redirect(
          new URL(
            `/dashboard?instagramConnected=false&instagramError=${encodeURIComponent(apiError)}`,
            normalizedSiteUrl
          )
        );
      }
    } else {
      return NextResponse.redirect(
        new URL(
          '/dashboard?instagramConnected=false&instagramError=Unsupported login state',
          normalizedSiteUrl
        )
      );
    }

    return NextResponse.redirect(new URL('/dashboard?instagramConnected=true', normalizedSiteUrl));
  } catch {
    return NextResponse.redirect(
      new URL('/dashboard?instagramConnected=false&instagramError=Unexpected callback error', normalizedSiteUrl)
    );
  }
}

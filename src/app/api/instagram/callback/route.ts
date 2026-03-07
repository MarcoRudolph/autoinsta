import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';

type MetaTokenResponse = {
  access_token?: string;
  token_type?: string;
  expires_in?: number;
  user_id?: number | string;
  error?: {
    message?: string;
    type?: string;
    code?: number;
    fbtrace_id?: string;
  };
};

type MetaAccountListResponse = {
  data?: Array<{
    id?: string;
    name?: string;
    access_token?: string;
    instagram_business_account?: {
      id?: string;
      username?: string;
    };
  }>;
};

type OAuthState = {
  flow?: string;
  userId?: string | null;
};

function decodeState(rawState: string | null): OAuthState {
  if (!rawState) return {};
  if (rawState === 'instagram_login' || rawState === 'meta_business_login') {
    return { flow: rawState };
  }

  try {
    const normalized = rawState.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
    const parsed = JSON.parse(atob(padded)) as OAuthState;
    return parsed;
  } catch {
    return { flow: rawState };
  }
}

function createAdminSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) return null;
  return createClient(supabaseUrl, serviceRoleKey);
}

async function upsertInstagramConnection(input: {
  igAccountId: string;
  igUsername?: string | null;
  accessToken?: string | null;
  expiresInSeconds?: number;
  provider: 'instagram_login' | 'meta_business';
  userId?: string | null;
}) {
  const supabase = createAdminSupabaseClient();
  if (!supabase) return;

  const tokenExpiresAt =
    typeof input.expiresInSeconds === 'number'
      ? new Date(Date.now() + input.expiresInSeconds * 1000).toISOString()
      : null;

  await supabase.from('instagram_connections').upsert(
    {
      ig_account_id: input.igAccountId,
      ig_username: input.igUsername || null,
      access_token: input.accessToken || null,
      token_expires_at: tokenExpiresAt,
      provider: input.provider,
      user_id: input.userId || null,
      status: 'connected',
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'ig_account_id' }
  );
}

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

  const parsedState = decodeState(state);
  const flow = parsedState.flow;
  const flowUserId = parsedState.userId || null;
  const isMetaBusinessFlow = flow === 'meta_business_login';
  const isInstagramLoginFlow = flow === 'instagram_login' || !flow;

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

      const accountData = (await accountResponse.json()) as MetaAccountListResponse;
      const firstConnected = accountData.data?.find((page) => page.instagram_business_account?.id);

      if (firstConnected?.instagram_business_account?.id) {
        await upsertInstagramConnection({
          igAccountId: firstConnected.instagram_business_account.id,
          igUsername: firstConnected.instagram_business_account.username || null,
          accessToken: firstConnected.access_token || tokenData.access_token,
          expiresInSeconds: tokenData.expires_in,
          provider: 'meta_business',
          userId: flowUserId,
        });
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

      const igAccountId = tokenData.user_id ? String(tokenData.user_id) : null;
      if (igAccountId) {
        await upsertInstagramConnection({
          igAccountId,
          accessToken: tokenData.access_token,
          expiresInSeconds: tokenData.expires_in,
          provider: 'instagram_login',
          userId: flowUserId,
        });
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

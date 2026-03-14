import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db, resolvePostgresUrl } from '@/drizzle';
import { instagramConnections } from '@/drizzle/schema/instagram';
import { decodeOAuthState } from '@/lib/oauth/state';

export const runtime = 'nodejs';

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

function extractApiErrorMessage(payload: unknown, fallback: string): string {
  if (!payload || typeof payload !== 'object') return fallback;
  const record = payload as Record<string, unknown>;
  const nestedError =
    record.error && typeof record.error === 'object' ? (record.error as Record<string, unknown>) : null;

  const candidates = [
    nestedError?.message,
    record.error_message,
    record.error_description,
    record.message,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim().length > 0) {
      return candidate;
    }
  }

  return fallback;
}

async function parseJsonOrNull(response: Response): Promise<unknown> {
  const raw = await response.text();
  if (!raw) return null;
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}

function decodeState(rawState: string | null): OAuthState {
  if (!rawState) return {};
  if (rawState === 'instagram_login' || rawState === 'meta_business_login') {
    return { flow: rawState };
  }

  try {
    const parsed = decodeOAuthState<OAuthState>(rawState);
    return parsed;
  } catch {
    return { flow: rawState };
  }
}

async function subscribeInstagramAccountToApp(input: {
  igAccountId: string;
  accessToken: string;
}): Promise<{ ok: boolean; status?: number; error?: string }> {
  try {
    const response = await fetch(
      `https://graph.facebook.com/v23.0/${encodeURIComponent(input.igAccountId)}/subscribed_apps?access_token=${encodeURIComponent(
        input.accessToken
      )}`,
      { method: 'POST' }
    );

    const bodyText = await response.text();
    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        error: bodyText.slice(0, 1000),
      };
    }

    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function upsertInstagramConnection(input: {
  igAccountId: string;
  igUsername?: string | null;
  accessToken?: string | null;
  expiresInSeconds?: number;
  provider: 'instagram_login' | 'meta_business';
  userId?: string | null;
}) {
  const tokenExpiresAt =
    typeof input.expiresInSeconds === 'number' ? new Date(Date.now() + input.expiresInSeconds * 1000) : null;

  await db
    .insert(instagramConnections)
    .values({
      igAccountId: input.igAccountId,
      igUsername: input.igUsername || null,
      accessToken: input.accessToken || null,
      tokenExpiresAt,
      provider: input.provider,
      userId: input.userId || null,
      status: 'connected',
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: instagramConnections.igAccountId,
      set: {
        igUsername: input.igUsername || null,
        accessToken: input.accessToken || null,
        tokenExpiresAt,
        provider: input.provider,
        userId: input.userId || null,
        status: 'connected',
        updatedAt: new Date(),
      },
    });

  const saved = await db
    .select({ igAccountId: instagramConnections.igAccountId })
    .from(instagramConnections)
    .where(eq(instagramConnections.igAccountId, input.igAccountId))
    .limit(1);

  if (saved.length === 0) {
    throw new Error(`Failed to persist instagram connection for account ${input.igAccountId}`);
  }
}

export async function GET(request: NextRequest) {
  try {
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

    if (!resolvePostgresUrl()) {
      console.error('Instagram callback: POSTGRES_URL not resolved (process.env or Cloudflare bindings)');
      return NextResponse.redirect(
        new URL(
          '/dashboard?instagramConnected=false&instagramError=Database not configured (POSTGRES_URL missing)',
          normalizedSiteUrl
        )
      );
    }

    const parsedState = decodeState(state);
    const flow = parsedState.flow;
    const flowUserId = parsedState.userId || null;
    const isMetaBusinessFlow = flow === 'meta_business_login';
    const isInstagramLoginFlow = flow === 'instagram_login' || !flow;
    let webhookSubscriptionFailed = false;

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
      const tokenPayload = await parseJsonOrNull(tokenResponse);
      const tokenData = (tokenPayload ?? {}) as MetaTokenResponse;

      if (!tokenResponse.ok || !tokenData.access_token) {
        const apiError = extractApiErrorMessage(tokenPayload, 'Meta token exchange failed');
        console.error('Meta token exchange failed', {
          status: tokenResponse.status,
          apiError,
        });
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
        const connectionToken = firstConnected.access_token || tokenData.access_token;
        try {
          await upsertInstagramConnection({
            igAccountId: firstConnected.instagram_business_account.id,
            igUsername: firstConnected.instagram_business_account.username || null,
            accessToken: connectionToken,
            expiresInSeconds: tokenData.expires_in,
            provider: 'meta_business',
            userId: flowUserId,
          });
        } catch (error) {
          const err = error instanceof Error ? error : new Error(String(error));
          const dbError = error as { code?: string; detail?: string };
          console.error('Instagram connection failed: Database write failed while linking Instagram account', {
            flow: 'meta_business',
            igAccountId: firstConnected.instagram_business_account.id,
            userId: flowUserId,
            error: err.message,
            code: dbError?.code,
            detail: dbError?.detail,
            stack: err.stack,
          });
          return NextResponse.redirect(
            new URL(
              '/dashboard?instagramConnected=false&instagramError=Database write failed while linking Instagram account',
              normalizedSiteUrl
            )
          );
        }

        if (connectionToken) {
          const subscriptionResult = await subscribeInstagramAccountToApp({
            igAccountId: firstConnected.instagram_business_account.id,
            accessToken: connectionToken,
          });

          if (!subscriptionResult.ok) {
            webhookSubscriptionFailed = true;
            console.error('Instagram webhook subscription failed (meta business flow)', {
              igAccountId: firstConnected.instagram_business_account.id,
              status: subscriptionResult.status || null,
              error: subscriptionResult.error || 'unknown',
            });
          } else {
            console.log('Instagram webhook subscription succeeded (meta business flow)', {
              igAccountId: firstConnected.instagram_business_account.id,
            });
          }
        } else {
          webhookSubscriptionFailed = true;
          console.error('Instagram webhook subscription skipped due to missing token (meta business flow)', {
            igAccountId: firstConnected.instagram_business_account.id,
          });
        }
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

      const tokenPayload = await parseJsonOrNull(tokenResponse);
      const tokenData = (tokenPayload ?? {}) as MetaTokenResponse;
      if (!tokenResponse.ok || !tokenData.access_token) {
        const apiError = extractApiErrorMessage(tokenPayload, 'Instagram token exchange failed');
        console.error('Instagram token exchange failed', {
          status: tokenResponse.status,
          apiError,
        });
        return NextResponse.redirect(
          new URL(
            `/dashboard?instagramConnected=false&instagramError=${encodeURIComponent(apiError)}`,
            normalizedSiteUrl
          )
        );
      }

      const igAccountId = tokenData.user_id ? String(tokenData.user_id) : null;
      if (igAccountId) {
        try {
          await upsertInstagramConnection({
            igAccountId,
            accessToken: tokenData.access_token,
            expiresInSeconds: tokenData.expires_in,
            provider: 'instagram_login',
            userId: flowUserId,
          });
        } catch (error) {
          const err = error instanceof Error ? error : new Error(String(error));
          const dbError = error as { code?: string; detail?: string };
          console.error('Instagram connection failed: Database write failed while linking Instagram account', {
            flow: 'instagram_login',
            igAccountId,
            userId: flowUserId,
            error: err.message,
            code: dbError?.code,
            detail: dbError?.detail,
            stack: err.stack,
          });
          return NextResponse.redirect(
            new URL(
              '/dashboard?instagramConnected=false&instagramError=Database write failed while linking Instagram account',
              normalizedSiteUrl
            )
          );
        }

        const subscriptionResult = await subscribeInstagramAccountToApp({
          igAccountId,
          accessToken: tokenData.access_token,
        });

        if (!subscriptionResult.ok) {
          webhookSubscriptionFailed = true;
          console.error('Instagram webhook subscription failed (instagram login flow)', {
            igAccountId,
            status: subscriptionResult.status || null,
            error: subscriptionResult.error || 'unknown',
          });
        } else {
          console.log('Instagram webhook subscription succeeded (instagram login flow)', {
            igAccountId,
          });
        }
      }
    } else {
      return NextResponse.redirect(
        new URL(
          '/dashboard?instagramConnected=false&instagramError=Unsupported login state',
          normalizedSiteUrl
        )
      );
    }

    const dashboardUrl = new URL('/dashboard?instagramConnected=true', normalizedSiteUrl);
    if (webhookSubscriptionFailed) {
      dashboardUrl.searchParams.set('instagramWebhookSubscribed', 'false');
    }
    return NextResponse.redirect(dashboardUrl);
  } catch (error) {
    const normalizedSiteUrl = (() => {
      try {
        return new URL(request.url).origin;
      } catch {
        return process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://rudolpho-chat.de';
      }
    })();
    const err = error instanceof Error ? error : new Error(String(error));
    console.error('Instagram callback unexpected error:', {
      message: err.message,
      stack: err.stack,
    });
    return NextResponse.redirect(
      new URL('/dashboard?instagramConnected=false&instagramError=Unexpected callback error', normalizedSiteUrl)
    );
  }
}

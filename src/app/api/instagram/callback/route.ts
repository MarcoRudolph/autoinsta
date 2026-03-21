import { NextRequest, NextResponse } from 'next/server';
import { eq, sql } from 'drizzle-orm';
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

type InstagramLoginTokenDataItem = {
  access_token?: string;
  user_id?: number | string;
  permissions?: string | string[];
  token_type?: string;
  expires_in?: number;
};

type InstagramLoginTokenResponse = {
  access_token?: string;
  user_id?: number | string;
  token_type?: string;
  expires_in?: number;
  data?: InstagramLoginTokenDataItem[];
  error_type?: string;
  code?: number;
  error_message?: string;
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

function normalizeInstagramLoginToken(payload: unknown): {
  accessToken: string | null;
  userId: string | null;
  expiresIn?: number;
} {
  if (!payload || typeof payload !== 'object') {
    return { accessToken: null, userId: null };
  }

  const record = payload as Record<string, unknown>;
  const rootAccessToken = typeof record.access_token === 'string' ? record.access_token : null;
  const rootUserId =
    typeof record.user_id === 'string' || typeof record.user_id === 'number' ? String(record.user_id) : null;
  const rootExpiresIn = typeof record.expires_in === 'number' ? record.expires_in : undefined;
  if (rootAccessToken) {
    return { accessToken: rootAccessToken, userId: rootUserId, expiresIn: rootExpiresIn };
  }

  const data = Array.isArray(record.data) ? (record.data as Array<Record<string, unknown>>) : [];
  const first = data[0];
  if (!first) {
    return { accessToken: null, userId: null };
  }

  const dataAccessToken = typeof first.access_token === 'string' ? first.access_token : null;
  const dataUserId =
    typeof first.user_id === 'string' || typeof first.user_id === 'number' ? String(first.user_id) : null;
  const dataExpiresIn = typeof first.expires_in === 'number' ? first.expires_in : undefined;

  return {
    accessToken: dataAccessToken,
    userId: dataUserId,
    expiresIn: dataExpiresIn,
  };
}

async function exchangeInstagramShortTokenForLongLived(input: {
  shortLivedToken: string;
  clientSecret: string;
}): Promise<{ accessToken: string | null; expiresIn?: number; error?: string }> {
  const url = new URL('https://graph.instagram.com/access_token');
  url.searchParams.append('grant_type', 'ig_exchange_token');
  url.searchParams.append('client_secret', input.clientSecret);
  url.searchParams.append('access_token', input.shortLivedToken);

  try {
    const response = await fetch(url.toString(), { method: 'GET' });
    const payload = await parseJsonOrNull(response);
    if (!response.ok) {
      return {
        accessToken: null,
        error: extractApiErrorMessage(payload, 'Failed to exchange short-lived token for long-lived token'),
      };
    }

    if (!payload || typeof payload !== 'object') {
      return {
        accessToken: null,
        error: 'Long-lived token response was empty',
      };
    }

    const record = payload as Record<string, unknown>;
    const accessToken = typeof record.access_token === 'string' ? record.access_token : null;
    const expiresIn = typeof record.expires_in === 'number' ? record.expires_in : undefined;
    if (!accessToken) {
      return {
        accessToken: null,
        error: 'Long-lived token missing access_token',
      };
    }

    return { accessToken, expiresIn };
  } catch (error) {
    return {
      accessToken: null,
      error: error instanceof Error ? error.message : String(error),
    };
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

  const values = {
    igAccountId: input.igAccountId,
    igUsername: input.igUsername || null,
    accessToken: input.accessToken || null,
    tokenExpiresAt,
    provider: input.provider,
    userId: input.userId || null,
    status: 'connected' as const,
    updatedAt: new Date(),
  };

  try {
    await db
      .insert(instagramConnections)
      .values(values)
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
  } catch (error) {
    const dbError = error as { code?: string; message?: string };
    const message = dbError?.message || '';
    const noConflictConstraint =
      dbError?.code === '42P10' || message.includes('no unique or exclusion constraint matching the ON CONFLICT');

    if (!noConflictConstraint) {
      throw error;
    }

    console.warn('Instagram connection upsert fallback triggered: missing ON CONFLICT constraint', {
      code: dbError?.code,
      message: dbError?.message,
      igAccountId: input.igAccountId,
    });

    const updated = await db
      .update(instagramConnections)
      .set({
        igUsername: input.igUsername || null,
        accessToken: input.accessToken || null,
        tokenExpiresAt,
        provider: input.provider,
        userId: input.userId || null,
        status: 'connected',
        updatedAt: new Date(),
      })
      .where(eq(instagramConnections.igAccountId, input.igAccountId))
      .returning({ igAccountId: instagramConnections.igAccountId });

    if (updated.length === 0) {
      await db.insert(instagramConnections).values(values);
    }
  }

  const saved = await db
    .select({ igAccountId: instagramConnections.igAccountId })
    .from(instagramConnections)
    .where(eq(instagramConnections.igAccountId, input.igAccountId))
    .limit(1);

  if (saved.length === 0) {
    throw new Error(`Failed to persist instagram connection for account ${input.igAccountId}`);
  }
}

async function resolveValidConnectionUserId(userId: string | null | undefined): Promise<string | null> {
  if (!userId) return null;

  try {
    const result = await db.execute(
      sql`select 1 from public.users where id = ${userId} limit 1`
    );
    if ((result.rows?.length ?? 0) > 0) {
      return userId;
    }

    console.warn('Instagram callback: state userId is not present in public.users; storing null userId', {
      userId,
    });
    return null;
  } catch (error) {
    console.warn('Instagram callback: failed to validate userId against public.users; storing null userId', {
      userId,
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
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
    const connectionUserId = await resolveValidConnectionUserId(flowUserId);
    const isMetaBusinessFlow = flow === 'meta_business_login';
    const isInstagramLoginFlow = flow === 'instagram_login' || !flow;
    let webhookSubscriptionFailed = false;
    let webhookSubscriptionError: string | null = null;

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
            userId: connectionUserId,
          });
        } catch (error) {
          const err = error instanceof Error ? error : new Error(String(error));
          const dbError = error as { code?: string; detail?: string };
          console.error('Instagram connection failed: Database write failed while linking Instagram account', {
            flow: 'meta_business',
            igAccountId: firstConnected.instagram_business_account.id,
            userId: flowUserId,
            resolvedUserId: connectionUserId,
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
            webhookSubscriptionError = `status=${subscriptionResult.status ?? 'n/a'} error=${
              subscriptionResult.error || 'unknown'
            }`.slice(0, 500);
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
          webhookSubscriptionError = 'status=n/a error=Missing connection token for subscribed_apps call';
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
      const tokenData = (tokenPayload ?? {}) as InstagramLoginTokenResponse;
      const normalizedToken = normalizeInstagramLoginToken(tokenData);
      if (!tokenResponse.ok || !normalizedToken.accessToken) {
        const apiError = extractApiErrorMessage(tokenPayload, 'Instagram token exchange failed');
        console.error('Instagram token exchange failed', {
          status: tokenResponse.status,
          apiError,
          responseShape: tokenPayload,
        });
        return NextResponse.redirect(
          new URL(
            `/dashboard?instagramConnected=false&instagramError=${encodeURIComponent(apiError)}`,
            normalizedSiteUrl
          )
        );
      }

      let tokenToStore = normalizedToken.accessToken;
      let tokenExpiresIn = normalizedToken.expiresIn;
      const longLivedTokenResult = await exchangeInstagramShortTokenForLongLived({
        shortLivedToken: normalizedToken.accessToken,
        clientSecret,
      });
      if (longLivedTokenResult.accessToken) {
        tokenToStore = longLivedTokenResult.accessToken;
        tokenExpiresIn = longLivedTokenResult.expiresIn;
      } else {
        console.warn('Instagram long-lived token exchange failed; storing short-lived token instead', {
          error: longLivedTokenResult.error || 'unknown',
        });
      }

      const igAccountId = normalizedToken.userId;
      if (igAccountId) {
        try {
          await upsertInstagramConnection({
            igAccountId,
            accessToken: tokenToStore,
            expiresInSeconds: tokenExpiresIn,
            provider: 'instagram_login',
            userId: connectionUserId,
          });
        } catch (error) {
          const err = error instanceof Error ? error : new Error(String(error));
          const dbError = error as { code?: string; detail?: string };
          console.error('Instagram connection failed: Database write failed while linking Instagram account', {
            flow: 'instagram_login',
            igAccountId,
            userId: flowUserId,
            resolvedUserId: connectionUserId,
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
          accessToken: tokenToStore,
        });

        if (!subscriptionResult.ok) {
          webhookSubscriptionFailed = true;
          webhookSubscriptionError = `status=${subscriptionResult.status ?? 'n/a'} error=${
            subscriptionResult.error || 'unknown'
          }`.slice(0, 500);
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
      dashboardUrl.searchParams.set(
        'instagramWebhookError',
        webhookSubscriptionError || 'status=n/a error=Unknown webhook subscription failure'
      );
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

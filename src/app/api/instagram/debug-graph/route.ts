import { NextRequest, NextResponse } from 'next/server';
import { desc } from 'drizzle-orm';
import { db, resolvePostgresUrl } from '@/drizzle';
import { instagramConnections } from '@/drizzle/schema/instagram';
import { requireInternalApiKey } from '@/lib/security/internalApiAuth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type CheckResult = {
  name: string;
  ok: boolean;
  status?: number;
  detail?: string;
  data?: Record<string, unknown>;
};

const GRAPH_VERSION = 'v23.0';

function maskToken(token: string | null | undefined): string | null {
  if (!token) return null;
  if (token.length <= 12) return `${token.slice(0, 3)}***${token.slice(-2)}`;
  return `${token.slice(0, 6)}...${token.slice(-4)}`;
}

async function parseJsonOrText(response: Response): Promise<unknown> {
  const raw = await response.text();
  if (!raw) return null;
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return raw;
  }
}

function compactError(payload: unknown): string {
  if (!payload || typeof payload !== 'object') return 'unknown error';
  const p = payload as Record<string, unknown>;
  const nested = p.error && typeof p.error === 'object' ? (p.error as Record<string, unknown>) : null;
  const message =
    (typeof nested?.message === 'string' && nested.message) ||
    (typeof p.message === 'string' && p.message) ||
    (typeof p.error_description === 'string' && p.error_description) ||
    'unknown error';
  const code =
    (typeof nested?.code === 'number' && nested.code) ||
    (typeof p.code === 'number' && p.code) ||
    null;
  return code ? `${message} (code: ${code})` : message;
}

export async function GET(request: NextRequest) {
  const startedAt = new Date().toISOString();
  const authError = requireInternalApiKey(request, {
    secrets: [
      process.env.INSTAGRAM_DEBUG_KEY,
      process.env.META_DEBUG_KEY,
      process.env.INTERNAL_API_SECRET,
      process.env.ADMIN_SECRET,
    ],
    context: 'instagram debug',
  });
  if (authError) return authError;

  if (!resolvePostgresUrl()) {
    return NextResponse.json(
      { error: 'POSTGRES_URL not configured in runtime environment' },
      { status: 500 }
    );
  }

  const checks: CheckResult[] = [];
  const appId =
    process.env.META_APP_ID ||
    process.env.FACEBOOK_APP_ID ||
    process.env.INSTAGRAM_APP_ID ||
    process.env.INSTAGRAM_CLIENT_ID ||
    process.env.NEXT_PUBLIC_INSTAGRAM_CLIENT_ID ||
    null;
  const appSecret =
    process.env.META_APP_SECRET ||
    process.env.FACEBOOK_APP_SECRET ||
    process.env.INSTAGRAM_APP_SECRET ||
    null;

  let appAccessToken: string | null = null;

  if (!appId || !appSecret) {
    checks.push({
      name: 'app_credentials_present',
      ok: false,
      detail: 'Missing app id or app secret in environment',
    });
  } else {
    checks.push({
      name: 'app_credentials_present',
      ok: true,
      detail: `appId=${appId}`,
    });

    try {
      const tokenUrl = new URL(`https://graph.facebook.com/${GRAPH_VERSION}/oauth/access_token`);
      tokenUrl.searchParams.set('client_id', appId);
      tokenUrl.searchParams.set('client_secret', appSecret);
      tokenUrl.searchParams.set('grant_type', 'client_credentials');

      const tokenResp = await fetch(tokenUrl.toString(), { method: 'GET' });
      const tokenPayload = await parseJsonOrText(tokenResp);
      if (!tokenResp.ok || !tokenPayload || typeof tokenPayload !== 'object') {
        checks.push({
          name: 'app_access_token_exchange',
          ok: false,
          status: tokenResp.status,
          detail: compactError(tokenPayload),
        });
      } else {
        const token = (tokenPayload as Record<string, unknown>).access_token;
        appAccessToken = typeof token === 'string' ? token : null;
        checks.push({
          name: 'app_access_token_exchange',
          ok: Boolean(appAccessToken),
          status: tokenResp.status,
          detail: appAccessToken ? `token=${maskToken(appAccessToken)}` : 'Missing access_token in response',
        });
      }
    } catch (error) {
      checks.push({
        name: 'app_access_token_exchange',
        ok: false,
        detail: error instanceof Error ? error.message : String(error),
      });
    }

    if (appAccessToken) {
      try {
        const appResp = await fetch(
          `https://graph.facebook.com/${GRAPH_VERSION}/app?fields=id,name&access_token=${encodeURIComponent(
            appAccessToken
          )}`,
          { method: 'GET' }
        );
        const appPayload = await parseJsonOrText(appResp);
        checks.push({
          name: 'graph_app_read',
          ok: appResp.ok,
          status: appResp.status,
          detail: appResp.ok ? 'Able to read app metadata from Graph API' : compactError(appPayload),
          data:
            appResp.ok && appPayload && typeof appPayload === 'object'
              ? (appPayload as Record<string, unknown>)
              : undefined,
        });
      } catch (error) {
        checks.push({
          name: 'graph_app_read',
          ok: false,
          detail: error instanceof Error ? error.message : String(error),
        });
      }
    }
  }

  const connection = await db
    .select({
      igAccountId: instagramConnections.igAccountId,
      igUsername: instagramConnections.igUsername,
      provider: instagramConnections.provider,
      status: instagramConnections.status,
      webhookVerified: instagramConnections.webhookVerified,
      tokenExpiresAt: instagramConnections.tokenExpiresAt,
      updatedAt: instagramConnections.updatedAt,
      accessToken: instagramConnections.accessToken,
    })
    .from(instagramConnections)
    .orderBy(desc(instagramConnections.updatedAt))
    .limit(1);

  const latest = connection[0] || null;
  checks.push({
    name: 'latest_instagram_connection',
    ok: Boolean(latest),
    detail: latest
      ? `igAccountId=${latest.igAccountId}, provider=${latest.provider}, status=${latest.status}, webhookVerified=${latest.webhookVerified}`
      : 'No instagram connection row found',
  });

  if (latest?.accessToken && latest.igAccountId) {
    try {
      const igBasicResp = await fetch(
        `https://graph.instagram.com/me?fields=id,username&access_token=${encodeURIComponent(
          latest.accessToken
        )}`,
        { method: 'GET' }
      );
      const igBasicPayload = await parseJsonOrText(igBasicResp);
      checks.push({
        name: 'ig_basic_graph_me_with_connection_token',
        ok: igBasicResp.ok,
        status: igBasicResp.status,
        detail: igBasicResp.ok
          ? 'Connection token can read graph.instagram.com/me'
          : compactError(igBasicPayload),
        data:
          igBasicResp.ok && igBasicPayload && typeof igBasicPayload === 'object'
            ? (igBasicPayload as Record<string, unknown>)
            : undefined,
      });
    } catch (error) {
      checks.push({
        name: 'ig_basic_graph_me_with_connection_token',
        ok: false,
        detail: error instanceof Error ? error.message : String(error),
      });
    }

    try {
      const igResp = await fetch(
        `https://graph.facebook.com/${GRAPH_VERSION}/${encodeURIComponent(
          latest.igAccountId
        )}?fields=id,username&access_token=${encodeURIComponent(latest.accessToken)}`,
        { method: 'GET' }
      );
      const igPayload = await parseJsonOrText(igResp);
      checks.push({
        name: 'ig_account_read_with_connection_token',
        ok: igResp.ok,
        status: igResp.status,
        detail: igResp.ok ? 'Connection token can read IG account' : compactError(igPayload),
        data:
          igResp.ok && igPayload && typeof igPayload === 'object'
            ? (igPayload as Record<string, unknown>)
            : undefined,
      });
    } catch (error) {
      checks.push({
        name: 'ig_account_read_with_connection_token',
        ok: false,
        detail: error instanceof Error ? error.message : String(error),
      });
    }

    try {
      const subResp = await fetch(
        `https://graph.instagram.com/${GRAPH_VERSION}/${encodeURIComponent(
          latest.igAccountId
        )}/subscribed_apps?access_token=${encodeURIComponent(latest.accessToken)}`,
        { method: 'GET' }
      );
      const subPayload = await parseJsonOrText(subResp);
      checks.push({
        name: 'ig_subscribed_apps_read',
        ok: subResp.ok,
        status: subResp.status,
        detail: subResp.ok ? 'Able to read subscribed_apps' : compactError(subPayload),
        data:
          subResp.ok && subPayload && typeof subPayload === 'object'
            ? (subPayload as Record<string, unknown>)
            : undefined,
      });
    } catch (error) {
      checks.push({
        name: 'ig_subscribed_apps_read',
        ok: false,
        detail: error instanceof Error ? error.message : String(error),
      });
    }

    if (appAccessToken) {
      try {
        const dbgUrl = new URL(`https://graph.facebook.com/${GRAPH_VERSION}/debug_token`);
        dbgUrl.searchParams.set('input_token', latest.accessToken);
        dbgUrl.searchParams.set('access_token', appAccessToken);
        const dbgResp = await fetch(dbgUrl.toString(), { method: 'GET' });
        const dbgPayload = await parseJsonOrText(dbgResp);
        checks.push({
          name: 'debug_token_for_connection_token',
          ok: dbgResp.ok,
          status: dbgResp.status,
          detail: dbgResp.ok ? 'debug_token succeeded' : compactError(dbgPayload),
          data:
            dbgResp.ok && dbgPayload && typeof dbgPayload === 'object'
              ? (dbgPayload as Record<string, unknown>)
              : undefined,
        });
      } catch (error) {
        checks.push({
          name: 'debug_token_for_connection_token',
          ok: false,
          detail: error instanceof Error ? error.message : String(error),
        });
      }
    }
  }

  console.log('Instagram Graph API debug check', {
    startedAt,
    checks: checks.map((c) => ({
      name: c.name,
      ok: c.ok,
      status: c.status || null,
      detail: c.detail || null,
    })),
  });

  return NextResponse.json({
    startedAt,
    graphVersion: GRAPH_VERSION,
    appId: appId || null,
    latestConnection: latest
      ? {
          igAccountId: latest.igAccountId,
          igUsername: latest.igUsername,
          provider: latest.provider,
          status: latest.status,
          webhookVerified: latest.webhookVerified,
          tokenExpiresAt: latest.tokenExpiresAt,
          updatedAt: latest.updatedAt,
          accessTokenMasked: maskToken(latest.accessToken),
        }
      : null,
    checks,
    usage: {
      endpoint: '/api/instagram/debug-graph',
      keyHeader: 'x-debug-key',
      keyQuery: 'key',
      note: 'Set INSTAGRAM_DEBUG_KEY (or META_DEBUG_KEY) to protect this endpoint in production.',
    },
  });
}

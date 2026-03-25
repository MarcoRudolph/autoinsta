import { NextRequest, NextResponse } from 'next/server';
import { and, desc, eq } from 'drizzle-orm';
import { db, resolvePostgresUrl } from '@/drizzle';
import { instagramConnections } from '@/drizzle/schema/instagram';
import { requireInternalApiKey } from '@/lib/security/internalApiAuth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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

export async function POST(request: NextRequest) {
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

  let body: { igAccountId?: string | null } = {};
  try {
    body = (await request.json()) as { igAccountId?: string | null };
  } catch {
    // Body is optional.
  }

  const requestedIgAccountId = body.igAccountId || request.nextUrl.searchParams.get('igAccountId');

  const connectionRows = await db
    .select({
      igAccountId: instagramConnections.igAccountId,
      accessToken: instagramConnections.accessToken,
      provider: instagramConnections.provider,
      status: instagramConnections.status,
      updatedAt: instagramConnections.updatedAt,
      webhookVerified: instagramConnections.webhookVerified,
    })
    .from(instagramConnections)
    .where(
      requestedIgAccountId
        ? and(
            eq(instagramConnections.igAccountId, requestedIgAccountId),
            eq(instagramConnections.status, 'connected')
          )
        : eq(instagramConnections.status, 'connected')
    )
    .orderBy(desc(instagramConnections.updatedAt))
    .limit(1);

  const connection = connectionRows[0] || null;
  if (!connection) {
    return NextResponse.json(
      {
        startedAt,
        error: requestedIgAccountId
          ? `No connected instagram_connections row for igAccountId=${requestedIgAccountId}`
          : 'No connected instagram_connections row found',
      },
      { status: 404 }
    );
  }

  if (!connection.accessToken) {
    return NextResponse.json(
      {
        startedAt,
        error: 'Connected row is missing access_token',
        igAccountId: connection.igAccountId,
      },
      { status: 400 }
    );
  }

  const postUrl = new URL(
    `https://graph.instagram.com/${GRAPH_VERSION}/${encodeURIComponent(connection.igAccountId)}/subscribed_apps`
  );
  postUrl.searchParams.set('access_token', connection.accessToken);
  postUrl.searchParams.set('subscribed_fields', 'messages,comments');

  const postResp = await fetch(postUrl.toString(), { method: 'POST' });
  const postPayload = await parseJsonOrText(postResp);

  const verifyUrl = `https://graph.instagram.com/${GRAPH_VERSION}/${encodeURIComponent(
    connection.igAccountId
  )}/subscribed_apps?access_token=${encodeURIComponent(connection.accessToken)}`;
  const verifyResp = await fetch(verifyUrl, { method: 'GET' });
  const verifyPayload = await parseJsonOrText(verifyResp);

  console.log('Instagram subscribed_apps debug attempt', {
    startedAt,
    igAccountId: connection.igAccountId,
    provider: connection.provider,
    connectionStatus: connection.status,
    webhookVerified: connection.webhookVerified,
    postStatus: postResp.status,
    postOk: postResp.ok,
    verifyStatus: verifyResp.status,
    verifyOk: verifyResp.ok,
  });

  return NextResponse.json({
    startedAt,
    graphVersion: GRAPH_VERSION,
    igAccountId: connection.igAccountId,
    provider: connection.provider,
    connectionStatus: connection.status,
    webhookVerified: connection.webhookVerified,
    accessTokenMasked: maskToken(connection.accessToken),
    postSubscribedApps: {
      ok: postResp.ok,
      status: postResp.status,
      payload: postPayload,
    },
    verifySubscribedApps: {
      ok: verifyResp.ok,
      status: verifyResp.status,
      payload: verifyPayload,
    },
    usage: {
      endpoint: '/api/instagram/debug-subscribe',
      method: 'POST',
      body: { igAccountId: 'optional' },
      keyHeader: 'x-debug-key',
      keyQuery: 'key',
      note: 'Set INSTAGRAM_DEBUG_KEY (or META_DEBUG_KEY) to protect this endpoint in production.',
    },
  });
}

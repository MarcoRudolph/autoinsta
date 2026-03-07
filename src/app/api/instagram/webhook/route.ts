import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

type InstagramWebhookPayload = {
  object?: string;
  entry?: Array<{
    id?: string;
    time?: number;
    messaging?: unknown[];
    changes?: unknown[];
  }>;
};

/**
 * Handles Meta webhook verification handshake.
 * Meta expects the raw challenge string as plain text on success.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const mode = searchParams.get('hub.mode');
  const verifyToken = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  const expectedVerifyToken =
    process.env.INSTAGRAM_WEBHOOK_VERIFY_TOKEN || process.env.META_WEBHOOK_VERIFY_TOKEN;

  if (!expectedVerifyToken) {
    return NextResponse.json(
      { error: 'Webhook verify token is not configured on server' },
      { status: 500 }
    );
  }

  if (mode === 'subscribe' && verifyToken === expectedVerifyToken && challenge) {
    return new NextResponse(challenge, {
      status: 200,
      headers: { 'Content-Type': 'text/plain' },
    });
  }

  return NextResponse.json({ error: 'Webhook verification failed' }, { status: 403 });
}

/**
 * Receives Instagram webhook events after subscription is verified.
 * For now, this route acknowledges receipt and logs minimal metadata.
 */
export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as InstagramWebhookPayload;

    const firstEntry = payload.entry?.[0];
    const eventType = payload.object || 'unknown';
    const entryId = firstEntry?.id || 'unknown';
    const hasMessagingEvents = Array.isArray(firstEntry?.messaging) && firstEntry.messaging.length > 0;
    const hasChangeEvents = Array.isArray(firstEntry?.changes) && firstEntry.changes.length > 0;

    console.log('Instagram webhook received', {
      eventType,
      entryId,
      hasMessagingEvents,
      hasChangeEvents,
      entryCount: payload.entry?.length || 0,
    });

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Instagram webhook parse error:', error);
    return NextResponse.json({ error: 'Invalid webhook payload' }, { status: 400 });
  }
}

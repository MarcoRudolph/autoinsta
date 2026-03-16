import { desc, eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/drizzle';
import { instagramConnections, instagramDmPending } from '@/drizzle/schema/instagram';
import { recordInstagramMessage, type StoredMessageInput } from '@/lib/instagram/dmPipeline';

export const runtime = 'nodejs';

function isTestModeEnabled(): boolean {
  return (
    process.env.NEXT_PUBLIC_TEST_MODE === '1' ||
    process.env.NEXT_PUBLIC_TEST_MODE === 'true' ||
    process.env.TEST_MODE === '1' ||
    process.env.TEST_MODE === 'true'
  );
}

export async function POST(request: NextRequest) {
  if (!isTestModeEnabled()) {
    return NextResponse.json({ error: 'Test mode is disabled' }, { status: 403 });
  }

  try {
    const body = (await request.json().catch(() => ({}))) as {
      messageText?: string;
      senderIgId?: string;
      igAccountId?: string;
    };

    const messageText = (body.messageText || 'review test dm').trim();
    const senderIgId = (body.senderIgId || 'review-test-sender').trim();

    const connectionRows = await db
      .select({
        igAccountId: instagramConnections.igAccountId,
      })
      .from(instagramConnections)
      .where(eq(instagramConnections.status, 'connected'))
      .orderBy(desc(instagramConnections.updatedAt))
      .limit(1);

    const connectedAccountId = body.igAccountId || connectionRows[0]?.igAccountId;
    if (!connectedAccountId) {
      return NextResponse.json({ error: 'No connected Instagram account found' }, { status: 400 });
    }

    const event: StoredMessageInput = {
      igAccountId: connectedAccountId,
      threadKey: `dm:${senderIgId}`,
      platformMessageId: `review_test_${Date.now()}`,
      messageKind: 'dm',
      direction: 'incoming',
      senderIgId,
      recipientIgId: connectedAccountId,
      messageText,
      sentAt: new Date().toISOString(),
      rawPayload: {
        source: 'simulate-webhook',
        senderIgId,
        messageText,
      },
      participantIgId: senderIgId,
    };

    const result = await recordInstagramMessage(event);
    if (!result.inserted) {
      return NextResponse.json(
        {
          error: 'Failed to store simulated DM',
          details: result.errorMessage || result.reason,
        },
        { status: 500 }
      );
    }

    await db.insert(instagramDmPending).values({
      igAccountId: event.igAccountId,
      threadKey: event.threadKey,
      inboundPayload: event as unknown as Record<string, unknown>,
      threadState: result.threadState as unknown as Record<string, unknown>,
      status: 'pending',
    });

    return NextResponse.json({
      ok: true,
      igAccountId: event.igAccountId,
      platformMessageId: event.platformMessageId,
      messageText: event.messageText,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Simulation failed',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

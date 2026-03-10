import { asc, eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/drizzle';
import { instagramDmPending } from '@/drizzle/schema/instagram';
import {
  getDelayBoundsForIgAccount,
  processIncomingDm,
  type StoredMessageInput,
  type ThreadState,
} from '@/lib/instagram/dmPipeline';

export const runtime = 'nodejs';

function randomInRange(min: number, max: number): number {
  if (min >= max) return min;
  return min + Math.random() * (max - min);
}

/**
 * POST /api/instagram/process-pending
 * Protected by x-cron-secret or Authorization: Bearer <CRON_SECRET>.
 * Processes up to 10 pending DMs, respecting persona delay-of-response settings.
 */
export async function POST(request: NextRequest) {
  const cronSecret =
    process.env.INSTAGRAM_CRON_SECRET || process.env.CRON_SECRET;
  const headerSecret =
    request.headers.get('x-cron-secret') ||
    request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');

  if (!cronSecret || headerSecret !== cronSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const BATCH_SIZE = 10;

  try {
    const pendingRows = await db
      .select()
      .from(instagramDmPending)
      .where(eq(instagramDmPending.status, 'pending'))
      .orderBy(asc(instagramDmPending.createdAt))
      .limit(BATCH_SIZE);

    let processed = 0;
    let failed = 0;
    let skipped = 0;

    for (const row of pendingRows) {
      const { delayMin, delayMax } = await getDelayBoundsForIgAccount(
        row.igAccountId
      );
      const delayMinutes = randomInRange(delayMin, delayMax);
      const processAfterAt =
        new Date(row.createdAt).getTime() + delayMinutes * 60 * 1000;
      const now = Date.now();

      if (now < processAfterAt) {
        skipped += 1;
        continue;
      }

      await db
        .update(instagramDmPending)
        .set({ status: 'processing' })
        .where(eq(instagramDmPending.id, row.id));

      try {
        const inboundMessage = row.inboundPayload as unknown as StoredMessageInput;
        const threadState = row.threadState as unknown as ThreadState;

        await processIncomingDm({
          inboundMessage,
          threadState,
        });

        await db
          .update(instagramDmPending)
          .set({ status: 'done', processedAt: new Date() })
          .where(eq(instagramDmPending.id, row.id));

        processed += 1;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        await db
          .update(instagramDmPending)
          .set({
            status: 'failed',
            errorMessage,
            processedAt: new Date(),
          })
          .where(eq(instagramDmPending.id, row.id));

        failed += 1;
        console.error('Process-pending DM failed', {
          id: row.id,
          igAccountId: row.igAccountId,
          threadKey: row.threadKey,
          error: errorMessage,
        });
      }
    }

    return NextResponse.json({
      processed,
      failed,
      skipped,
      total: pendingRows.length,
    });
  } catch (error) {
    console.error('Process-pending route error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal error' },
      { status: 500 }
    );
  }
}

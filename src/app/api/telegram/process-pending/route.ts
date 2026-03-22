import { asc, eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/drizzle';
import { telegramDmPending } from '@/drizzle/schema/telegram';
import {
  getDelayBoundsForTelegramUser,
  processIncomingTelegram,
  type TelegramOrchestrationInput,
  type TelegramStoredMessageInput,
  type TelegramThreadState,
} from '@/lib/telegram/telegramPipeline';

export const runtime = 'nodejs';

function randomInRange(min: number, max: number): number {
  if (min >= max) return min;
  return min + Math.random() * (max - min);
}

/**
 * POST /api/telegram/process-pending
 * Same auth as Instagram cron: x-cron-secret or Authorization: Bearer <CRON_SECRET>.
 */
export async function POST(request: NextRequest) {
  const cronSecret = process.env.TELEGRAM_CRON_SECRET || process.env.INSTAGRAM_CRON_SECRET || process.env.CRON_SECRET;
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
      .from(telegramDmPending)
      .where(eq(telegramDmPending.status, 'pending'))
      .orderBy(asc(telegramDmPending.createdAt))
      .limit(BATCH_SIZE);

    let processed = 0;
    let failed = 0;
    let skipped = 0;

    for (const row of pendingRows) {
      const { delayMin, delayMax } = await getDelayBoundsForTelegramUser(row.userId);
      const delayMinutes = randomInRange(delayMin, delayMax);
      const processAfterAt = new Date(row.createdAt).getTime() + delayMinutes * 60 * 1000;
      const now = Date.now();

      if (now < processAfterAt) {
        skipped += 1;
        continue;
      }

      await db
        .update(telegramDmPending)
        .set({ status: 'processing' })
        .where(eq(telegramDmPending.id, row.id));

      try {
        const inboundMessage = row.inboundPayload as unknown as TelegramStoredMessageInput;
        const threadState = row.threadState as unknown as TelegramThreadState;
        const input: TelegramOrchestrationInput = {
          inboundMessage,
          threadState,
          updateKind: row.updateKind as TelegramOrchestrationInput['updateKind'],
        };

        await processIncomingTelegram(input);

        await db
          .update(telegramDmPending)
          .set({ status: 'done', processedAt: new Date() })
          .where(eq(telegramDmPending.id, row.id));

        processed += 1;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        await db
          .update(telegramDmPending)
          .set({
            status: 'failed',
            errorMessage,
            processedAt: new Date(),
          })
          .where(eq(telegramDmPending.id, row.id));

        failed += 1;
        console.error('Telegram process-pending failed', {
          id: row.id,
          userId: row.userId,
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
    console.error('Telegram process-pending route error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal error' },
      { status: 500 }
    );
  }
}

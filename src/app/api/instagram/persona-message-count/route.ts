import { NextRequest, NextResponse } from 'next/server';
import { and, eq, inArray, sql } from 'drizzle-orm';
import { db, hasPostgresUrlConfig } from '@/drizzle';
import { personas } from '@/drizzle/schema/personas';
import { instagramConnections, instagramMessages } from '@/drizzle/schema/instagram';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const personaIdRaw = request.nextUrl.searchParams.get('personaId');
  const personaId = Number(personaIdRaw);
  if (!personaIdRaw || !Number.isInteger(personaId)) {
    return NextResponse.json({ error: 'Missing personaId' }, { status: 400 });
  }

  if (!hasPostgresUrlConfig()) {
    return NextResponse.json({ error: 'POSTGRES_URL not configured' }, { status: 500 });
  }

  try {
    const personaRows = await db
      .select({ userId: personas.userId })
      .from(personas)
      .where(eq(personas.id, personaId))
      .limit(1)
    const personaRow = personaRows[0];
    if (!personaRow?.userId) {
      return NextResponse.json({ error: 'Persona not found' }, { status: 404 });
    }

    const userId = personaRow.userId;

    const connections = await db
      .select({ igAccountId: instagramConnections.igAccountId })
      .from(instagramConnections)
      .where(eq(instagramConnections.userId, userId));
    const accountIds = connections.map((row) => row.igAccountId).filter(Boolean);
    if (accountIds.length === 0) {
      return NextResponse.json({ count: 0 });
    }

    const countRows = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(instagramMessages)
      .where(and(eq(instagramMessages.direction, 'incoming'), inArray(instagramMessages.igAccountId, accountIds)));

    return NextResponse.json({ count: countRows[0]?.count ?? 0 });
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error('persona-message-count API error:', {
      message: err.message,
      stack: err.stack,
      personaId,
    });
    return NextResponse.json({ error: 'Unexpected error', details: String(error) }, { status: 500 });
  }
}

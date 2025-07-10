import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/drizzle';
import { personas } from '@/drizzle/schema/personas';
import { eq, and } from 'drizzle-orm';

export async function PATCH(req: NextRequest) {
  try {
    const { personaId, userId, data } = await req.json();
    if (!personaId || !userId || !data) {
      return NextResponse.json({ error: 'Missing personaId, userId, or data' }, { status: 400 });
    }
    const result = await db.update(personas)
      .set({ data })
      .where(and(eq(personas.id, personaId), eq(personas.userId, userId)))
      .returning();
    return NextResponse.json({ persona: result[0] });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to edit persona', details: String(error) }, { status: 500 });
  }
} 
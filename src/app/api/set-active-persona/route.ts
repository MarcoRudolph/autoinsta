import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/drizzle';
import { personas } from '@/drizzle/schema/personas';
import { eq, and } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  try {
    const { personaId, userId } = await req.json();
    if (!personaId || !userId) {
      return NextResponse.json({ error: 'Missing personaId or userId' }, { status: 400 });
    }
    // Fetch all personas for this user
    const allPersonas = await db.select().from(personas).where(eq(personas.userId, userId));
    // Set active=false for all, active=true for the selected one
    for (const p of allPersonas) {
      const data = { ...(p.data as any), active: p.id === personaId };
      await db.update(personas)
        .set({ data })
        .where(eq(personas.id, p.id));
    }
    // Return the updated active persona
    const updated = await db.select().from(personas).where(and(eq(personas.id, personaId), eq(personas.userId, userId)));
    return NextResponse.json({ persona: updated[0] });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to set active persona', details: String(error) }, { status: 500 });
  }
} 
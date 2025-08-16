export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/drizzle';
import { personas } from '@/drizzle/schema/personas';
import { eq } from 'drizzle-orm';

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }
    await db.delete(personas).where(eq(personas.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete persona', details: String(error) }, { status: 500 });
  }
} 

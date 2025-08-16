export const runtime = 'edge';

// Official Drizzle ORM folder: src/drizzle
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/drizzle';
import { personas } from '@/drizzle/schema/personas';
import { eq } from 'drizzle-orm';

type PersonaData = {
  data?: {
    personality?: Record<string, unknown>;
    productLinks?: unknown[];
  };
  personality?: Record<string, unknown>;
  productLinks?: unknown[];
  [key: string]: unknown;
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }
  try {
    const result = await db.select().from(personas).where(eq(personas.id, id)).limit(1);
    if (!result.length) {
      return NextResponse.json({ error: 'Persona not found' }, { status: 404 });
    }
    console.log('Raw persona data from DB:', JSON.stringify(result[0].data, null, 2));
    
    // Handle double-wrapped data structure: the actual persona data is in result[0].data.data
    const personaData = result[0].data as PersonaData; // Proper type instead of any
    const actualPersona = personaData?.data || personaData;
    
    console.log('Extracted persona data:', JSON.stringify(actualPersona, null, 2));
    return NextResponse.json({ persona: actualPersona });
  } catch (error) {
    return NextResponse.json({ error: 'Database error', details: String(error) }, { status: 500 });
  }
} 

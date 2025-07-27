import { db } from '@/drizzle';
import { personas } from '@/drizzle/schema/personas';
import { NextResponse } from 'next/server';

type PersonaData = {
  name?: string;
  active?: boolean;
  [key: string]: unknown;
};

export async function GET() {
  try {
    const result = await db.select().from(personas);
    // Map to include id, name, and active for dropdown
    const personasList = result.map(row => {
      const data = row.data as PersonaData;
      return {
        id: row.id,
        name: data?.name || `Persona ${row.id}`,
        active: data?.active ?? false,
      };
    });
    return NextResponse.json({ personas: personasList });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to list personas', details: String(error) }, { status: 500 });
  }
} 
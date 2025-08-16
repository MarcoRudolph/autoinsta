export const runtime = 'edge';

// Official Drizzle ORM folder: src/drizzle

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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
    // Initialize Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: result, error } = await supabase
      .from('personas')
      .select('*')
      .eq('id', id)
      .limit(1)
      .single();

    if (error || !result) {
      return NextResponse.json({ error: 'Persona not found' }, { status: 404 });
    }

    console.log('Raw persona data from DB:', JSON.stringify(result.data, null, 2));
    
    // Handle double-wrapped data structure: the actual persona data is in result.data.data
    const personaData = result.data as PersonaData; // Proper type instead of any
    const actualPersona = personaData?.data || personaData;
    
    console.log('Extracted persona data:', JSON.stringify(actualPersona, null, 2));
    return NextResponse.json({ persona: actualPersona });
  } catch (error) {
    return NextResponse.json({ error: 'Database error', details: String(error) }, { status: 500 });
  }
} 

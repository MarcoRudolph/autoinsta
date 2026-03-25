import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAnonServerClient } from '@/lib/supabase/serverClient';
import { requireAuthenticatedUser } from '@/lib/security/requestAuth';

export const runtime = 'nodejs';

type PersonaData = {
  transparencyMode?: boolean;
  active?: boolean;
  data?: {
    personality?: Record<string, unknown>;
    productLinks?: unknown[];
    transparencyMode?: boolean;
    active?: boolean;
  };
  personality?: Record<string, unknown>;
  productLinks?: unknown[];
  [key: string]: unknown;
};

export async function GET(req: NextRequest) {
  const auth = await requireAuthenticatedUser(req);
  if (auth.response) return auth.response;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }
  try {
    // Initialize Supabase client
    const supabase = createSupabaseAnonServerClient();

    const { data: result, error } = await supabase
      .from('personas')
      .select('*')
      .eq('id', id)
      .eq('userId', auth.userId)
      .limit(1)
      .single();

    if (error || !result) {
      return NextResponse.json({ error: 'Persona not found' }, { status: 404 });
    }

    // Handle double-wrapped data structure while preferring top-level runtime flags
    // (legacy rows may have nested data + top-level updates from toggle routes).
    const personaData = result.data as PersonaData; // Proper type instead of any
    const actualPersona = personaData?.data
      ? {
          ...personaData.data,
          transparencyMode:
            personaData.transparencyMode ?? personaData.data.transparencyMode ?? true,
          active: personaData.active ?? personaData.data.active ?? false,
        }
      : personaData;
    
    return NextResponse.json({ persona: actualPersona });
  } catch (error) {
    return NextResponse.json({ error: 'Database error', details: String(error) }, { status: 500 });
  }
} 



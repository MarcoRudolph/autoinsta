export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function PATCH(req: NextRequest) {
  try {
    const { personaId, userId, data } = await req.json();
    if (!personaId || !userId || !data) {
      return NextResponse.json({ error: 'Missing personaId, userId, or data' }, { status: 400 });
    }

    // Initialize Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Update persona using Supabase
    const { data: result, error } = await supabase
      .from('personas')
      .update({ data })
      .eq('id', personaId)
      .eq('userId', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating persona:', error);
      return NextResponse.json({ error: 'Failed to edit persona', details: error.message }, { status: 500 });
    }

    return NextResponse.json({ persona: result });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to edit persona', details: String(error) }, { status: 500 });
  }
} 

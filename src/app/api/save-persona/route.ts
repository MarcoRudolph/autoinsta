import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAnonServerClient } from '@/lib/supabase/serverClient';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    console.log('Save persona API received data:', JSON.stringify(payload, null, 2));
    console.log('Data being inserted into database:', JSON.stringify(payload, null, 2));
    
    // Initialize Supabase client
    const supabase = createSupabaseAnonServerClient();
    
    if (!payload?.userId || !payload?.data) {
      return NextResponse.json({ error: 'Missing userId or persona data' }, { status: 400 });
    }

    // Normalize to a flat persona payload in `personas.data` for consistent reads/writes.
    const personaData = {
      ...(payload.data as Record<string, unknown>),
      active:
        (payload.data as { active?: boolean })?.active !== undefined
          ? Boolean((payload.data as { active?: boolean }).active)
          : false,
    };
    
    // Insert new persona using Supabase
    const { data: result, error } = await supabase
      .from('personas')
      .insert({
        userId: payload.userId, // ensure userId is provided
        data: personaData,
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error inserting persona:', error);
      return NextResponse.json({ error: 'Failed to save persona', details: error.message }, { status: 500 });
    }
    
    console.log('Database insert result:', JSON.stringify(result, null, 2));
    return NextResponse.json({ success: true, persona: result });
  } catch (error) {
    console.error('Error in save-persona API:', error);
    return NextResponse.json({ error: 'Failed to save persona', details: String(error) }, { status: 500 });
  }
} 



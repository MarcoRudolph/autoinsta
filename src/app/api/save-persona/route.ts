import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAnonServerClient } from '@/lib/supabase/serverClient';
import { requireAuthenticatedUser, validateRequestedUserId } from '@/lib/security/requestAuth';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuthenticatedUser(req);
    if (auth.response) return auth.response;

    const payload = await req.json();
    const mismatch = validateRequestedUserId(payload?.userId, auth.userId);
    if (mismatch) return mismatch;
    
    // Initialize Supabase client
    const supabase = createSupabaseAnonServerClient();
    
    if (!payload?.data) {
      return NextResponse.json({ error: 'Missing persona data' }, { status: 400 });
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
        userId: auth.userId,
        data: personaData,
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error inserting persona:', error);
      return NextResponse.json({ error: 'Failed to save persona', details: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ success: true, persona: result });
  } catch (error) {
    console.error('Error in save-persona API:', error);
    return NextResponse.json({ error: 'Failed to save persona', details: String(error) }, { status: 500 });
  }
} 



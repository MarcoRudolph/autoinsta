import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAnonServerClient } from '@/lib/supabase/serverClient';
import { requireAuthenticatedUser, validateRequestedUserId } from '@/lib/security/requestAuth';

export const runtime = 'nodejs';

export async function PATCH(req: NextRequest) {
  try {
    const auth = await requireAuthenticatedUser(req);
    if (auth.response) return auth.response;

    const { personaId, userId, data } = await req.json();
    const mismatch = validateRequestedUserId(userId, auth.userId);
    if (mismatch) return mismatch;
    if (!personaId || !data) {
      return NextResponse.json({ error: 'Missing personaId or data' }, { status: 400 });
    }

    // Initialize Supabase client
    const supabase = createSupabaseAnonServerClient();

    // Update persona using Supabase
    const { data: result, error } = await supabase
      .from('personas')
      .update({ data })
      .eq('id', personaId)
      .eq('userId', auth.userId)
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



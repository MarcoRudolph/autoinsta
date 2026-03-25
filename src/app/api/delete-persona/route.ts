import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAnonServerClient } from '@/lib/supabase/serverClient';
import { requireAuthenticatedUser } from '@/lib/security/requestAuth';

export const runtime = 'nodejs';

export async function DELETE(req: NextRequest) {
  try {
    const auth = await requireAuthenticatedUser(req);
    if (auth.response) return auth.response;

    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    // Initialize Supabase client
    const supabase = createSupabaseAnonServerClient();

    // Delete persona using Supabase
    const { error } = await supabase
      .from('personas')
      .delete()
      .eq('id', id)
      .eq('userId', auth.userId);

    if (error) {
      console.error('Error deleting persona:', error);
      return NextResponse.json({ error: 'Failed to delete persona', details: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete persona', details: String(error) }, { status: 500 });
  }
} 



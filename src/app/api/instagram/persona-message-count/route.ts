import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const personaId = request.nextUrl.searchParams.get('personaId');
  if (!personaId) {
    return NextResponse.json({ error: 'Missing personaId' }, { status: 400 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.POSTGRES_API_KEY || process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ error: 'Supabase service key not configured' }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, serviceKey);

  try {
    // Fetch persona to get userId
    const { data: personaRow, error: personaError } = await supabase
      .from('personas')
      .select('userId')
      .eq('id', personaId)
      .limit(1)
      .maybeSingle();

    if (personaError || !personaRow?.userId) {
      return NextResponse.json({ error: 'Persona not found' }, { status: 404 });
    }

    const userId = personaRow.userId;

    // Get ig_account_ids for this user
    const { data: connections, error: connError } = await supabase
      .from('instagram_connections')
      .select('ig_account_id')
      .eq('user_id', userId);

    if (connError) {
      return NextResponse.json({ error: 'Failed to load connections' }, { status: 500 });
    }

    const accountIds = (connections || []).map((row) => row.ig_account_id).filter(Boolean);
    if (accountIds.length === 0) {
      return NextResponse.json({ count: 0 });
    }

    const { count: messageCount, error: countError } = await supabase
      .from('instagram_messages')
      .select('id', { count: 'exact', head: true })
      .eq('direction', 'incoming')
      .in('ig_account_id', accountIds);

    if (countError) {
      return NextResponse.json({ error: 'Failed to count messages' }, { status: 500 });
    }

    return NextResponse.json({ count: messageCount ?? 0 });
  } catch (error) {
    return NextResponse.json({ error: 'Unexpected error', details: String(error) }, { status: 500 });
  }
}

export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    // Initialize Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Get user's locale from the database
    const { data, error } = await supabase
      .from('users')
      .select('locale')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error getting user locale:', error);
      return NextResponse.json({ error: 'Failed to get user locale' }, { status: 500 });
    }

    // Return the locale, defaulting to 'en' if not set
    const locale = data?.locale || 'en';
    return NextResponse.json({ locale });
  } catch (error) {
    console.error('Error in get-user-locale API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  try {
    const { locale, userId } = await req.json();

    if (!locale || !userId) {
      return NextResponse.json({ error: 'Missing locale or userId' }, { status: 400 });
    }

    if (!['en', 'de'].includes(locale)) {
      return NextResponse.json({ error: 'Invalid locale. Must be "en" or "de"' }, { status: 400 });
    }

    // Initialize Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Update user's locale in the database
    const { error } = await supabase
      .from('users')
      .update({ 
        locale: locale,
        updatedAt: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) {
      console.error('Error updating user locale:', error);
      return NextResponse.json({ error: 'Failed to update user locale' }, { status: 500 });
    }

    return NextResponse.json({ success: true, locale });
  } catch (error) {
    console.error('Error in update-user-locale API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

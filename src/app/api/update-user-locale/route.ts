import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAnonServerClient } from '@/lib/supabase/serverClient';
import { requireAuthenticatedUser, validateRequestedUserId } from '@/lib/security/requestAuth';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuthenticatedUser(req);
    if (auth.response) return auth.response;

    const { locale, userId } = await req.json();
    const mismatch = validateRequestedUserId(userId, auth.userId);
    if (mismatch) return mismatch;

    if (!locale) {
      return NextResponse.json({ error: 'Missing locale' }, { status: 400 });
    }

    const validLocales = ['en', 'de', 'fr', 'es', 'it', 'pt'];
    if (!validLocales.includes(locale)) {
      return NextResponse.json(
        { error: `Invalid locale. Must be one of: ${validLocales.join(', ')}` },
        { status: 400 }
      );
    }

    // Initialize Supabase client
    const supabase = createSupabaseAnonServerClient();

    // Update user's locale in the database
    const { error } = await supabase
      .from('users')
      .update({ 
        locale: locale,
        updatedAt: new Date().toISOString()
      })
      .eq('id', auth.userId);

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



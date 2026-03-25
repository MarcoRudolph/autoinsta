import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAnonServerClient } from '@/lib/supabase/serverClient';
import { requireAuthenticatedUser, validateRequestedUserId } from '@/lib/security/requestAuth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuthenticatedUser(req);
    if (auth.response) return auth.response;

    const { searchParams } = req.nextUrl;
    const mismatch = validateRequestedUserId(searchParams.get('userId'), auth.userId);
    if (mismatch) return mismatch;
    const userId = auth.userId;

    // Initialize Supabase client
    const supabase = createSupabaseAnonServerClient();

    // Get user's locale from the database
    const { data, error } = await supabase
      .from('users')
      .select('locale')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error getting user locale:', {
        message: error?.message,
        code: (error as { code?: string })?.code,
        details: (error as { details?: string })?.details,
        hint: (error as { hint?: string })?.hint,
        userId,
      });
      return NextResponse.json({ error: 'Failed to get user locale' }, { status: 500 });
    }

    // Return the locale, defaulting to 'en' if not set
    const locale = data?.locale || 'en';
    return NextResponse.json({ locale });
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error('Error in get-user-locale API:', {
      message: err.message,
      stack: err.stack,
      cause: err.cause,
    });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}



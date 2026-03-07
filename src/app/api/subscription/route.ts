import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAnonServerClient } from '@/lib/supabase/serverClient';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Initialize Supabase client
    const supabase = createSupabaseAnonServerClient();

    // Get user subscription from users table
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .limit(1)
      .single();

    if (error || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      subscriptionStatus: user.subscription_status || 'free',
      subscriptionPlan: user.subscription_plan || 'free',
      isPro: user.is_pro || false,
      subscriptionStartDate: user.subscription_start_date,
      subscriptionEndDate: user.subscription_end_date,
      cancelAtPeriodEnd: false, // Not implemented in current schema
      currentPeriodEnd: user.subscription_end_date,
    });

  } catch (error) {
    console.error('Error fetching subscription:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}



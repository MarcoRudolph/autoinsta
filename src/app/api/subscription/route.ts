import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAnonServerClient } from '@/lib/supabase/serverClient';
import { normalizePlan } from '@/lib/billing/plans';
import { requireAuthenticatedUser, validateRequestedUserId } from '@/lib/security/requestAuth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuthenticatedUser(request);
    if (auth.response) return auth.response;
    const mismatch = validateRequestedUserId(request.nextUrl.searchParams.get('userId'), auth.userId);
    if (mismatch) return mismatch;
    const userId = auth.userId;

    // Initialize Supabase client
    const supabase = createSupabaseAnonServerClient();

    const nowIso = new Date().toISOString();

    const { data: activeSub } = await supabase
      .from('subscriptions')
      .select('status,plan,current_period_start,current_period_end,cancel_at_period_end')
      .eq('user_id', userId)
      .in('status', ['active', 'trialing'])
      .gt('current_period_end', nowIso)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (activeSub) {
      const normalizedPlan = normalizePlan(activeSub.plan);
      return NextResponse.json({
        subscriptionStatus: activeSub.status,
        subscriptionPlan: normalizedPlan,
        isPro: normalizedPlan === 'pro' || normalizedPlan === 'max' || normalizedPlan === 'enterprise',
        subscriptionStartDate: activeSub.current_period_start,
        subscriptionEndDate: activeSub.current_period_end,
        cancelAtPeriodEnd: Boolean(activeSub.cancel_at_period_end),
        currentPeriodEnd: activeSub.current_period_end,
      });
    }

    // Fallback to users table for legacy data
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .limit(1)
      .single();

    if (error || !user) {
      // OAuth users may not yet have a public.users row; return free defaults instead of 404
      return NextResponse.json({
        subscriptionStatus: 'free',
        subscriptionPlan: 'free',
        isPro: false,
        subscriptionStartDate: null,
        subscriptionEndDate: null,
        cancelAtPeriodEnd: false,
        currentPeriodEnd: null,
      });
    }

    return NextResponse.json({
      subscriptionStatus: user.subscription_status || 'free',
      subscriptionPlan: normalizePlan(user.subscription_plan),
      isPro:
        Boolean(user.is_pro) ||
        user.subscription_plan === 'pro' ||
        user.subscription_plan === 'max' ||
        user.subscription_plan === 'enterprise',
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



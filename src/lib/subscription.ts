import { createSupabaseAnonServerClient } from '@/lib/supabase/serverClient';

export type SubscriptionStatus =
  | 'free'
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'incomplete'
  | 'incomplete_expired'
  | 'unpaid'
  | 'paused';
export type SubscriptionPlan = 'free' | 'pro' | 'max' | 'enterprise';

export interface UserSubscription {
  id: string;
  email: string;
  stripeCustomerId: string | null;
  subscriptionStatus: SubscriptionStatus;
  subscriptionPlan: SubscriptionPlan;
  subscriptionStartDate: Date | null;
  subscriptionEndDate: Date | null;
  isPro: boolean;
  cancelAtPeriodEnd: boolean;
  currentPeriodEnd: Date | null;
}

export async function getUserPlan(userId: string): Promise<SubscriptionPlan> {
  try {
    const supabase = createSupabaseAnonServerClient();

    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('plan,current_period_end')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (subscription?.current_period_end && new Date(subscription.current_period_end) > new Date()) {
      return subscription.plan as SubscriptionPlan;
    }
  } catch (error) {
    console.log('Subscriptions query failed in getUserPlan, falling back to users table:', error);
  }

  try {
    const supabase = createSupabaseAnonServerClient();
    const { data: user } = await supabase
      .from('users')
      .select('subscription_plan,is_pro')
      .eq('id', userId)
      .limit(1)
      .single();

    if (!user) return 'free';
    if (
      user.is_pro ||
      user.subscription_plan === 'pro' ||
      user.subscription_plan === 'max' ||
      user.subscription_plan === 'enterprise'
    ) {
      return user.subscription_plan === 'max' ? 'max' : 'pro';
    }
    return 'free';
  } catch (error) {
    console.error('Fallback query failed in getUserPlan:', error);
    return 'free';
  }
}

export async function isUserPro(userId: string): Promise<boolean> {
  const plan = await getUserPlan(userId);
  return plan === 'pro' || plan === 'max' || plan === 'enterprise';
}

export async function getUserActiveSubscription(userId: string) {
  try {
    const supabase = createSupabaseAnonServerClient();
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) return null;
    return subscription;
  } catch (error) {
    console.error('Error getting user active subscription:', error);
    return null;
  }
}

export async function getUserSubscriptionHistory(userId: string) {
  try {
    const supabase = createSupabaseAnonServerClient();
    const { data: subscriptions, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) return [];
    return subscriptions || [];
  } catch (error) {
    console.error('Error getting user subscription history:', error);
    return [];
  }
}

export async function updateUserSubscription(
  stripeCustomerId: string,
  subscriptionData: {
    status: SubscriptionStatus;
    plan: SubscriptionPlan;
    startDate: Date;
    endDate: Date;
    cancelAtPeriodEnd: boolean;
  }
): Promise<void> {
  try {
    const supabase = createSupabaseAnonServerClient();

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('stripe_customer_id', stripeCustomerId)
      .limit(1)
      .single();

    if (userError || !user) return;

    const latest = await supabase
      .from('subscriptions')
      .select('subscription_id')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (latest.data?.subscription_id) {
      await supabase
        .from('subscriptions')
        .update({
          status: subscriptionData.status,
          plan: subscriptionData.plan,
          current_period_start: subscriptionData.startDate.toISOString(),
          current_period_end: subscriptionData.endDate.toISOString(),
          cancel_at_period_end: subscriptionData.cancelAtPeriodEnd,
          updated_at: new Date().toISOString(),
        })
        .eq('subscription_id', latest.data.subscription_id);
      return;
    }

    await supabase.from('subscriptions').insert({
      subscription_id: `manual_${Date.now()}_${user.id}`,
      customer_id: stripeCustomerId,
      user_id: user.id,
      status: subscriptionData.status,
      plan: subscriptionData.plan,
      cancel_at_period_end: subscriptionData.cancelAtPeriodEnd,
      current_period_start: subscriptionData.startDate.toISOString(),
      current_period_end: subscriptionData.endDate.toISOString(),
      quantity: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error updating user subscription:', error);
  }
}

export async function cancelUserSubscription(stripeCustomerId: string): Promise<void> {
  try {
    const supabase = createSupabaseAnonServerClient();

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('stripe_customer_id', stripeCustomerId)
      .limit(1)
      .single();

    if (userError || !user) return;

    const activeSubscription = await supabase
      .from('subscriptions')
      .select('subscription_id')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (activeSubscription.data?.subscription_id) {
      await supabase
        .from('subscriptions')
        .update({
          status: 'canceled',
          updated_at: new Date().toISOString(),
        })
        .eq('subscription_id', activeSubscription.data.subscription_id);
    }
  } catch (error) {
    console.error('Error canceling user subscription:', error);
  }
}

export async function getUserSubscription(userId: string): Promise<UserSubscription | null> {
  try {
    const supabase = createSupabaseAnonServerClient();

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id,email,stripe_customer_id,subscription_status,subscription_plan,subscription_start_date,subscription_end_date,is_pro')
      .eq('id', userId)
      .limit(1)
      .single();

    if (userError || !user) return null;

    let activeSubscription: Record<string, unknown> | null = null;
    try {
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      activeSubscription = subscription || null;
    } catch (error) {
      console.log('Subscriptions query failed, using users fallback:', error);
    }

    const activePlan = (activeSubscription?.plan as SubscriptionPlan | undefined) || null;
    const activeStatus = (activeSubscription?.status as SubscriptionStatus | undefined) || null;
    const activePeriodStart = (activeSubscription?.current_period_start as string | null | undefined) || null;
    const activePeriodEnd = (activeSubscription?.current_period_end as string | null | undefined) || null;
    const activeCancelAtPeriodEnd = Boolean(activeSubscription?.cancel_at_period_end);

    const isPro = activePlan
      ? activePlan === 'pro' || activePlan === 'max' || activePlan === 'enterprise'
      : Boolean(
          user.is_pro ||
            user.subscription_plan === 'pro' ||
            user.subscription_plan === 'max' ||
            user.subscription_plan === 'enterprise'
        );

    return {
      id: user.id,
      email: user.email,
      stripeCustomerId: user.stripe_customer_id,
      subscriptionStatus: activeStatus || (user.subscription_status as SubscriptionStatus) || 'free',
      subscriptionPlan: activePlan || (user.subscription_plan as SubscriptionPlan) || 'free',
      subscriptionStartDate: activePeriodStart ? new Date(activePeriodStart) : (user.subscription_start_date ? new Date(user.subscription_start_date) : null),
      subscriptionEndDate: activePeriodEnd ? new Date(activePeriodEnd) : (user.subscription_end_date ? new Date(user.subscription_end_date) : null),
      isPro,
      cancelAtPeriodEnd: activeCancelAtPeriodEnd,
      currentPeriodEnd: activePeriodEnd ? new Date(activePeriodEnd) : (user.subscription_end_date ? new Date(user.subscription_end_date) : null),
    };
  } catch (error) {
    console.error('Error getting user subscription:', error);
    return null;
  }
}

export async function isSubscriptionExpiringSoon(userId: string): Promise<boolean> {
  const subscription = await getUserActiveSubscription(userId);
  const periodEnd = subscription?.current_period_end as string | null | undefined;
  if (!periodEnd) return false;

  const sevenDaysFromNow = new Date();
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

  return new Date(periodEnd) <= sevenDaysFromNow;
}

export async function getDaysUntilExpiry(userId: string): Promise<number | null> {
  const subscription = await getUserActiveSubscription(userId);
  const periodEnd = subscription?.current_period_end as string | null | undefined;
  if (!periodEnd) return null;

  const now = new Date();
  const expiry = new Date(periodEnd);
  const diffTime = expiry.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return Math.max(0, diffDays);
}

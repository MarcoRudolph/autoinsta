import { createClient } from '@supabase/supabase-js';

export type SubscriptionStatus = 'free' | 'trialing' | 'active' | 'past_due' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'unpaid' | 'paused';
export type SubscriptionPlan = 'free' | 'pro' | 'enterprise';

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

/**
 * Get user's current subscription plan
 */
export async function getUserPlan(userId: string): Promise<SubscriptionPlan> {
  try {
    // Initialize Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('userId', userId)
      .eq('status', 'active')
      .order('createdAt', { ascending: false })
      .limit(1)
      .single();

    if (error || !subscription) return 'free';

    // Check if subscription is still active (not expired)
    if (subscription.currentPeriodEnd && new Date(subscription.currentPeriodEnd) > new Date()) {
      return subscription.plan as SubscriptionPlan;
    }

    return 'free';
  } catch (error) {
    console.log('Subscriptions table query failed in getUserPlan, falling back to users table:', error);
    // Fallback to users table
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .limit(1)
        .single();

      if (userError || !user) return 'free';
      
      if (user?.isPro || user?.subscriptionPlan === 'pro' || user?.subscriptionPlan === 'enterprise') {
        return 'pro';
      }
      
      return 'free';
    } catch (fallbackError) {
      console.error('Fallback query also failed:', fallbackError);
      return 'free';
    }
  }
}

/**
 * Check if user has active pro subscription
 */
export async function isUserPro(userId: string): Promise<boolean> {
  const plan = await getUserPlan(userId);
  return plan === 'pro' || plan === 'enterprise';
}

/**
 * Get user's active subscription details
 */
export async function getUserActiveSubscription(userId: string) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('userId', userId)
      .eq('status', 'active')
      .order('createdAt', { ascending: false })
      .limit(1)
      .single();

    if (error) return null;
    return subscription;
  } catch (error) {
    console.error('Error getting user active subscription:', error);
    return null;
  }
}

/**
 * Get user's subscription history
 */
export async function getUserSubscriptionHistory(userId: string) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: subscriptions, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('userId', userId)
      .order('createdAt', { ascending: false });

    if (error) return [];
    return subscriptions || [];
  } catch (error) {
    console.error('Error getting user subscription history:', error);
    return [];
  }
}

/**
 * Update user subscription from Stripe webhook
 */
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
  // Find user by stripeCustomerId
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('stripeCustomerId', stripeCustomerId)
      .limit(1)
      .single();

    if (userError || !user) return;
    
    // Update or create subscription record
    const existingSubscription = await supabase
      .from('subscriptions')
      .select('*')
      .eq('userId', user.id)
      .order('createdAt', { ascending: false })
      .limit(1)
      .single();

    if (existingSubscription.data) {
      await supabase
        .from('subscriptions')
        .update({
          status: subscriptionData.status,
          plan: subscriptionData.plan,
          currentPeriodStart: subscriptionData.startDate,
          currentPeriodEnd: subscriptionData.endDate,
          cancelAtPeriodEnd: subscriptionData.cancelAtPeriodEnd,
          updatedAt: new Date(),
        })
        .eq('subscriptionId', existingSubscription.data.subscriptionId);
    } else {
      await supabase
        .from('subscriptions')
        .insert({
          userId: user.id,
          status: subscriptionData.status,
          plan: subscriptionData.plan,
          currentPeriodStart: subscriptionData.startDate,
          currentPeriodEnd: subscriptionData.endDate,
          cancelAtPeriodEnd: subscriptionData.cancelAtPeriodEnd,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
    }
  } catch (error) {
    console.error('Error updating user subscription:', error);
  }
}

/**
 * Cancel user subscription
 */
export async function cancelUserSubscription(stripeCustomerId: string): Promise<void> {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('stripeCustomerId', stripeCustomerId)
      .limit(1)
      .single();

    if (userError || !user) return;
    
    const activeSubscription = await supabase
      .from('subscriptions')
      .select('*')
      .eq('userId', user.id)
      .eq('status', 'active')
      .order('createdAt', { ascending: false })
      .limit(1)
      .single();

    if (activeSubscription.data) {
      await supabase
        .from('subscriptions')
        .update({
          status: 'canceled',
          updatedAt: new Date(),
        })
        .eq('subscriptionId', activeSubscription.data.subscriptionId);
    }
  } catch (error) {
    console.error('Error canceling user subscription:', error);
  }
}

/**
 * Get subscription details for a user
 */
export async function getUserSubscription(userId: string): Promise<UserSubscription | null> {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .limit(1)
      .single();

    if (userError || !user) return null;
    
    let activeSubscription = null;
    
    // Try to get active subscription, but don't fail if subscriptions table doesn't exist
    try {
      const { data: subscription, error: subscriptionError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('userId', userId)
        .eq('status', 'active')
        .order('createdAt', { ascending: false })
        .limit(1)
        .single();

      if (subscriptionError) {
        console.log('Subscriptions table query failed, falling back to users table:', subscriptionError);
        // If subscriptions table doesn't exist or query fails, just use user table data
      } else {
        activeSubscription = subscription;
      }
    } catch (error) {
      console.log('Subscriptions table query failed, falling back to users table:', error);
      // If subscriptions table doesn't exist or query fails, just use user table data
    }
    
    // Fallback to user table fields if no active subscription found
    const isPro = activeSubscription ? (activeSubscription.plan === 'pro' || activeSubscription.plan === 'enterprise') : 
                  (user.isPro || user.subscriptionPlan === 'pro' || user.subscriptionPlan === 'enterprise');
    
    return {
      id: user.id,
      email: user.email,
      stripeCustomerId: user.stripeCustomerId,
      subscriptionStatus: activeSubscription?.status as SubscriptionStatus || user.subscriptionStatus as SubscriptionStatus || 'free',
      subscriptionPlan: activeSubscription?.plan as SubscriptionPlan || user.subscriptionPlan as SubscriptionPlan || 'free',
      subscriptionStartDate: activeSubscription?.currentPeriodStart || (user.subscriptionStartDate ? new Date(user.subscriptionStartDate) : null),
      subscriptionEndDate: activeSubscription?.currentPeriodEnd || (user.subscriptionEndDate ? new Date(user.subscriptionEndDate) : null),
      isPro: isPro,
      cancelAtPeriodEnd: activeSubscription?.cancelAtPeriodEnd || false,
      currentPeriodEnd: activeSubscription?.currentPeriodEnd || (user.subscriptionEndDate ? new Date(user.subscriptionEndDate) : null),
    };
  } catch (error) {
    console.error('Error getting user subscription:', error);
    return null;
  }
}

/**
 * Check if subscription is expiring soon (within 7 days)
 */
export async function isSubscriptionExpiringSoon(userId: string): Promise<boolean> {
  const subscription = await getUserActiveSubscription(userId);
  if (!subscription?.currentPeriodEnd) return false;
  
  const sevenDaysFromNow = new Date();
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
  
  return new Date(subscription.currentPeriodEnd) <= sevenDaysFromNow;
}

/**
 * Get days until subscription expires
 */
export async function getDaysUntilExpiry(userId: string): Promise<number | null> {
  const subscription = await getUserActiveSubscription(userId);
  if (!subscription?.currentPeriodEnd) return null;
  
  const now = new Date();
  const expiry = new Date(subscription.currentPeriodEnd);
  const diffTime = expiry.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return Math.max(0, diffDays);
}

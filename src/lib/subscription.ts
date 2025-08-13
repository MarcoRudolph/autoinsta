import { eq, and, desc } from 'drizzle-orm';
import { db } from '../drizzle';
import { users, subscriptions } from '../drizzle/schema';

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
  const subscription = await db.query.subscriptions.findFirst({
    where: and(
      eq(subscriptions.userId, userId),
      eq(subscriptions.status, 'active')
    ),
    orderBy: [desc(subscriptions.createdAt)],
  });
  
  if (!subscription) return 'free';
  
  // Check if subscription is still active (not expired)
  if (subscription.currentPeriodEnd && subscription.currentPeriodEnd > new Date()) {
    return subscription.plan as SubscriptionPlan;
  }
  
  return 'free';
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
  return await db.query.subscriptions.findFirst({
    where: and(
      eq(subscriptions.userId, userId),
      eq(subscriptions.status, 'active')
    ),
    orderBy: [desc(subscriptions.createdAt)],
  });
}

/**
 * Get user's subscription history
 */
export async function getUserSubscriptionHistory(userId: string) {
  return await db.query.subscriptions.findMany({
    where: eq(subscriptions.userId, userId),
    orderBy: [desc(subscriptions.createdAt)],
  });
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
  const user = await db.query.users.findFirst({
    where: eq(users.stripeCustomerId, stripeCustomerId),
  });
  
  if (!user) return;
  
  // Update or create subscription record
  const existingSubscription = await db.query.subscriptions.findFirst({
    where: eq(subscriptions.userId, user.id),
    orderBy: [desc(subscriptions.createdAt)],
  });
  
  if (existingSubscription) {
    await db.update(subscriptions)
      .set({
        status: subscriptionData.status,
        plan: subscriptionData.plan,
        currentPeriodStart: subscriptionData.startDate,
        currentPeriodEnd: subscriptionData.endDate,
        cancelAtPeriodEnd: subscriptionData.cancelAtPeriodEnd,
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.subscriptionId, existingSubscription.subscriptionId));
  }
}

/**
 * Cancel user subscription
 */
export async function cancelUserSubscription(stripeCustomerId: string): Promise<void> {
  const user = await db.query.users.findFirst({
    where: eq(users.stripeCustomerId, stripeCustomerId),
  });
  
  if (!user) return;
  
  const activeSubscription = await db.query.subscriptions.findFirst({
    where: and(
      eq(subscriptions.userId, user.id),
      eq(subscriptions.status, 'active')
    ),
    orderBy: [desc(subscriptions.createdAt)],
  });
  
  if (activeSubscription) {
    await db.update(subscriptions)
      .set({
        status: 'canceled',
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.subscriptionId, activeSubscription.subscriptionId));
  }
}

/**
 * Get subscription details for a user
 */
export async function getUserSubscription(userId: string): Promise<UserSubscription | null> {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });
  
  if (!user) return null;
  
  const activeSubscription = await db.query.subscriptions.findFirst({
    where: and(
      eq(subscriptions.userId, userId),
      eq(subscriptions.status, 'active')
    ),
    orderBy: [desc(subscriptions.createdAt)],
  });
  
  return {
    id: user.id,
    email: user.email,
    stripeCustomerId: user.stripeCustomerId,
    subscriptionStatus: activeSubscription?.status as SubscriptionStatus || 'free',
    subscriptionPlan: activeSubscription?.plan as SubscriptionPlan || 'free',
    subscriptionStartDate: activeSubscription?.currentPeriodStart || null,
    subscriptionEndDate: activeSubscription?.currentPeriodEnd || null,
    isPro: activeSubscription ? (activeSubscription.plan === 'pro' || activeSubscription.plan === 'enterprise') : false,
    cancelAtPeriodEnd: activeSubscription?.cancelAtPeriodEnd || false,
    currentPeriodEnd: activeSubscription?.currentPeriodEnd || null,
  };
}

/**
 * Check if subscription is expiring soon (within 7 days)
 */
export async function isSubscriptionExpiringSoon(userId: string): Promise<boolean> {
  const subscription = await getUserActiveSubscription(userId);
  if (!subscription?.currentPeriodEnd) return false;
  
  const sevenDaysFromNow = new Date();
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
  
  return subscription.currentPeriodEnd <= sevenDaysFromNow;
}

/**
 * Get days until subscription expires
 */
export async function getDaysUntilExpiry(userId: string): Promise<number | null> {
  const subscription = await getUserActiveSubscription(userId);
  if (!subscription?.currentPeriodEnd) return null;
  
  const now = new Date();
  const expiry = subscription.currentPeriodEnd;
  const diffTime = expiry.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return Math.max(0, diffDays);
}

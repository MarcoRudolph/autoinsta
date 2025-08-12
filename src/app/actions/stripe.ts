'use server';

import { stripe } from '@/lib/stripe';
import { db } from '@/drizzle';
import { users, subscriptions } from '@/drizzle/schema';
import { eq, desc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

// Price ID for the 10 Euro monthly product
const STRIPE_PRICE_PRO = process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO!;

/**
 * Create a Stripe Checkout Session for subscription
 */
export async function createSubscriptionCheckout(
  userId: string,
  successUrl?: string,
  cancelUrl?: string
) {
  try {
    // Get user details
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Ensure/attach a Stripe Customer
    let customerId = user.stripeCustomerId;
    
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { appUserId: userId },
      });
      customerId = customer.id;
      
      // Update user with Stripe customer ID
      await db.update(users)
        .set({ 
          stripeCustomerId: customerId,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId));
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price: STRIPE_PRICE_PRO, quantity: 1 }],
      allow_promotion_codes: true,
      success_url: successUrl || `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?status=success`,
      cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?status=cancelled`,
      metadata: { 
        appUserId: userId,
        priceId: STRIPE_PRICE_PRO,
        plan: 'pro',
      },
      subscription_data: {
        metadata: {
          appUserId: userId,
          priceId: STRIPE_PRICE_PRO,
          plan: 'pro',
        },
      },
    });

    return { url: session.url! };
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw new Error('Failed to create checkout session');
  }
}

/**
 * Create a Customer Billing Portal session
 */
export async function createBillingPortal(userId: string, returnUrl?: string) {
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user?.stripeCustomerId) {
      throw new Error('No Stripe customer found');
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: returnUrl || `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`,
    });

    return { url: session.url! };
  } catch (error) {
    console.error('Error creating billing portal session:', error);
    throw new Error('Failed to create billing portal session');
  }
}

/**
 * Cancel subscription at period end
 */
export async function cancelSubscriptionAtPeriodEnd(userId: string) {
  try {
    // Get user's active subscription
    const userSubscription = await db.query.subscriptions.findFirst({
      where: eq(subscriptions.userId, userId),
      orderBy: [desc(subscriptions.createdAt)],
    });

    if (!userSubscription?.subscriptionId) {
      throw new Error('No active subscription found');
    }

    // Cancel at period end via Stripe
    await stripe.subscriptions.update(userSubscription.subscriptionId, {
      cancel_at_period_end: true,
    });

    // Update local database
    await db.update(subscriptions)
      .set({
        cancelAtPeriodEnd: true,
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.subscriptionId, userSubscription.subscriptionId));

    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Error canceling subscription:', error);
    throw new Error('Failed to cancel subscription');
  }
}

/**
 * Reactivate subscription (remove cancel at period end)
 */
export async function reactivateSubscription(userId: string) {
  try {
    const userSubscription = await db.query.subscriptions.findFirst({
      where: eq(subscriptions.userId, userId),
      orderBy: [desc(subscriptions.createdAt)],
    });

    if (!userSubscription?.subscriptionId) {
      throw new Error('No active subscription found');
    }

    // Reactivate via Stripe
    await stripe.subscriptions.update(userSubscription.subscriptionId, {
      cancel_at_period_end: false,
    });

    // Update local database
    await db.update(subscriptions)
      .set({
        cancelAtPeriodEnd: false,
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.subscriptionId, userSubscription.subscriptionId));

    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Error reactivating subscription:', error);
    throw new Error('Failed to reactivate subscription');
  }
}

'use server';

import { stripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';
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
    // Initialize Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Get user details
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .limit(1)
      .single();

    if (userError || !user) {
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
      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          stripeCustomerId: customerId,
          updatedAt: new Date().toISOString(),
        })
        .eq('id', userId);

      if (updateError) {
        console.error('Error updating user with Stripe customer ID:', updateError);
        throw updateError;
      }
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
    // Initialize Supabase client
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

    if (userError || !user?.stripeCustomerId) {
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
    // Initialize Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Get user's active subscription
    const { data: userSubscription, error: subscriptionError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('userId', userId)
      .eq('status', 'active')
      .order('createdAt', { ascending: false })
      .limit(1)
      .single();

    if (subscriptionError || !userSubscription?.subscriptionId) {
      throw new Error('No active subscription found');
    }

    // Cancel at period end via Stripe
    await stripe.subscriptions.update(userSubscription.subscriptionId, {
      cancel_at_period_end: true,
    });

    // Update local database
    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({
        cancelAtPeriodEnd: true,
        updatedAt: new Date().toISOString(),
      })
      .eq('subscriptionId', userSubscription.subscriptionId);

    if (updateError) {
      console.error('Error updating subscription:', updateError);
      throw updateError;
    }

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
    // Initialize Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: userSubscription, error: subscriptionError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('userId', userId)
      .eq('status', 'active')
      .order('createdAt', { ascending: false })
      .limit(1)
      .single();

    if (subscriptionError || !userSubscription?.subscriptionId) {
      throw new Error('No active subscription found');
    }

    // Reactivate via Stripe
    await stripe.subscriptions.update(userSubscription.subscriptionId, {
      cancel_at_period_end: false,
    });

    // Update local database
    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({
        cancelAtPeriodEnd: false,
        updatedAt: new Date().toISOString(),
      })
      .eq('subscriptionId', userSubscription.subscriptionId);

    if (updateError) {
      console.error('Error updating subscription:', updateError);
      throw updateError;
    }

    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Error reactivating subscription:', error);
    throw new Error('Failed to reactivate subscription');
  }
}

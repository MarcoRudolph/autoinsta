'use server';

import { stripe } from '@/lib/stripe';
import { createSupabaseAnonServerClient } from '@/lib/supabase/serverClient';
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
    // Check if Stripe is available
    if (!stripe) {
      throw new Error('Stripe is not configured');
    }

    const supabase = createSupabaseAnonServerClient();

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
    let customerId = user.stripe_customer_id;
    
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
          stripe_customer_id: customerId,
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
    // Check if Stripe is available
    if (!stripe) {
      throw new Error('Stripe is not configured');
    }

    const supabase = createSupabaseAnonServerClient();

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .limit(1)
      .single();

    if (userError || !user?.stripe_customer_id) {
      throw new Error('No Stripe customer found');
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripe_customer_id,
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
    // Check if Stripe is available
    if (!stripe) {
      throw new Error('Stripe is not configured');
    }

    const supabase = createSupabaseAnonServerClient();

    // Get user's active subscription
    const { data: userSubscription, error: subscriptionError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (subscriptionError || !userSubscription?.subscription_id) {
      throw new Error('No active subscription found');
    }

    // Cancel at period end via Stripe
    await stripe.subscriptions.update(userSubscription.subscription_id, {
      cancel_at_period_end: true,
    });

    // Update local database
    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({
        cancel_at_period_end: true,
        updated_at: new Date().toISOString(),
      })
      .eq('subscription_id', userSubscription.subscription_id);

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
    // Check if Stripe is available
    if (!stripe) {
      throw new Error('Stripe is not configured');
    }

    const supabase = createSupabaseAnonServerClient();

    const { data: userSubscription, error: subscriptionError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (subscriptionError || !userSubscription?.subscription_id) {
      throw new Error('No active subscription found');
    }

    // Reactivate via Stripe
    await stripe.subscriptions.update(userSubscription.subscription_id, {
      cancel_at_period_end: false,
    });

    // Update local database
    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({
        cancel_at_period_end: false,
        updated_at: new Date().toISOString(),
      })
      .eq('subscription_id', userSubscription.subscription_id);

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

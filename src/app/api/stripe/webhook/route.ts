export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { stripe, mapPriceToPlan } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

// Disable body parsing for raw body access
export const dynamic = 'force-dynamic';

/**
 * Convert Unix timestamp to Date
 */
function toDate(unix: number | null | undefined): Date | null {
  return unix ? new Date(unix * 1000) : null;
}

/**
 * Get object ID from Stripe event
 */
function getObjectId(event: Stripe.Event): string | null {
  const obj = event.data.object;
  
  // Handle different event types safely
  if ('subscription' in obj && obj.subscription) {
    return typeof obj.subscription === 'string' ? obj.subscription : obj.subscription.id;
  }
  
  if ('id' in obj && obj.id) {
    return obj.id;
  }
  
  return null;
}

/**
 * Handle checkout session completed event
 */
async function handleCheckoutSessionCompleted(event: Stripe.Event) {
  if (!stripe) {
    console.error('Stripe not configured for webhook');
    return;
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const customerId = session.customer as string | null;
  const appUserId = session.metadata?.appUserId;

  if (!appUserId || !customerId) return;

  try {
    // Initialize Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Re-fetch session for completeness
    const s = await stripe.checkout.sessions.retrieve(session.id, {
      expand: ['subscription', 'customer'],
    });

    const customer = s.customer as Stripe.Customer;
    const email = typeof customer === 'object' ? customer.email : undefined;
    if (!email) return;

    const sub = typeof s.subscription === 'string'
      ? await stripe.subscriptions.retrieve(s.subscription)
      : s.subscription;

    // Update user with Stripe customer ID using Supabase
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        stripeCustomerId: customerId,
        updatedAt: new Date().toISOString(),
      })
      .eq('id', appUserId);

    if (updateError) {
      console.error('Error updating user with Stripe customer ID:', updateError);
      throw updateError;
    }

    // Create subscription record using Supabase
    if (sub) {
      const price = sub.items.data[0]?.price;
      const planPriceId = price?.id ?? null;
      const productId = typeof price?.product === 'object' ? price.product?.id : null;
      const plan = mapPriceToPlan(planPriceId);

      const { error: insertError } = await supabase
        .from('subscriptions')
        .insert({
          subscriptionId: sub.id,
          userId: appUserId,
          customerId: customerId,
          status: sub.status,
          cancelAtPeriodEnd: sub.cancel_at_period_end ?? false,
          currentPeriodStart: toDate(sub.current_period_start)?.toISOString(),
          currentPeriodEnd: toDate(sub.current_period_end)?.toISOString(),
          trialEnd: toDate(sub.trial_end)?.toISOString(),
          priceId: planPriceId,
          productId,
          plan,
          quantity: sub.items.data[0]?.quantity ?? 1,
          latestInvoiceId: typeof sub.latest_invoice === 'string' ? sub.latest_invoice : sub.latest_invoice?.id ?? null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });

      if (insertError) {
        console.error('Error creating subscription record:', insertError);
        throw insertError;
      }
    }
  } catch (error) {
    console.error('Error handling checkout session completed:', error);
    throw error;
  }
}

/**
 * Handle subscription changes (created, updated, deleted)
 */
async function handleSubscriptionChange(event: Stripe.Event) {
  if (!stripe) {
    console.error('Stripe not configured for webhook');
    return;
  }

  const payload = event.data.object as Stripe.Subscription;
  
  try {
    // Initialize Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Re-fetch canonical subscription to avoid stale/out-of-order data
    const sub = await stripe.subscriptions.retrieve(payload.id, {
      expand: ['customer', 'items.data.price.product', 'latest_invoice.payment_intent'],
    });

    const customer = sub.customer as Stripe.Customer;
    const email = typeof customer === 'object' ? customer.email : undefined;
    if (!email) throw new Error('Customer email missing');

    const price = sub.items.data[0]?.price;
    const planPriceId = price?.id ?? null;
    const productId = typeof price?.product === 'object' ? price.product?.id : null;
    const plan = mapPriceToPlan(planPriceId);

    // Get user ID first
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .limit(1)
      .single();

    if (userError || !userData?.id) {
      console.error('User not found for email:', email);
      throw new Error(`User not found for ${email}`);
    }

    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({
        userId: userData.id,
        customerId: typeof sub.customer === 'string' ? sub.customer : sub.customer.id,
        status: sub.status,
        cancelAtPeriodEnd: sub.cancel_at_period_end ?? false,
        currentPeriodStart: toDate(sub.current_period_start)?.toISOString(),
        currentPeriodEnd: toDate(sub.current_period_end)?.toISOString(),
        trialEnd: toDate(sub.trial_end)?.toISOString(),
        priceId: planPriceId,
        productId,
        plan,
        quantity: sub.items.data[0]?.quantity ?? 1,
        latestInvoiceId: typeof sub.latest_invoice === 'string' ? sub.latest_invoice : sub.latest_invoice?.id ?? null,
        updatedAt: new Date().toISOString(),
      })
      .eq('subscriptionId', sub.id)
      .select()
      .single();

    if (updateError?.code === 'PGRST116') { // PGRST116: No rows found
      const { error: insertError } = await supabase
        .from('subscriptions')
        .insert({
          subscriptionId: sub.id,
          userId: userData.id,
          customerId: typeof sub.customer === 'string' ? sub.customer : sub.customer.id,
          status: sub.status,
          cancelAtPeriodEnd: sub.cancel_at_period_end ?? false,
          currentPeriodStart: toDate(sub.current_period_start)?.toISOString(),
          currentPeriodEnd: toDate(sub.current_period_end)?.toISOString(),
          trialEnd: toDate(sub.trial_end)?.toISOString(),
          priceId: planPriceId,
          productId,
          plan,
          quantity: sub.items.data[0]?.quantity ?? 1,
          latestInvoiceId: typeof sub.latest_invoice === 'string' ? sub.latest_invoice : sub.latest_invoice?.id ?? null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });

      if (insertError) {
        console.error('Error creating subscription record:', insertError);
        throw insertError;
      }
    } else if (updateError) {
      console.error('Error updating subscription record:', updateError);
      throw updateError;
    }
  } catch (error) {
    console.error('Error handling subscription change:', error);
    throw error;
  }
}

/**
 * Handle invoice events
 */
async function handleInvoice(event: Stripe.Event) {
  if (!stripe) {
    console.error('Stripe not configured for webhook');
    return;
  }

  const invoice = event.data.object as Stripe.Invoice;
  const subId = typeof invoice.subscription === 'string' ? invoice.subscription : invoice.subscription?.id;
  if (!subId) return;

  try {
    // Initialize Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({
        latestInvoiceId: invoice.id,
        updatedAt: new Date().toISOString(),
      })
      .eq('subscriptionId', subId);

    if (updateError) {
      console.error('Error updating invoice:', updateError);
      throw updateError;
    }
  } catch (error) {
    console.error('Error handling invoice:', error);
    throw error;
  }
}

/**
 * Main webhook handler
 */
export async function POST(req: NextRequest) {
  // Check if Stripe is available
  if (!stripe) {
    return new NextResponse('Stripe not configured', { status: 500 });
  }

  const sig = req.headers.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  if (!sig) {
    return new NextResponse('Missing stripe-signature header', { status: 400 });
  }

  let event: Stripe.Event;

  try {
    // Read raw body for signature verification
    const body = await req.text();
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
    console.error('Webhook signature verification failed:', errorMessage);
    return new NextResponse(`Webhook Error: ${errorMessage}`, { status: 400 });
  }

  try {
    // Check idempotency: skip if already processed
    // Initialize Supabase client for idempotency check
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: alreadyProcessed } = await supabase
      .from('webhookEvents')
      .select()
      .eq('eventId', event.id);

    if (alreadyProcessed) {
      console.log(`Event ${event.id} already processed, skipping`);
      return NextResponse.json({ received: true, alreadyProcessed: true });
    }

    // Process event based on type
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event);
        break;

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await handleSubscriptionChange(event);
        break;

      case 'invoice.paid':
      case 'invoice.payment_failed':
        await handleInvoice(event);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
        break;
    }

    // Record successful processing
    const { error: insertError } = await supabase
      .from('webhookEvents')
      .insert({
        eventId: event.id,
        type: event.type,
        objectId: getObjectId(event),
        status: 'processed',
        processedAt: new Date().toISOString(),
      });

    if (insertError) {
      console.error('Failed to record webhook success:', insertError);
    }

    return NextResponse.json({ received: true });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Webhook handler failed:', error);

    // Record failure for retry/DLQ
    try {
      // Initialize Supabase client for failure recording
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { error: insertError } = await supabase
        .from('webhookEvents')
        .insert({
          eventId: event.id,
          type: event.type,
          objectId: getObjectId(event),
          status: 'failed',
          error: errorMessage.slice(0, 500),
          processedAt: new Date().toISOString(),
        });

      if (insertError) {
        console.error('Failed to record webhook failure:', insertError);
      }
    } catch (dbError) {
      console.error('Failed to record webhook failure:', dbError);
    }

    // Return 500 to trigger Stripe retry
    return new NextResponse(`Webhook handler failed: ${errorMessage}`, { status: 500 });
  }
}

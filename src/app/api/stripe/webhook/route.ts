import { NextRequest, NextResponse } from 'next/server';
import { stripe, mapPriceToPlan } from '@/lib/stripe';
import { db } from '@/drizzle';
import { users, subscriptions, webhookEvents } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import Stripe from 'stripe';

// Disable body parsing for raw body access
export const config = {
  api: { bodyParser: false },
};

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
  const session = event.data.object as Stripe.Checkout.Session;
  const customerId = session.customer as string | null;
  const appUserId = session.metadata?.appUserId;

  if (!appUserId || !customerId) return;

  try {
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

    // Update user with Stripe customer ID
    await db.update(users)
      .set({ 
        stripeCustomerId: customerId,
        updatedAt: new Date(),
      })
      .where(eq(users.id, appUserId));

    // Create subscription record
    if (sub) {
      const price = sub.items.data[0]?.price;
      const planPriceId = price?.id ?? null;
      const productId = typeof price?.product === 'object' ? price.product?.id : null;
      const plan = mapPriceToPlan(planPriceId);

      await db.insert(subscriptions).values({
        subscriptionId: sub.id,
        userId: appUserId,
        customerId: customerId,
        status: sub.status,
        cancelAtPeriodEnd: sub.cancel_at_period_end ?? false,
        currentPeriodStart: toDate(sub.current_period_start),
        currentPeriodEnd: toDate(sub.current_period_end),
        trialEnd: toDate(sub.trial_end),
        priceId: planPriceId,
        productId,
        plan,
        quantity: sub.items.data[0]?.quantity ?? 1,
        latestInvoiceId: typeof sub.latest_invoice === 'string' ? sub.latest_invoice : sub.latest_invoice?.id ?? null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
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
  const payload = event.data.object as Stripe.Subscription;
  
  try {
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

    await db.transaction(async (tx) => {
      const user = await tx.query.users.findFirst({
        where: eq(users.email, email),
      });
      if (!user) throw new Error(`User not found for ${email}`);

      // Try update first, then insert if not exists
      const updated = await tx
        .update(subscriptions)
        .set({
          userId: user.id,
          customerId: typeof sub.customer === 'string' ? sub.customer : sub.customer.id,
          status: sub.status,
          cancelAtPeriodEnd: sub.cancel_at_period_end ?? false,
          currentPeriodStart: toDate(sub.current_period_start),
          currentPeriodEnd: toDate(sub.current_period_end),
          trialEnd: toDate(sub.trial_end),
          priceId: planPriceId,
          productId,
          plan,
          quantity: sub.items.data[0]?.quantity ?? 1,
          latestInvoiceId: typeof sub.latest_invoice === 'string' ? sub.latest_invoice : sub.latest_invoice?.id ?? null,
          updatedAt: new Date(),
        })
        .where(eq(subscriptions.subscriptionId, sub.id))
        .returning();

      if (updated.length === 0) {
        // Insert if not exists
        await tx.insert(subscriptions).values({
          subscriptionId: sub.id,
          userId: user.id,
          customerId: typeof sub.customer === 'string' ? sub.customer : sub.customer.id,
          status: sub.status,
          cancelAtPeriodEnd: sub.cancel_at_period_end ?? false,
          currentPeriodStart: toDate(sub.current_period_start),
          currentPeriodEnd: toDate(sub.current_period_end),
          trialEnd: toDate(sub.trial_end),
          priceId: planPriceId,
          productId,
          plan,
          quantity: sub.items.data[0]?.quantity ?? 1,
          latestInvoiceId: typeof sub.latest_invoice === 'string' ? sub.latest_invoice : sub.latest_invoice?.id ?? null,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    });
  } catch (error) {
    console.error('Error handling subscription change:', error);
    throw error;
  }
}

/**
 * Handle invoice events
 */
async function handleInvoice(event: Stripe.Event) {
  const invoice = event.data.object as Stripe.Invoice;
  const subId = typeof invoice.subscription === 'string' ? invoice.subscription : invoice.subscription?.id;
  if (!subId) return;

  try {
    await db.update(subscriptions)
      .set({
        latestInvoiceId: invoice.id,
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.subscriptionId, subId));
  } catch (error) {
    console.error('Error handling invoice:', error);
    throw error;
  }
}

/**
 * Main webhook handler
 */
export async function POST(req: NextRequest) {
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
    const alreadyProcessed = await db.query.webhookEvents.findFirst({
      where: eq(webhookEvents.eventId, event.id),
    });

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
    await db.insert(webhookEvents).values({
      eventId: event.id,
      type: event.type,
      objectId: getObjectId(event),
      status: 'processed',
      processedAt: new Date(),
    });

    return NextResponse.json({ received: true });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Webhook handler failed:', error);

    // Record failure for retry/DLQ
    try {
      await db.insert(webhookEvents).values({
        eventId: event.id,
        type: event.type,
        objectId: getObjectId(event),
        status: 'failed',
        error: errorMessage.slice(0, 500),
        processedAt: new Date(),
      });
    } catch (dbError) {
      console.error('Failed to record webhook failure:', dbError);
    }

    // Return 500 to trigger Stripe retry
    return new NextResponse(`Webhook handler failed: ${errorMessage}`, { status: 500 });
  }
}

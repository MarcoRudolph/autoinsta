import { pgTable, text, timestamp, boolean, integer } from 'drizzle-orm/pg-core';
import { users } from './users';

export const subscriptions = pgTable('subscriptions', {
  // Stripe identifiers
  subscriptionId: text('subscription_id').primaryKey(), // Stripe subscription ID
  customerId: text('customer_id').notNull(), // Stripe customer ID
  
  // User relationship
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  // Subscription details
  status: text('status').notNull(), // 'trialing', 'active', 'past_due', 'canceled', 'incomplete', 'incomplete_expired', 'unpaid', 'paused'
  cancelAtPeriodEnd: boolean('cancel_at_period_end').notNull().default(false),
  
  // Period management
  currentPeriodStart: timestamp('current_period_start', { withTimezone: true }),
  currentPeriodEnd: timestamp('current_period_end', { withTimezone: true }),
  trialEnd: timestamp('trial_end', { withTimezone: true }),
  
  // Plan and pricing
  priceId: text('price_id'), // Stripe price ID
  productId: text('product_id'), // Stripe product ID
  plan: text('plan').notNull(), // 'free', 'pro', 'enterprise'
  quantity: integer('quantity').notNull().default(1),
  
  // Invoice tracking
  latestInvoiceId: text('latest_invoice_id'),
  
  // Timestamps
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// Webhook events table for idempotency
export const webhookEvents = pgTable('webhook_events', {
  eventId: text('event_id').primaryKey(), // Stripe event ID
  type: text('type').notNull(), // Event type
  objectId: text('object_id'), // Related Stripe object ID
  status: text('status').notNull(), // 'processed' | 'failed' | 'aux'
  error: text('error'), // Error message if failed
  processedAt: timestamp('processed_at', { withTimezone: true }).notNull(),
});

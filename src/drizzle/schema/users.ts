import { pgTable, uuid, varchar, timestamp, text, boolean } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('passwordHash', { length: 255 }).notNull(),
  instaAccessToken: varchar('instaAccessToken', { length: 255 }),
  
  // Subscription fields for Stripe integration (using snake_case to match DB)
  stripeCustomerId: text('stripe_customer_id'), // Stripe customer reference
  subscriptionStatus: text('subscription_status').default('free'), // 'free', 'pro', 'cancelled', 'past_due'
  subscriptionPlan: text('subscription_plan').default('free'), // 'free', 'pro', 'enterprise'
  subscriptionStartDate: timestamp('subscription_start_date'),
  subscriptionEndDate: timestamp('subscription_end_date'),
  isPro: boolean('is_pro').default(false), // Quick check for pro features
  
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
}); 
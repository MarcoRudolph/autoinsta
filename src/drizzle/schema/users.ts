import { pgTable, text, timestamp, boolean } from 'drizzle-orm/pg-core';
import { v4 as uuidv4 } from 'uuid';

export const users = pgTable('users', {
  id: text('id').primaryKey().notNull().$defaultFn(() => uuidv4()),
  email: text('email').notNull().unique(),
  passwordHash: text('passwordHash').notNull(),
  instaAccessToken: text('instaAccessToken'),
  locale: text('locale').default('en'), // User's preferred language ('en' or 'de')
  
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
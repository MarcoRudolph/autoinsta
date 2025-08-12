-- Add only the essential Stripe fields to users table
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "stripe_customer_id" text;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "subscription_status" text DEFAULT 'free';
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "subscription_plan" text DEFAULT 'free';
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "subscription_start_date" timestamp;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "subscription_end_date" timestamp;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "is_pro" boolean DEFAULT false;

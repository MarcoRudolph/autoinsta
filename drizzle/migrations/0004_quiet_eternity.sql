-- Create tables if missing (migrations assumed they existed from an earlier state)
CREATE TABLE IF NOT EXISTS "subscriptions" (
  "subscription_id" text PRIMARY KEY NOT NULL,
  "customer_id" text NOT NULL,
  "user_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "status" text NOT NULL,
  "cancel_at_period_end" boolean NOT NULL DEFAULT false,
  "current_period_start" timestamp with time zone,
  "current_period_end" timestamp with time zone,
  "trial_end" timestamp with time zone,
  "price_id" text,
  "product_id" text,
  "plan" text NOT NULL,
  "quantity" integer NOT NULL DEFAULT 1,
  "latest_invoice_id" text,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "webhook_events" (
  "event_id" text PRIMARY KEY NOT NULL,
  "type" text NOT NULL,
  "object_id" text,
  "status" text NOT NULL,
  "error" text,
  "processed_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "subscriptions" ALTER COLUMN "user_id" SET DATA TYPE text;
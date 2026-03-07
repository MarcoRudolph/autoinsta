ALTER TABLE "instagram_threads"
  ADD COLUMN IF NOT EXISTS "incoming_message_count" integer NOT NULL DEFAULT 0;
--> statement-breakpoint
ALTER TABLE "instagram_threads"
  ADD COLUMN IF NOT EXISTS "outgoing_message_count" integer NOT NULL DEFAULT 0;
--> statement-breakpoint
ALTER TABLE "instagram_threads"
  ADD COLUMN IF NOT EXISTS "last_incoming_at" timestamp with time zone;
--> statement-breakpoint
ALTER TABLE "instagram_threads"
  ADD COLUMN IF NOT EXISTS "last_outgoing_at" timestamp with time zone;
--> statement-breakpoint
ALTER TABLE "instagram_threads"
  ADD COLUMN IF NOT EXISTS "last_promo_at" timestamp with time zone;
--> statement-breakpoint
ALTER TABLE "instagram_threads"
  ADD COLUMN IF NOT EXISTS "last_promo_message_id" text;
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "instagram_promo_audit" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "ig_account_id" text NOT NULL,
  "thread_key" text NOT NULL,
  "platform_message_id" text,
  "persona_id" text,
  "decision" text NOT NULL,
  "reason" text NOT NULL,
  "selected_link_url" text,
  "selected_action_type" text,
  "selected_sending_behavior" text,
  "metadata" jsonb,
  "created_at" timestamp with time zone NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "instagram_promo_audit_thread_created_idx"
  ON "instagram_promo_audit" ("ig_account_id", "thread_key", "created_at");

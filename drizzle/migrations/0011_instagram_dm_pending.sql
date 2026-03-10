CREATE TABLE IF NOT EXISTS "instagram_dm_pending" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "ig_account_id" text NOT NULL,
  "thread_key" text NOT NULL,
  "inbound_payload" jsonb NOT NULL,
  "thread_state" jsonb NOT NULL,
  "status" text NOT NULL DEFAULT 'pending',
  "error_message" text,
  "processed_at" timestamp with time zone,
  "created_at" timestamp with time zone NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "instagram_dm_pending_status_idx" ON "instagram_dm_pending" ("status");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "instagram_dm_pending_created_idx" ON "instagram_dm_pending" ("created_at");

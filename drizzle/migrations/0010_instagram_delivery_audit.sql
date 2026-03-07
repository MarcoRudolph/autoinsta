CREATE TABLE IF NOT EXISTS "instagram_delivery_audit" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "ig_account_id" text NOT NULL,
  "thread_key" text NOT NULL,
  "direction" text NOT NULL,
  "status" text NOT NULL,
  "provider_message_id" text,
  "error_code" integer,
  "error_type" text,
  "error_message" text,
  "retry_count" integer NOT NULL DEFAULT 0,
  "metadata" jsonb,
  "created_at" timestamp with time zone NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "instagram_delivery_audit_thread_created_idx"
  ON "instagram_delivery_audit" ("ig_account_id", "thread_key", "created_at");

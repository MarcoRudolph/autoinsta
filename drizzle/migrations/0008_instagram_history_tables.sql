CREATE TABLE IF NOT EXISTS "instagram_connections" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" text,
  "ig_account_id" text NOT NULL,
  "ig_username" text,
  "provider" text NOT NULL DEFAULT 'instagram',
  "access_token" text,
  "token_expires_at" timestamp with time zone,
  "scopes" jsonb,
  "status" text NOT NULL DEFAULT 'connected',
  "webhook_verified" boolean NOT NULL DEFAULT false,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "instagram_connections_ig_account_id_uidx"
  ON "instagram_connections" ("ig_account_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "instagram_connections_user_id_idx"
  ON "instagram_connections" ("user_id");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "instagram_threads" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "ig_account_id" text NOT NULL,
  "thread_key" text NOT NULL,
  "participant_ig_id" text,
  "last_message_at" timestamp with time zone,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "instagram_threads_account_thread_uidx"
  ON "instagram_threads" ("ig_account_id", "thread_key");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "instagram_threads_account_idx"
  ON "instagram_threads" ("ig_account_id");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "instagram_messages" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "ig_account_id" text NOT NULL,
  "thread_key" text NOT NULL,
  "platform_message_id" text NOT NULL,
  "message_kind" text NOT NULL,
  "direction" text NOT NULL DEFAULT 'unknown',
  "sender_ig_id" text,
  "recipient_ig_id" text,
  "message_text" text,
  "sent_at" timestamp with time zone NOT NULL,
  "raw_payload" jsonb NOT NULL,
  "created_at" timestamp with time zone NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "instagram_messages_platform_message_id_uidx"
  ON "instagram_messages" ("platform_message_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "instagram_messages_thread_time_idx"
  ON "instagram_messages" ("ig_account_id", "thread_key", "sent_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "instagram_messages_sender_idx"
  ON "instagram_messages" ("sender_ig_id");

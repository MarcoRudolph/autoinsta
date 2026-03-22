CREATE TABLE IF NOT EXISTS "telegram_link_tokens" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "token" text NOT NULL,
  "user_id" text NOT NULL,
  "expires_at" timestamp with time zone NOT NULL,
  "used_at" timestamp with time zone,
  "created_at" timestamp with time zone NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "telegram_link_tokens_token_uidx" ON "telegram_link_tokens" ("token");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "telegram_link_tokens_user_id_idx" ON "telegram_link_tokens" ("user_id");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "telegram_identities" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" text NOT NULL,
  "telegram_user_id" text NOT NULL,
  "telegram_username" text,
  "status" text NOT NULL DEFAULT 'linked',
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "telegram_identities_user_id_uidx" ON "telegram_identities" ("user_id");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "telegram_identities_telegram_user_id_uidx" ON "telegram_identities" ("telegram_user_id");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "telegram_chat_links" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" text NOT NULL,
  "telegram_chat_id" text NOT NULL,
  "kind" text NOT NULL,
  "title" text,
  "enabled" boolean NOT NULL DEFAULT true,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "telegram_chat_links_user_chat_uidx" ON "telegram_chat_links" ("user_id", "telegram_chat_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "telegram_chat_links_user_id_idx" ON "telegram_chat_links" ("user_id");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "telegram_threads" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" text NOT NULL,
  "thread_key" text NOT NULL,
  "chat_kind" text,
  "participant_telegram_user_id" text,
  "incoming_message_count" integer NOT NULL DEFAULT 0,
  "outgoing_message_count" integer NOT NULL DEFAULT 0,
  "last_incoming_at" timestamp with time zone,
  "last_outgoing_at" timestamp with time zone,
  "last_promo_at" timestamp with time zone,
  "last_promo_message_id" text,
  "last_message_at" timestamp with time zone,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "telegram_threads_user_thread_uidx" ON "telegram_threads" ("user_id", "thread_key");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "telegram_threads_user_id_idx" ON "telegram_threads" ("user_id");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "telegram_messages" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" text NOT NULL,
  "thread_key" text NOT NULL,
  "platform_message_id" text NOT NULL,
  "message_kind" text NOT NULL,
  "direction" text NOT NULL DEFAULT 'unknown',
  "sender_telegram_user_id" text,
  "recipient_telegram_user_id" text,
  "chat_id" text NOT NULL,
  "message_text" text,
  "sent_at" timestamp with time zone NOT NULL,
  "raw_payload" jsonb NOT NULL,
  "created_at" timestamp with time zone NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "telegram_messages_platform_message_id_uidx" ON "telegram_messages" ("platform_message_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "telegram_messages_thread_time_idx" ON "telegram_messages" ("user_id", "thread_key", "sent_at");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "telegram_dm_pending" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" text NOT NULL,
  "thread_key" text NOT NULL,
  "update_kind" text NOT NULL,
  "inbound_payload" jsonb NOT NULL,
  "thread_state" jsonb NOT NULL,
  "status" text NOT NULL DEFAULT 'pending',
  "error_message" text,
  "processed_at" timestamp with time zone,
  "created_at" timestamp with time zone NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "telegram_dm_pending_status_idx" ON "telegram_dm_pending" ("status");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "telegram_dm_pending_created_idx" ON "telegram_dm_pending" ("created_at");

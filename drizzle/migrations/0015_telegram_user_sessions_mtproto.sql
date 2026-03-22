DROP TABLE IF EXISTS "telegram_link_tokens";

DROP TABLE IF EXISTS "telegram_identities";

CREATE TABLE IF NOT EXISTS "telegram_user_sessions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" text NOT NULL,
  "encrypted_session" text,
  "phone_number" text,
  "phone_code_hash" text,
  "intended_username" text,
  "telegram_user_id" text,
  "telegram_username" text,
  "status" text NOT NULL DEFAULT 'disconnected',
  "last_error" text,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS "telegram_user_sessions_user_id_uidx" ON "telegram_user_sessions" ("user_id");
CREATE INDEX IF NOT EXISTS "telegram_user_sessions_tg_user_idx" ON "telegram_user_sessions" ("telegram_user_id");

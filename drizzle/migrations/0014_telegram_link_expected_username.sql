ALTER TABLE "telegram_link_tokens"
ADD COLUMN IF NOT EXISTS "expected_telegram_username" text;

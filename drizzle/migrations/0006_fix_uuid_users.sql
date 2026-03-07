-- Fix users table to use UUID with default generation
-- This migration restores the UUID functionality that was broken in migration 0003

-- First, ensure the uuid-ossp extension is available for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Change users.id back to UUID with proper default generation
ALTER TABLE "users" ALTER COLUMN "id" SET DATA TYPE uuid USING uuid_generate_v4();
ALTER TABLE "users" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4();

-- Ensure personas.userId is properly typed as UUID (should already be correct from migration 0001)
-- But let's make sure the foreign key constraint is properly set
ALTER TABLE "personas" DROP CONSTRAINT IF EXISTS "personas_userId_users_id_fk";
ALTER TABLE "personas" ADD CONSTRAINT "personas_userId_users_id_fk" 
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Ensure subscriptions.user_id is properly typed as UUID to match users.id
ALTER TABLE "subscriptions" ALTER COLUMN "user_id" SET DATA TYPE uuid USING uuid_generate_v4();
ALTER TABLE "subscriptions" DROP CONSTRAINT IF EXISTS "subscriptions_user_id_users_id_fk";
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_users_id_fk" 
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;


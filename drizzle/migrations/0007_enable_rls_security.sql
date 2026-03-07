-- Enable Row Level Security (RLS) on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
-- Users can only read/update their own data
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid()::text = id);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid()::text = id);

-- Users can insert their own profile (during registration)
CREATE POLICY "Users can insert own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid()::text = id);

-- Users cannot delete their own profile (use soft delete instead)
-- CREATE POLICY "Users can delete own profile" ON public.users
--     FOR DELETE USING (auth.uid()::text = id);

-- Create policies for personas table
-- Users can only access their own personas
CREATE POLICY "Users can view own personas" ON public.personas
    FOR SELECT USING (auth.uid()::text = userId::text);

CREATE POLICY "Users can insert own personas" ON public.personas
    FOR INSERT WITH CHECK (auth.uid()::text = userId::text);

CREATE POLICY "Users can update own personas" ON public.personas
    FOR UPDATE USING (auth.uid()::text = userId::text);

CREATE POLICY "Users can delete own personas" ON public.personas
    FOR DELETE USING (auth.uid()::text = userId::text);

-- Create policies for subscriptions table
-- Users can only access their own subscriptions
CREATE POLICY "Users can view own subscriptions" ON public.subscriptions
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own subscriptions" ON public.subscriptions
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own subscriptions" ON public.subscriptions
    FOR UPDATE USING (auth.uid()::text = user_id);

-- Users cannot delete subscriptions (managed by Stripe webhooks)
-- CREATE POLICY "Users can delete own subscriptions" ON public.subscriptions
--     FOR DELETE USING (auth.uid()::text = user_id);

-- Create policies for webhook_events table
-- This table should only be accessible by authenticated users for audit purposes
-- or by service role for webhook processing
CREATE POLICY "Authenticated users can view webhook events" ON public.webhook_events
    FOR SELECT USING (auth.role() = 'authenticated');

-- Only service role can insert/update webhook events
CREATE POLICY "Service role can manage webhook events" ON public.webhook_events
    FOR ALL USING (auth.role() = 'service_role');

-- Grant necessary permissions to authenticated users
GRANT SELECT, INSERT, UPDATE ON public.users TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.personas TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.subscriptions TO authenticated;
GRANT SELECT ON public.webhook_events TO authenticated;

-- Grant all permissions to service role (for webhook processing, admin operations)
GRANT ALL ON public.users TO service_role;
GRANT ALL ON public.personas TO service_role;
GRANT ALL ON public.subscriptions TO service_role;
GRANT ALL ON public.webhook_events TO service_role;



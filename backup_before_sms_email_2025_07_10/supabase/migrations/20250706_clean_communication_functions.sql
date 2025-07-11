-- Drop existing edge function references (these need to be manually removed via Supabase dashboard)
-- This migration prepares the database for fresh edge function setup

-- Create or update the email/SMS communication tracking tables
CREATE TABLE IF NOT EXISTS public.sms_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    recipient_phone TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'delivered')),
    provider TEXT DEFAULT 'telnyx',
    provider_message_id TEXT,
    error_message TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    user_id UUID REFERENCES auth.users(id),
    client_id TEXT REFERENCES public.clients(id),
    job_id TEXT REFERENCES public.jobs(id),
    automation_id UUID,
    workflow_id UUID
);

-- Create email logs table if not exists
CREATE TABLE IF NOT EXISTS public.email_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    recipient_email TEXT NOT NULL,
    subject TEXT NOT NULL,
    body TEXT,
    html TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'delivered', 'bounced')),
    provider TEXT DEFAULT 'mailgun',
    provider_message_id TEXT,
    error_message TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    user_id UUID REFERENCES auth.users(id),
    client_id TEXT REFERENCES public.clients(id),
    job_id TEXT REFERENCES public.jobs(id),
    automation_id UUID,
    workflow_id UUID
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_sms_logs_user_id ON public.sms_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_sms_logs_client_id ON public.sms_logs(client_id);
CREATE INDEX IF NOT EXISTS idx_sms_logs_created_at ON public.sms_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_sms_logs_status ON public.sms_logs(status);

CREATE INDEX IF NOT EXISTS idx_email_logs_user_id ON public.email_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_client_id ON public.email_logs(client_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_created_at ON public.email_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON public.email_logs(status);

-- Create RLS policies
ALTER TABLE public.sms_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own SMS logs" ON public.sms_logs;
DROP POLICY IF EXISTS "Users can insert their own SMS logs" ON public.sms_logs;
DROP POLICY IF EXISTS "Users can view their own email logs" ON public.email_logs;
DROP POLICY IF EXISTS "Users can insert their own email logs" ON public.email_logs;

-- Create new policies
CREATE POLICY "Users can view their own SMS logs" ON public.sms_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own SMS logs" ON public.sms_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own email logs" ON public.email_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own email logs" ON public.email_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Add function to clean up old logs (30 days retention)
CREATE OR REPLACE FUNCTION public.cleanup_old_communication_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Delete SMS logs older than 30 days
    DELETE FROM public.sms_logs
    WHERE created_at < NOW() - INTERVAL '30 days';
    
    -- Delete email logs older than 30 days
    DELETE FROM public.email_logs
    WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$;

-- Grant necessary permissions
GRANT ALL ON public.sms_logs TO authenticated;
GRANT ALL ON public.email_logs TO authenticated;

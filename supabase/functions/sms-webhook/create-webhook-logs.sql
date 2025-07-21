
-- Create table for SMS webhook logging
CREATE TABLE IF NOT EXISTS public.sms_webhook_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  payload JSONB,
  error TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.sms_webhook_logs ENABLE ROW LEVEL SECURITY;

-- Create policy for service role to manage logs
CREATE POLICY "Service role can manage webhook logs" ON public.sms_webhook_logs
  FOR ALL USING (auth.role() = 'service_role');

-- Create policy for authenticated users to view their logs
CREATE POLICY "Users can view webhook logs" ON public.sms_webhook_logs
  FOR SELECT USING (auth.role() = 'authenticated');

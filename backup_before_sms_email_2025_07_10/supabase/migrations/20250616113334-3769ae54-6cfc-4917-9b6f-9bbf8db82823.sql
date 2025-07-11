
-- Add unique constraint to prevent duplicate client portal users
-- This ensures one portal user per client-email combination
ALTER TABLE public.client_portal_users 
ADD CONSTRAINT unique_client_email 
UNIQUE (client_id, email);

-- Add index for better performance on token lookups
CREATE INDEX IF NOT EXISTS idx_client_portal_sessions_token 
ON public.client_portal_sessions (token);

-- Add index for better performance on expired session cleanup
CREATE INDEX IF NOT EXISTS idx_client_portal_sessions_expires_at 
ON public.client_portal_sessions (expires_at);

-- Ensure proper RLS policies exist for client portal tables
ALTER TABLE public.client_portal_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_portal_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_portal_activity_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for client portal users (admin access only)
CREATE POLICY "Admin can manage client portal users" 
ON public.client_portal_users 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Create RLS policy for client portal sessions (admin access only)
CREATE POLICY "Admin can manage client portal sessions" 
ON public.client_portal_sessions 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Create RLS policy for client portal activity logs (admin access only)
CREATE POLICY "Admin can view client portal activity logs" 
ON public.client_portal_activity_logs 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

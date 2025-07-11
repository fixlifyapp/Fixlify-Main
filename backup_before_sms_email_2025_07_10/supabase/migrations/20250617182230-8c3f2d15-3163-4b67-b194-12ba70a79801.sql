
-- Create enhanced portal tables for better functionality and security
CREATE TABLE IF NOT EXISTS public.portal_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  access_token text UNIQUE NOT NULL,
  client_id text NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  ip_address text,
  user_agent text,
  expires_at timestamp with time zone NOT NULL,
  last_accessed_at timestamp with time zone DEFAULT now(),
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- Create portal activity logs for audit trail
CREATE TABLE IF NOT EXISTS public.portal_activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES public.portal_sessions(id) ON DELETE CASCADE,
  client_id text NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  action text NOT NULL,
  resource_type text,
  resource_id text,
  ip_address text,
  user_agent text,
  metadata jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now()
);

-- Create portal preferences for client customization
CREATE TABLE IF NOT EXISTS public.portal_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id text UNIQUE NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  theme text DEFAULT 'light',
  language text DEFAULT 'en',
  notification_preferences jsonb DEFAULT '{"email": true, "sms": false}',
  timezone text DEFAULT 'UTC',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create portal documents table for file sharing
CREATE TABLE IF NOT EXISTS public.portal_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id text NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  document_type text NOT NULL, -- 'estimate', 'invoice', 'contract', 'photo', 'other'
  file_name text NOT NULL,
  file_path text NOT NULL,
  file_size bigint,
  mime_type text,
  is_downloadable boolean DEFAULT true,
  expires_at timestamp with time zone,
  uploaded_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone DEFAULT now()
);

-- Create portal messages for communication
CREATE TABLE IF NOT EXISTS public.portal_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id text NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  job_id text REFERENCES public.jobs(id) ON DELETE CASCADE,
  sender_type text NOT NULL, -- 'client', 'business'
  sender_name text NOT NULL,
  subject text,
  message text NOT NULL,
  is_read boolean DEFAULT false,
  attachments jsonb DEFAULT '[]',
  reply_to uuid REFERENCES public.portal_messages(id),
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on all portal tables
ALTER TABLE public.portal_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portal_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portal_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portal_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portal_messages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for portal tables (public access based on session validation)
CREATE POLICY "Allow public access to portal sessions for validation"
ON public.portal_sessions
FOR ALL
USING (true);

CREATE POLICY "Allow public access to portal activity logs"
ON public.portal_activity_logs
FOR ALL
USING (true);

CREATE POLICY "Allow public access to portal preferences"
ON public.portal_preferences
FOR ALL
USING (true);

CREATE POLICY "Allow public access to portal documents"
ON public.portal_documents
FOR ALL
USING (true);

CREATE POLICY "Allow public access to portal messages"
ON public.portal_messages
FOR ALL
USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_portal_sessions_token ON public.portal_sessions(access_token);
CREATE INDEX IF NOT EXISTS idx_portal_sessions_client ON public.portal_sessions(client_id);
CREATE INDEX IF NOT EXISTS idx_portal_sessions_expires ON public.portal_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_portal_activity_client ON public.portal_activity_logs(client_id);
CREATE INDEX IF NOT EXISTS idx_portal_documents_client ON public.portal_documents(client_id);
CREATE INDEX IF NOT EXISTS idx_portal_messages_client ON public.portal_messages(client_id);

-- Update the existing client_portal_access table structure if needed
ALTER TABLE public.client_portal_access 
ADD COLUMN IF NOT EXISTS permissions jsonb DEFAULT '{"view_estimates": true, "view_invoices": true, "make_payments": false}',
ADD COLUMN IF NOT EXISTS domain_restriction text DEFAULT 'portal.fixlify.app',
ADD COLUMN IF NOT EXISTS ip_restrictions text[],
ADD COLUMN IF NOT EXISTS max_uses integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS use_count integer DEFAULT 0;

-- Create function to validate portal access with enhanced security
CREATE OR REPLACE FUNCTION public.validate_portal_access(
  p_access_token text,
  p_ip_address text DEFAULT NULL,
  p_user_agent text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_session RECORD;
  v_client RECORD;
BEGIN
  -- Check if session exists and is valid
  SELECT * INTO v_session 
  FROM public.portal_sessions 
  WHERE access_token = p_access_token 
    AND expires_at > now() 
    AND is_active = true;
  
  IF NOT FOUND THEN
    -- Also check client_portal_access for backward compatibility
    SELECT cpa.*, c.name as client_name, c.email as client_email
    INTO v_session
    FROM public.client_portal_access cpa
    JOIN public.clients c ON c.id = cpa.client_id
    WHERE cpa.access_token = p_access_token 
      AND cpa.expires_at > now()
      AND (cpa.max_uses IS NULL OR cpa.use_count < cpa.max_uses);
    
    IF NOT FOUND THEN
      RETURN jsonb_build_object('valid', false, 'error', 'Invalid or expired access token');
    END IF;
    
    -- Update use count for client_portal_access
    UPDATE public.client_portal_access 
    SET use_count = use_count + 1, used_at = now()
    WHERE access_token = p_access_token;
  ELSE
    -- Update last accessed time for portal_sessions
    UPDATE public.portal_sessions 
    SET last_accessed_at = now()
    WHERE access_token = p_access_token;
  END IF;
  
  -- Get client information
  SELECT * INTO v_client FROM public.clients WHERE id = v_session.client_id;
  
  -- Log the access
  INSERT INTO public.portal_activity_logs (
    client_id, action, ip_address, user_agent, metadata
  ) VALUES (
    v_session.client_id, 
    'portal_access', 
    p_ip_address, 
    p_user_agent,
    jsonb_build_object('access_token_type', CASE WHEN v_session.id IS NOT NULL THEN 'session' ELSE 'legacy' END)
  );
  
  RETURN jsonb_build_object(
    'valid', true,
    'client_id', v_session.client_id,
    'client_name', COALESCE(v_session.client_name, v_client.name),
    'client_email', COALESCE(v_session.client_email, v_client.email),
    'permissions', COALESCE(v_session.permissions, '{"view_estimates": true, "view_invoices": true, "make_payments": false}'::jsonb)
  );
END;
$$;

-- Create function to generate enhanced portal access
CREATE OR REPLACE FUNCTION public.generate_portal_access(
  p_client_id text,
  p_permissions jsonb DEFAULT '{"view_estimates": true, "view_invoices": true, "make_payments": false}',
  p_hours_valid integer DEFAULT 72,
  p_domain_restriction text DEFAULT 'portal.fixlify.app'
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_access_token text;
  v_expires_at timestamp with time zone;
BEGIN
  -- Generate secure token
  v_access_token := encode(gen_random_bytes(32), 'base64');
  v_access_token := replace(replace(replace(v_access_token, '+', '-'), '/', '_'), '=', '');
  
  v_expires_at := now() + (p_hours_valid || ' hours')::interval;
  
  -- Insert into portal_sessions table
  INSERT INTO public.portal_sessions (
    access_token,
    client_id,
    expires_at
  ) VALUES (
    v_access_token,
    p_client_id,
    v_expires_at
  );
  
  -- Also insert into client_portal_access for backward compatibility
  INSERT INTO public.client_portal_access (
    access_token,
    client_id,
    document_type,
    document_id,
    expires_at,
    permissions,
    domain_restriction
  ) VALUES (
    v_access_token,
    p_client_id,
    'portal',
    gen_random_uuid(),
    v_expires_at,
    p_permissions,
    p_domain_restriction
  );
  
  RETURN v_access_token;
END;
$$;

-- Create trigger to update portal_preferences updated_at
CREATE OR REPLACE FUNCTION update_portal_preferences_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_update_portal_preferences_updated_at
  BEFORE UPDATE ON public.portal_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_portal_preferences_updated_at();

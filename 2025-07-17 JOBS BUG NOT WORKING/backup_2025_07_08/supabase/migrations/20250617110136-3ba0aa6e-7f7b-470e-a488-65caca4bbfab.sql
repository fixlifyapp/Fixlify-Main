
-- Create function to generate client portal access tokens
CREATE OR REPLACE FUNCTION public.generate_client_portal_access(
  p_client_id text,
  p_document_type text,
  p_document_id uuid,
  p_hours_valid integer DEFAULT 72
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  access_token text;
  expires_at timestamp with time zone;
BEGIN
  -- Generate a secure random token using base64 instead of base64url
  access_token := encode(gen_random_bytes(32), 'base64');
  
  -- Remove any problematic characters for URLs
  access_token := replace(replace(replace(access_token, '+', '-'), '/', '_'), '=', '');
  
  -- Calculate expiration time
  expires_at := now() + (p_hours_valid || ' hours')::interval;
  
  -- Store the access token
  INSERT INTO public.client_portal_access (
    access_token,
    client_id,
    document_type,
    document_id,
    expires_at,
    created_at
  ) VALUES (
    access_token,
    p_client_id,
    p_document_type,
    p_document_id,
    expires_at,
    now()
  );
  
  RETURN access_token;
END;
$$;

-- Create table to store client portal access tokens
CREATE TABLE IF NOT EXISTS public.client_portal_access (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  access_token text UNIQUE NOT NULL,
  client_id text NOT NULL,
  document_type text NOT NULL,
  document_id uuid NOT NULL,
  expires_at timestamp with time zone NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  used_at timestamp with time zone
);

-- Enable RLS on the table
ALTER TABLE public.client_portal_access ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to manage portal access
CREATE POLICY "Allow authenticated users to manage portal access"
ON public.client_portal_access
FOR ALL
USING (auth.role() = 'authenticated');

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_client_portal_access_token ON public.client_portal_access(access_token);
CREATE INDEX IF NOT EXISTS idx_client_portal_access_expires ON public.client_portal_access(expires_at);

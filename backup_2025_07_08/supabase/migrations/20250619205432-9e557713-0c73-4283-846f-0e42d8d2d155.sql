
-- Remove old portal tables (if they exist and are not used)
DROP TABLE IF EXISTS public.client_portal_sessions CASCADE;
DROP TABLE IF EXISTS public.client_portal_users CASCADE;
DROP TABLE IF EXISTS public.secure_document_access CASCADE;

-- Remove old functions
DROP FUNCTION IF EXISTS public.generate_client_portal_access(text, text, uuid, integer);
DROP FUNCTION IF EXISTS public.generate_client_login_token(text, integer);
DROP FUNCTION IF EXISTS public.generate_client_login_token(text);
DROP FUNCTION IF EXISTS public.verify_client_login_token(text);
DROP FUNCTION IF EXISTS public.validate_client_session(text);
DROP FUNCTION IF EXISTS public.generate_secure_document_access(text, uuid, text, integer);

-- Keep only the main portal access functions
-- Ensure generate_portal_access function exists with correct signature
CREATE OR REPLACE FUNCTION public.generate_portal_access(
  p_client_id text,
  p_permissions jsonb DEFAULT '{"view_estimates": true, "view_invoices": true, "make_payments": false}'::jsonb,
  p_hours_valid integer DEFAULT 72,
  p_domain_restriction text DEFAULT 'hub.fixlify.app'::text
) RETURNS text
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
  
  -- Store in client_portal_access table
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

-- Ensure validate_portal_access function exists with correct signature
CREATE OR REPLACE FUNCTION public.validate_portal_access(
  p_access_token text,
  p_ip_address text DEFAULT NULL::text,
  p_user_agent text DEFAULT NULL::text
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_access RECORD;
  v_client RECORD;
BEGIN
  -- Check if access token exists and is valid
  SELECT * INTO v_access 
  FROM public.client_portal_access 
  WHERE access_token = p_access_token 
    AND expires_at > now()
    AND (max_uses IS NULL OR use_count < max_uses);
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('valid', false, 'error', 'Invalid or expired access token');
  END IF;
  
  -- Get client information
  SELECT * INTO v_client FROM public.clients WHERE id = v_access.client_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('valid', false, 'error', 'Client not found');
  END IF;
  
  -- Update use count
  UPDATE public.client_portal_access 
  SET use_count = use_count + 1, used_at = now()
  WHERE access_token = p_access_token;
  
  -- Log the access
  INSERT INTO public.portal_activity_logs (
    client_id, action, ip_address, user_agent, metadata
  ) VALUES (
    v_access.client_id, 
    'portal_access', 
    p_ip_address, 
    p_user_agent,
    jsonb_build_object('access_token_used', true)
  );
  
  RETURN jsonb_build_object(
    'valid', true,
    'client_id', v_client.id,
    'client', jsonb_build_object(
      'id', v_client.id,
      'name', v_client.name,
      'email', v_client.email,
      'phone', v_client.phone,
      'address', v_client.address,
      'city', v_client.city,
      'state', v_client.state,
      'zip', v_client.zip
    ),
    'permissions', COALESCE(v_access.permissions, '{"view_estimates": true, "view_invoices": true, "make_payments": false}'::jsonb)
  );
END;
$$;

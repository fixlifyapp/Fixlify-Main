
-- Create document_approvals table for tracking approval tokens and responses
CREATE TABLE public.document_approvals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  approval_token TEXT NOT NULL UNIQUE,
  document_type TEXT NOT NULL CHECK (document_type IN ('estimate', 'invoice')),
  document_id UUID NOT NULL,
  document_number TEXT NOT NULL,
  client_id TEXT NOT NULL,
  client_name TEXT,
  client_email TEXT,
  client_phone TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'expired')),
  client_response TEXT,
  signature_data TEXT,
  approved_at TIMESTAMP WITH TIME ZONE,
  ip_address TEXT,
  user_agent TEXT,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '7 days'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create message_templates table for configurable SMS/email templates
CREATE TABLE public.message_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  template_type TEXT NOT NULL CHECK (template_type IN ('estimate_send', 'invoice_send', 'estimate_approved', 'invoice_approved', 'estimate_rejected', 'invoice_rejected', 'deposit_request')),
  template_name TEXT NOT NULL,
  message_content TEXT NOT NULL,
  variables JSONB DEFAULT '[]'::jsonb,
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, template_type, template_name)
);

-- Add RLS policies for document_approvals
ALTER TABLE public.document_approvals ENABLE ROW LEVEL SECURITY;

-- Public access for approval pages (no auth required)
CREATE POLICY "Public can view pending approvals by token" 
  ON public.document_approvals 
  FOR SELECT 
  USING (status = 'pending' AND expires_at > now());

-- Public can update approvals (approve/reject)
CREATE POLICY "Public can update pending approvals by token" 
  ON public.document_approvals 
  FOR UPDATE 
  USING (status = 'pending' AND expires_at > now());

-- Authenticated users can view their approvals
CREATE POLICY "Users can view their document approvals" 
  ON public.document_approvals 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM clients c 
      WHERE c.id = document_approvals.client_id 
      AND c.created_by = auth.uid()
    )
  );

-- Add RLS policies for message_templates
ALTER TABLE public.message_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their message templates" 
  ON public.message_templates 
  FOR ALL 
  USING (auth.uid() = user_id);

-- Add updated_at trigger for message_templates
CREATE TRIGGER update_message_templates_updated_at
  BEFORE UPDATE ON public.message_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default message templates
INSERT INTO public.message_templates (user_id, template_type, template_name, message_content, variables, is_default) VALUES
(gen_random_uuid(), 'estimate_send', 'Default Estimate SMS', 'Hi {client_name}! Your estimate #{estimate_number} is ready. Total: ${total}. Review and approve: {approval_link}', '["client_name", "estimate_number", "total", "approval_link"]'::jsonb, true),
(gen_random_uuid(), 'invoice_send', 'Default Invoice SMS', 'Hi {client_name}! Your invoice #{invoice_number} is ready. Amount Due: ${amount_due}. Review and pay: {approval_link}', '["client_name", "invoice_number", "amount_due", "approval_link"]'::jsonb, true),
(gen_random_uuid(), 'estimate_approved', 'Estimate Approved Notification', 'Great news! {client_name} has approved estimate #{estimate_number} for ${total}. Ready to schedule work!', '["client_name", "estimate_number", "total"]'::jsonb, true),
(gen_random_uuid(), 'invoice_approved', 'Invoice Approved Notification', '{client_name} has approved invoice #{invoice_number} for ${amount_due}. Payment confirmed!', '["client_name", "invoice_number", "amount_due"]'::jsonb, true),
(gen_random_uuid(), 'estimate_rejected', 'Estimate Rejected Notification', '{client_name} has rejected estimate #{estimate_number}. Reason: {rejection_reason}', '["client_name", "estimate_number", "rejection_reason"]'::jsonb, true),
(gen_random_uuid(), 'invoice_rejected', 'Invoice Rejected Notification', '{client_name} has rejected invoice #{invoice_number}. Reason: {rejection_reason}', '["client_name", "invoice_number", "rejection_reason"]'::jsonb, true),
(gen_random_uuid(), 'deposit_request', 'Deposit Request', 'Thank you for approving estimate #{estimate_number}! To secure your booking, please pay the 50% deposit of ${deposit_amount}. Payment link: {payment_link}', '["estimate_number", "deposit_amount", "payment_link"]'::jsonb, true);

-- Create function to generate approval tokens
CREATE OR REPLACE FUNCTION public.generate_approval_token(
  p_document_type text,
  p_document_id uuid,
  p_document_number text,
  p_client_id text,
  p_client_name text DEFAULT NULL,
  p_client_email text DEFAULT NULL,
  p_client_phone text DEFAULT NULL
) RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  approval_token text;
  expires_at timestamp with time zone;
BEGIN
  -- Generate secure token
  approval_token := encode(gen_random_bytes(32), 'base64');
  approval_token := replace(replace(replace(approval_token, '+', '-'), '/', '_'), '=', '');
  
  expires_at := now() + interval '7 days';
  
  -- Insert approval record
  INSERT INTO public.document_approvals (
    approval_token,
    document_type,
    document_id,
    document_number,
    client_id,
    client_name,
    client_email,
    client_phone,
    expires_at
  ) VALUES (
    approval_token,
    p_document_type,
    p_document_id,
    p_document_number,
    p_client_id,
    p_client_name,
    p_client_email,
    p_client_phone,
    expires_at
  );
  
  RETURN approval_token;
END;
$$;

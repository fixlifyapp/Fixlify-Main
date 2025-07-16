
-- Create estimate_communications table for logging all estimate communications
CREATE TABLE IF NOT EXISTS public.estimate_communications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  estimate_id UUID NOT NULL,
  communication_type TEXT NOT NULL CHECK (communication_type IN ('email', 'sms')),
  recipient TEXT NOT NULL,
  subject TEXT,
  content TEXT,
  status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'failed', 'pending')),
  external_id TEXT,
  estimate_number TEXT,
  client_name TEXT,
  client_email TEXT,
  client_phone TEXT,
  portal_link_included BOOLEAN DEFAULT false,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create invoice_communications table for logging all invoice communications
CREATE TABLE IF NOT EXISTS public.invoice_communications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id UUID NOT NULL,
  communication_type TEXT NOT NULL CHECK (communication_type IN ('email', 'sms')),
  recipient TEXT NOT NULL,
  subject TEXT,
  content TEXT,
  status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'failed', 'pending')),
  external_id TEXT,
  invoice_number TEXT,
  client_name TEXT,
  client_email TEXT,
  client_phone TEXT,
  portal_link_included BOOLEAN DEFAULT false,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create client_notifications table for client portal notifications
CREATE TABLE IF NOT EXISTS public.client_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id TEXT NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for estimate_communications
ALTER TABLE public.estimate_communications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own estimate communications" 
  ON public.estimate_communications 
  FOR SELECT 
  USING (
    estimate_id IN (
      SELECT e.id FROM public.estimates e 
      JOIN public.jobs j ON j.id = e.job_id 
      WHERE j.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can create estimate communications" 
  ON public.estimate_communications 
  FOR INSERT 
  WITH CHECK (
    estimate_id IN (
      SELECT e.id FROM public.estimates e 
      JOIN public.jobs j ON j.id = e.job_id 
      WHERE j.created_by = auth.uid()
    )
  );

-- Add RLS policies for invoice_communications
ALTER TABLE public.invoice_communications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own invoice communications" 
  ON public.invoice_communications 
  FOR SELECT 
  USING (
    invoice_id IN (
      SELECT i.id FROM public.invoices i 
      JOIN public.jobs j ON j.id = i.job_id 
      WHERE j.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can create invoice communications" 
  ON public.invoice_communications 
  FOR INSERT 
  WITH CHECK (
    invoice_id IN (
      SELECT i.id FROM public.invoices i 
      JOIN public.jobs j ON j.id = i.job_id 
      WHERE j.created_by = auth.uid()
    )
  );

-- Add RLS policies for client_notifications  
ALTER TABLE public.client_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view notifications for their clients" 
  ON public.client_notifications 
  FOR SELECT 
  USING (
    client_id IN (
      SELECT c.id FROM public.clients c 
      WHERE c.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can create notifications for their clients" 
  ON public.client_notifications 
  FOR INSERT 
  WITH CHECK (
    client_id IN (
      SELECT c.id FROM public.clients c 
      WHERE c.created_by = auth.uid()
    )
  );

-- Add updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_estimate_communications_updated_at 
    BEFORE UPDATE ON public.estimate_communications 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoice_communications_updated_at 
    BEFORE UPDATE ON public.invoice_communications 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_client_notifications_updated_at 
    BEFORE UPDATE ON public.client_notifications 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

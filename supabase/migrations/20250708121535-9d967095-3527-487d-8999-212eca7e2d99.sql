
-- Create missing communication tables for estimates and invoices
CREATE TABLE IF NOT EXISTS public.estimate_communications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  estimate_id UUID NOT NULL,
  estimate_number TEXT,
  client_id TEXT,
  client_name TEXT,
  client_email TEXT,
  client_phone TEXT,
  communication_type TEXT NOT NULL,
  recipient TEXT NOT NULL,
  subject TEXT,
  content TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  external_id TEXT,
  provider_message_id TEXT,
  portal_link_included BOOLEAN DEFAULT FALSE,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.invoice_communications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id UUID NOT NULL,
  invoice_number TEXT,
  client_id TEXT,
  client_name TEXT,
  client_email TEXT,
  client_phone TEXT,
  communication_type TEXT NOT NULL,
  recipient TEXT NOT NULL,
  subject TEXT,
  content TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  external_id TEXT,
  provider_message_id TEXT,
  portal_link_included BOOLEAN DEFAULT FALSE,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Add RLS policies for estimate_communications
ALTER TABLE public.estimate_communications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create their own estimate communications"
  ON public.estimate_communications
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can view their own estimate communications"
  ON public.estimate_communications
  FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own estimate communications"
  ON public.estimate_communications
  FOR UPDATE
  USING (true);

-- Add RLS policies for invoice_communications
ALTER TABLE public.invoice_communications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create their own invoice communications"
  ON public.invoice_communications
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can view their own invoice communications"
  ON public.invoice_communications
  FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own invoice communications"
  ON public.invoice_communications
  FOR UPDATE
  USING (true);

-- Add triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_estimate_communications_updated_at
  BEFORE UPDATE ON public.estimate_communications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoice_communications_updated_at
  BEFORE UPDATE ON public.invoice_communications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

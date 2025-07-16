
-- First, let's check and fix the database relationships for estimates and invoices
-- Add missing foreign key relationships and ensure proper ID types

-- Add missing foreign key constraint for estimates.job_id
ALTER TABLE estimates 
ADD CONSTRAINT fk_estimates_job_id 
FOREIGN KEY (job_id) REFERENCES jobs(id);

-- Add missing foreign key constraint for invoices.job_id  
ALTER TABLE invoices
ADD CONSTRAINT fk_invoices_job_id
FOREIGN KEY (job_id) REFERENCES jobs(id);

-- Create missing SMS sending function for invoices
CREATE OR REPLACE FUNCTION send_invoice_sms(invoice_id uuid, recipient_phone text, message text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
BEGIN
  -- This is a placeholder function that will be called by the edge function
  SELECT json_build_object('success', true, 'message', 'SMS queued for sending') INTO result;
  RETURN result;
END;
$$;

-- Ensure communication tables have proper indexes for performance
CREATE INDEX IF NOT EXISTS idx_estimate_communications_estimate_id ON estimate_communications(estimate_id);
CREATE INDEX IF NOT EXISTS idx_invoice_communications_invoice_id ON invoice_communications(invoice_id);

-- Add missing columns if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'estimate_communications' AND column_name = 'provider_message_id') THEN
    ALTER TABLE estimate_communications ADD COLUMN provider_message_id text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invoice_communications' AND column_name = 'provider_message_id') THEN
    ALTER TABLE invoice_communications ADD COLUMN provider_message_id text;
  END IF;
END $$;

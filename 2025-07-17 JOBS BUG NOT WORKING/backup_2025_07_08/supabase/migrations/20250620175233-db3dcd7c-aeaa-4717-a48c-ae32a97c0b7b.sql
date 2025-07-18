
-- Create table to store ID counters if it doesn't exist
CREATE TABLE IF NOT EXISTS public.id_counters (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entity_type text NOT NULL UNIQUE,
  prefix text NOT NULL,
  current_value integer NOT NULL DEFAULT 0,
  start_value integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on id_counters
ALTER TABLE public.id_counters ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to read and update counters
CREATE POLICY "Authenticated users can manage id counters" 
  ON public.id_counters 
  FOR ALL 
  USING (auth.role() = 'authenticated');

-- Create the generate_next_id function
CREATE OR REPLACE FUNCTION public.generate_next_id(p_entity_type text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_counter RECORD;
  v_next_number integer;
  v_prefix text;
  v_formatted_id text;
BEGIN
  -- Lock the row to prevent concurrent updates
  SELECT * INTO v_counter
  FROM public.id_counters
  WHERE entity_type = p_entity_type
  FOR UPDATE;
  
  -- If no counter exists, create one
  IF NOT FOUND THEN
    -- Set default values based on entity type
    CASE p_entity_type
      WHEN 'payment' THEN
        v_prefix := 'PAY';
        v_next_number := 1000;
      WHEN 'job' THEN
        v_prefix := 'J';
        v_next_number := 2000;
      WHEN 'estimate' THEN
        v_prefix := '';
        v_next_number := 100;
      WHEN 'invoice' THEN
        v_prefix := 'INV';
        v_next_number := 1000;
      WHEN 'client' THEN
        v_prefix := 'C';
        v_next_number := 2000;
      ELSE
        v_prefix := upper(substr(p_entity_type, 1, 3));
        v_next_number := 1000;
    END CASE;
    
    -- Insert new counter
    INSERT INTO public.id_counters (entity_type, prefix, current_value, start_value)
    VALUES (p_entity_type, v_prefix, v_next_number, v_next_number);
  ELSE
    -- Increment existing counter
    v_next_number := v_counter.current_value + 1;
    v_prefix := v_counter.prefix;
    
    -- Update the counter
    UPDATE public.id_counters
    SET current_value = v_next_number,
        updated_at = now()
    WHERE entity_type = p_entity_type;
  END IF;
  
  -- Format the ID based on entity type
  IF p_entity_type = 'estimate' THEN
    -- Just return the number for estimates
    v_formatted_id := v_next_number::text;
  ELSIF v_prefix = '' THEN
    -- No prefix, just the number
    v_formatted_id := v_next_number::text;
  ELSE
    -- Prefix with hyphen
    v_formatted_id := v_prefix || '-' || v_next_number::text;
  END IF;
  
  RETURN v_formatted_id;
END;
$$;

-- Create trigger to update updated_at for id_counters
CREATE OR REPLACE FUNCTION update_id_counters_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_id_counters_updated_at
  BEFORE UPDATE ON public.id_counters
  FOR EACH ROW
  EXECUTE FUNCTION update_id_counters_updated_at();

-- Initialize counters for common entity types
INSERT INTO public.id_counters (entity_type, prefix, current_value, start_value)
VALUES 
  ('payment', 'PAY', 1000, 1000),
  ('job', 'J', 2000, 2000),
  ('estimate', '', 100, 100),
  ('invoice', 'INV', 1000, 1000),
  ('client', 'C', 2000, 2000)
ON CONFLICT (entity_type) DO NOTHING;

-- Add missing columns to payments table if they don't exist
DO $$ 
BEGIN
  -- Add payment_date column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'payments' AND column_name = 'payment_date') THEN
    ALTER TABLE public.payments ADD COLUMN payment_date date DEFAULT CURRENT_DATE;
  END IF;
END $$;

-- Enable RLS on payments table
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies and create new ones
DROP POLICY IF EXISTS "Users can view payments" ON public.payments;
DROP POLICY IF EXISTS "Users can create payments" ON public.payments;
DROP POLICY IF EXISTS "Users can update payments" ON public.payments;
DROP POLICY IF EXISTS "Users can delete payments" ON public.payments;

-- Create new RLS policies
CREATE POLICY "Authenticated users can view all payments" 
  ON public.payments 
  FOR SELECT 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can create payments" 
  ON public.payments 
  FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update payments" 
  ON public.payments 
  FOR UPDATE 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete payments" 
  ON public.payments 
  FOR DELETE 
  USING (auth.role() = 'authenticated');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_payments_invoice_id ON public.payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON public.payments(created_at);
CREATE INDEX IF NOT EXISTS idx_payments_payment_date ON public.payments(payment_date);

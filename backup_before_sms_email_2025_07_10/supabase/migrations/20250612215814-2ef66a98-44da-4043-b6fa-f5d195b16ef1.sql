
-- Create line_items table for estimates and invoices
CREATE TABLE IF NOT EXISTS public.line_items (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_type text NOT NULL CHECK (parent_type IN ('estimate', 'invoice')),
  parent_id uuid NOT NULL,
  description text NOT NULL,
  quantity numeric NOT NULL DEFAULT 1,
  unit_price numeric NOT NULL DEFAULT 0,
  taxable boolean NOT NULL DEFAULT true,
  discount numeric DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Add RLS policies for line_items
ALTER TABLE public.line_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their line items" 
  ON public.line_items 
  FOR SELECT 
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create line items" 
  ON public.line_items 
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update line items" 
  ON public.line_items 
  FOR UPDATE 
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete line items" 
  ON public.line_items 
  FOR DELETE 
  USING (auth.uid() IS NOT NULL);

-- Fix payments table - add missing date column and fix structure
ALTER TABLE public.payments 
ADD COLUMN IF NOT EXISTS date timestamp with time zone DEFAULT now();

-- Update payments table to match expected structure
ALTER TABLE public.payments 
ADD COLUMN IF NOT EXISTS balance numeric DEFAULT 0;

-- Fix invoices table structure
ALTER TABLE public.invoices 
ADD COLUMN IF NOT EXISTS date timestamp with time zone DEFAULT now();

ALTER TABLE public.invoices 
ADD COLUMN IF NOT EXISTS balance numeric GENERATED ALWAYS AS (total - COALESCE(amount_paid, 0)) STORED;

-- Add trigger to update line_items updated_at
CREATE OR REPLACE FUNCTION update_line_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_line_items_updated_at_trigger
  BEFORE UPDATE ON public.line_items
  FOR EACH ROW
  EXECUTE FUNCTION update_line_items_updated_at();

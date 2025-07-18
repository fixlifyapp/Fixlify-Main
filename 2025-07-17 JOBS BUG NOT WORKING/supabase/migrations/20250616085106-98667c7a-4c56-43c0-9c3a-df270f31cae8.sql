
-- Add tax configuration columns to user_settings table
ALTER TABLE public.user_settings 
ADD COLUMN default_tax_rate NUMERIC(5,2) DEFAULT 13.00,
ADD COLUMN tax_region TEXT DEFAULT 'Ontario',
ADD COLUMN tax_label TEXT DEFAULT 'HST';

-- Update existing records to have the default tax settings
UPDATE public.user_settings 
SET default_tax_rate = 13.00, 
    tax_region = 'Ontario', 
    tax_label = 'HST' 
WHERE default_tax_rate IS NULL;

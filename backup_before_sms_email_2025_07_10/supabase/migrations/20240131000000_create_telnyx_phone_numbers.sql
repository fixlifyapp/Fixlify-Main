
-- Create table for tracking Telnyx phone numbers purchased by users
CREATE TABLE IF NOT EXISTS public.telnyx_phone_numbers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  phone_number TEXT NOT NULL UNIQUE,
  telnyx_phone_number_id TEXT UNIQUE,
  country_code TEXT NOT NULL DEFAULT 'US',
  area_code TEXT,
  rate_center TEXT,
  region TEXT,
  features JSONB DEFAULT '[]'::jsonb,
  messaging_profile_id TEXT,
  connection_id TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  purchased_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  configured_at TIMESTAMP WITH TIME ZONE,
  webhook_url TEXT,
  monthly_cost NUMERIC DEFAULT 1.00,
  setup_cost NUMERIC DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies
ALTER TABLE public.telnyx_phone_numbers ENABLE ROW LEVEL SECURITY;

-- Users can view their own phone numbers
CREATE POLICY "Users can view their own Telnyx numbers" 
  ON public.telnyx_phone_numbers 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Users can insert their own phone numbers
CREATE POLICY "Users can create their own Telnyx numbers" 
  ON public.telnyx_phone_numbers 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own phone numbers
CREATE POLICY "Users can update their own Telnyx numbers" 
  ON public.telnyx_phone_numbers 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Users can delete their own phone numbers
CREATE POLICY "Users can delete their own Telnyx numbers" 
  ON public.telnyx_phone_numbers 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION public.update_telnyx_phone_numbers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_telnyx_phone_numbers_updated_at
  BEFORE UPDATE ON public.telnyx_phone_numbers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_telnyx_phone_numbers_updated_at();

-- Insert the existing phone number for NikaFix account (you'll need to update the user_id)
-- This is just a placeholder - you'll need to update with the actual user_id
INSERT INTO public.telnyx_phone_numbers (
  user_id,
  phone_number,
  country_code,
  area_code,
  status,
  purchased_at,
  configured_at
) VALUES (
  -- Replace this UUID with the actual user_id for NikaFix account
  '00000000-0000-0000-0000-000000000000',
  '+14375249932',
  'US',
  '437',
  'active',
  now(),
  now()
) ON CONFLICT (phone_number) DO NOTHING;

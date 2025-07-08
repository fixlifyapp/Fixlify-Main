-- Add user_id column to lead_sources table if it doesn't exist
ALTER TABLE public.lead_sources 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_lead_sources_user_id ON public.lead_sources(user_id);

-- Fix lead_sources RLS policy to allow authenticated users to create data
DROP POLICY IF EXISTS "Allow admins to manage lead_sources" ON public.lead_sources;
DROP POLICY IF EXISTS "Allow authenticated users to view lead_sources" ON public.lead_sources;

-- Create new policies that allow users to manage their own lead sources
CREATE POLICY "Users can create their lead_sources" ON public.lead_sources
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view their lead_sources" ON public.lead_sources
  FOR SELECT USING ((user_id = auth.uid()) OR (user_id IS NULL));

CREATE POLICY "Users can update their lead_sources" ON public.lead_sources
  FOR UPDATE USING ((user_id = auth.uid()) OR (user_id IS NULL));

CREATE POLICY "Users can delete their lead_sources" ON public.lead_sources
  FOR DELETE USING ((user_id = auth.uid()) OR (user_id IS NULL));

-- Ensure profiles table has all necessary columns
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS has_completed_onboarding BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS business_niche TEXT;

-- Update the handle_new_user function to ensure it works properly
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Create profile for new user
  INSERT INTO public.profiles (id, name, email, role, has_completed_onboarding, business_niche)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.email,
    'admin',  -- Always assign admin role for now
    false,    -- Require onboarding for all new users
    NULL      -- No business niche initially
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    role = CASE 
      WHEN profiles.role IS NULL THEN 'admin'
      ELSE profiles.role
    END;

  -- Initialize user data function
  PERFORM public.initialize_user_data(NEW.id);
  
  RETURN NEW;
END;
$$;

-- Create a function to initialize default data for new users
CREATE OR REPLACE FUNCTION public.initialize_user_data(p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Initialize id_counters for the user
  INSERT INTO public.id_counters (user_id, entity_type, prefix, start_value, current_value)
  VALUES 
    (p_user_id, 'invoice', 'INV', 1000, 1000),
    (p_user_id, 'estimate', 'EST', 1000, 1000),
    (p_user_id, 'payment', 'PAY', 1000, 1000),
    (p_user_id, 'job', 'JOB', 1000, 1000)
  ON CONFLICT (user_id, entity_type) DO NOTHING;

  -- Create default job statuses
  INSERT INTO public.job_statuses (user_id, name, color)
  VALUES 
    (p_user_id, 'New', '#3B82F6'),
    (p_user_id, 'In Progress', '#F59E0B'),
    (p_user_id, 'Completed', '#10B981'),
    (p_user_id, 'Cancelled', '#EF4444'),
    (p_user_id, 'On Hold', '#6B7280')
  ON CONFLICT DO NOTHING;

  -- Create default lead sources
  INSERT INTO public.lead_sources (user_id, name)
  VALUES 
    (p_user_id, 'Website'),
    (p_user_id, 'Phone Call'),
    (p_user_id, 'Email'),
    (p_user_id, 'Referral'),
    (p_user_id, 'Social Media'),
    (p_user_id, 'Walk-in')
  ON CONFLICT DO NOTHING;

  -- Create company settings
  INSERT INTO public.company_settings (user_id)
  VALUES (p_user_id)
  ON CONFLICT (user_id) DO NOTHING;
END;
$$;

-- Fix any existing users without profiles
DO $$
DECLARE
  user_record RECORD;
BEGIN
  FOR user_record IN 
    SELECT id, email, raw_user_meta_data 
    FROM auth.users 
    WHERE id NOT IN (SELECT id FROM public.profiles)
  LOOP
    INSERT INTO public.profiles (id, name, email, role, has_completed_onboarding)
    VALUES (
      user_record.id,
      COALESCE(user_record.raw_user_meta_data->>'name', user_record.email),
      user_record.email,
      'admin',
      false
    );
    
    -- Initialize user data
    PERFORM public.initialize_user_data(user_record.id);
  END LOOP;
END;
$$; 
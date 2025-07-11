-- Fix admin assignment for new users
-- Update handle_new_user function to always assign admin role for now
-- This ensures every new user gets proper admin experience until team invitation system is fully implemented

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role, has_completed_onboarding)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.email,
    'admin',  -- Always assign admin role for now
    false     -- Require onboarding for all new users
  );
  RETURN NEW;
END;
$$; 
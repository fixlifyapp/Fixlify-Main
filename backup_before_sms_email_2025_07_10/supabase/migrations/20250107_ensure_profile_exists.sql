-- Migration to ensure the required profile exists
-- This creates a profile with the specific ID if it doesn't exist

-- First, check if we need to create a user in auth.users
DO $$
BEGIN
  -- Check if the user exists
  IF NOT EXISTS (
    SELECT 1 FROM auth.users WHERE id = '40019793-a458-4eb0-a0d1-edc0565927fb'
  ) THEN
    -- Insert into auth.users (this requires admin access)
    -- Note: In production, users should be created through proper auth flow
    RAISE NOTICE 'User 40019793-a458-4eb0-a0d1-edc0565927fb does not exist in auth.users';
    RAISE NOTICE 'Please create this user through Supabase Auth or update the profile ID';
  END IF;
END $$;

-- Ensure the profile exists in the profiles table
INSERT INTO profiles (
  id,
  user_id,
  organization_id,
  role,
  created_at,
  updated_at
)
VALUES (
  '40019793-a458-4eb0-a0d1-edc0565927fb',
  '40019793-a458-4eb0-a0d1-edc0565927fb',
  '00000000-0000-0000-0000-000000000001', -- Default organization
  'admin',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE
SET updated_at = NOW();

-- Also ensure the profile exists with user_id as primary key
INSERT INTO profiles (
  id,
  user_id,
  organization_id,
  role,
  created_at,
  updated_at
)
VALUES (
  '40019793-a458-4eb0-a0d1-edc0565927fb',
  '40019793-a458-4eb0-a0d1-edc0565927fb',
  '00000000-0000-0000-0000-000000000001',
  'admin',
  NOW(),
  NOW()
)
ON CONFLICT (user_id) DO UPDATE
SET 
  organization_id = COALESCE(profiles.organization_id, '00000000-0000-0000-0000-000000000001'),
  updated_at = NOW();

-- Grant necessary permissions
GRANT ALL ON profiles TO authenticated;
GRANT ALL ON profiles TO service_role;

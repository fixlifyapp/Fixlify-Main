-- SQL script to properly handle the profile with ID 40019793-a458-4eb0-a0d1-edc0565927fb
-- Run this in Supabase SQL Editor

-- First, check if this user exists in auth.users
DO $$
DECLARE
  v_user_exists BOOLEAN;
  v_profile_exists BOOLEAN;
BEGIN
  -- Check if user exists in auth.users
  SELECT EXISTS(
    SELECT 1 FROM auth.users WHERE id = '40019793-a458-4eb0-a0d1-edc0565927fb'
  ) INTO v_user_exists;
  
  -- Check if profile exists
  SELECT EXISTS(
    SELECT 1 FROM public.profiles WHERE id = '40019793-a458-4eb0-a0d1-edc0565927fb'
  ) INTO v_profile_exists;
  
  IF NOT v_user_exists THEN
    RAISE NOTICE 'User with ID 40019793-a458-4eb0-a0d1-edc0565927fb does not exist in auth.users';
    RAISE NOTICE 'You need to create this user first through Supabase Auth';
    
    -- Option 1: Create a user through Supabase Dashboard
    -- Go to Authentication > Users > Add User
    
    -- Option 2: If you want to use this ID for testing, update an existing user
    RAISE NOTICE 'To use this ID with an existing user, you can run:';
    RAISE NOTICE 'UPDATE auth.users SET id = ''40019793-a458-4eb0-a0d1-edc0565927fb'' WHERE email = ''your-email@example.com'';';
    RAISE NOTICE 'WARNING: This will break existing references!';
    
  ELSIF NOT v_profile_exists THEN
    -- User exists but profile doesn't, create the profile
    INSERT INTO public.profiles (
      id,
      user_id,
      organization_id,
      role,
      created_at,
      updated_at
    ) VALUES (
      '40019793-a458-4eb0-a0d1-edc0565927fb',
      '40019793-a458-4eb0-a0d1-edc0565927fb',
      COALESCE(
        (SELECT organization_id FROM public.profiles LIMIT 1),
        '00000000-0000-0000-0000-000000000001'
      ),
      'admin',
      NOW(),
      NOW()
    );
    
    RAISE NOTICE 'Profile created successfully!';
    
  ELSE
    RAISE NOTICE 'Both user and profile already exist with ID 40019793-a458-4eb0-a0d1-edc0565927fb';
  END IF;
END $$;

-- Show current profiles for reference
SELECT 
  p.id as profile_id,
  p.user_id,
  p.organization_id,
  p.role,
  u.email as user_email,
  p.created_at
FROM public.profiles p
LEFT JOIN auth.users u ON u.id = p.user_id
ORDER BY p.created_at DESC
LIMIT 10;

-- If you want to update your existing profile to use this ID (NOT RECOMMENDED)
-- This would require updating all foreign key references
/*
-- Example of how complex it would be:
BEGIN;
  -- You would need to update every table that references this profile
  -- This is just a partial list:
  UPDATE jobs SET created_by = '40019793-a458-4eb0-a0d1-edc0565927fb' WHERE created_by = 'old-id';
  UPDATE jobs SET technician_id = '40019793-a458-4eb0-a0d1-edc0565927fb' WHERE technician_id = 'old-id';
  UPDATE clients SET created_by = '40019793-a458-4eb0-a0d1-edc0565927fb' WHERE created_by = 'old-id';
  UPDATE invoices SET created_by = '40019793-a458-4eb0-a0d1-edc0565927fb' WHERE created_by = 'old-id';
  -- ... and many more tables
  
  -- Then update the profile itself
  UPDATE profiles SET id = '40019793-a458-4eb0-a0d1-edc0565927fb' WHERE id = 'old-id';
  UPDATE profiles SET user_id = '40019793-a458-4eb0-a0d1-edc0565927fb' WHERE user_id = 'old-id';
  
  -- And finally update auth.users
  UPDATE auth.users SET id = '40019793-a458-4eb0-a0d1-edc0565927fb' WHERE id = 'old-id';
COMMIT;
*/

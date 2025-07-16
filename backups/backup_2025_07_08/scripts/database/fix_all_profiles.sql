-- Fix profile issues by ensuring profile exists for any authenticated user
-- Run this in Supabase SQL Editor

-- Create or update profile for existing users
INSERT INTO profiles (id, user_id, organization_id, role, email, created_at, updated_at)
SELECT 
    au.id,
    au.id,
    '00000000-0000-0000-0000-000000000001',
    'admin',
    au.email,
    NOW(),
    NOW()
FROM auth.users au
LEFT JOIN profiles p ON p.user_id = au.id
WHERE p.id IS NULL
ON CONFLICT (id) DO UPDATE
SET 
    organization_id = COALESCE(profiles.organization_id, EXCLUDED.organization_id),
    email = COALESCE(profiles.email, EXCLUDED.email),
    updated_at = NOW();

-- Also handle the user_id constraint
INSERT INTO profiles (id, user_id, organization_id, role, email, created_at, updated_at)
SELECT 
    au.id,
    au.id,
    '00000000-0000-0000-0000-000000000001',
    'admin',
    au.email,
    NOW(),
    NOW()
FROM auth.users au
LEFT JOIN profiles p ON p.user_id = au.id
WHERE p.user_id IS NULL
ON CONFLICT (user_id) DO UPDATE
SET 
    organization_id = COALESCE(profiles.organization_id, EXCLUDED.organization_id),
    email = COALESCE(profiles.email, EXCLUDED.email),
    updated_at = NOW();

-- Show current profiles
SELECT 
    p.id,
    p.user_id,
    p.email,
    p.organization_id,
    p.role,
    p.created_at,
    au.email as auth_email,
    au.created_at as user_created_at
FROM profiles p
JOIN auth.users au ON au.id = p.user_id
ORDER BY p.created_at DESC;

-- Supabase Data Export SQL Script
-- Run this script in the Supabase SQL Editor to export data

-- First, let's check which tables we have
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Export profiles table to CSV format
COPY (SELECT * FROM profiles) 
TO '/tmp/profiles.csv' 
WITH (FORMAT CSV, HEADER);
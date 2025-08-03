-- Test script to verify real-time updates
-- Run this in Supabase SQL editor to test if the jobs list updates in real-time

-- First, let's check a job's current status
SELECT id, status, updated_at 
FROM jobs 
WHERE id = 'J-2017';

-- Now update the status
UPDATE jobs 
SET status = 'In Progress',
    updated_at = NOW()
WHERE id = 'J-2017'
RETURNING id, status, updated_at;

-- The jobs list should update automatically within 0.5 seconds
-- Check the browser console for real-time update logs

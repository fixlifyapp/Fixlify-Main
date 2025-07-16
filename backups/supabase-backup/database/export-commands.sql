-- Supabase Full Database Export Script
-- Run this script in the Supabase SQL Editor to generate export commands
-- Then use pg_dump for full backup

-- 1. List all tables in public schema
SELECT 
    table_name,
    pg_size_pretty(pg_total_relation_size(table_schema||'.'||table_name)) as size
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 2. Count records in each table
SELECT 
    'SELECT ''' || table_name || ''' as table_name, COUNT(*) as record_count FROM ' || table_name || ' UNION ALL'
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 3. Generate COPY commands for each table (for CSV export)
-- Note: These commands need to be run with superuser privileges
SELECT 
    'COPY (SELECT * FROM ' || table_name || ') TO ''/tmp/' || table_name || '.csv'' WITH CSV HEADER;'
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 4. Important tables with data
-- Profiles
SELECT COUNT(*) as profiles_count FROM profiles;
-- Clients  
SELECT COUNT(*) as clients_count FROM clients;
-- Jobs
SELECT COUNT(*) as jobs_count FROM jobs;
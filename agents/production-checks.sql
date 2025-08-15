-- Database functions for production agents
-- Run these in Supabase SQL editor

-- Check if RLS is enabled
CREATE OR REPLACE FUNCTION check_rls_enabled(table_name text)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = table_name 
    AND rowsecurity = true
  );
END;
$$ LANGUAGE plpgsql;

-- Find duplicate clients by phone
CREATE OR REPLACE FUNCTION find_duplicate_clients()
RETURNS TABLE(phone text, count bigint) AS $$
BEGIN
  RETURN QUERY
  SELECT phone, COUNT(*) as count
  FROM clients
  WHERE phone IS NOT NULL
  GROUP BY phone
  HAVING COUNT(*) > 1;
END;
$$ LANGUAGE plpgsql;

-- Suggest missing indexes
CREATE OR REPLACE FUNCTION suggest_indexes()
RETURNS TABLE(table_name text, column_name text, reason text) AS $$
BEGIN
  RETURN QUERY
  SELECT 'jobs'::text, 'client_id'::text, 'Foreign key needs index'::text
  UNION ALL
  SELECT 'jobs', 'status', 'Frequently filtered column'
  UNION ALL
  SELECT 'jobs', 'scheduled_date', 'Appointment queries'
  UNION ALL
  SELECT 'clients', 'phone', 'Lookup by phone number';
END;
$$ LANGUAGE plpgsql;

-- Check data consistency
CREATE OR REPLACE FUNCTION check_data_consistency()
RETURNS TABLE(issue text, count bigint) AS $$
BEGIN
  RETURN QUERY
  SELECT 'Jobs without clients'::text, COUNT(*)
  FROM jobs WHERE client_id IS NULL
  UNION ALL
  SELECT 'Jobs with invalid status', COUNT(*)
  FROM jobs WHERE status NOT IN ('new', 'in_progress', 'completed', 'cancelled')
  UNION ALL
  SELECT 'Clients without phone', COUNT(*)
  FROM clients WHERE phone IS NULL OR phone = '';
END;
$$ LANGUAGE plpgsql;
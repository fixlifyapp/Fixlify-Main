-- Test query to see what the edge function should be able to fetch
-- This is what the edge function SHOULD be executing

-- Test 1: Simple job fetch
SELECT * FROM jobs WHERE id = 'J-2019';

-- Test 2: Job with client data (what edge function tries to do)
SELECT 
  j.*,
  json_build_object(
    'id', c.id,
    'name', c.name,
    'email', c.email,
    'phone', c.phone,
    'first_name', c.first_name,
    'last_name', c.last_name,
    'address', c.address
  ) as clients
FROM jobs j
LEFT JOIN clients c ON j.client_id = c.id
WHERE j.id = 'J-2019';

-- Test 3: Check if edge function can see the data
-- Edge functions should use service role key which bypasses RLS
-- But let's verify the data exists
SELECT 
  'Job exists:' as check_type,
  EXISTS(SELECT 1 FROM jobs WHERE id = 'J-2019') as result
UNION ALL
SELECT 
  'Client exists:' as check_type,
  EXISTS(SELECT 1 FROM clients WHERE id = 'C-2004') as result
UNION ALL
SELECT 
  'Job has client:' as check_type,
  EXISTS(SELECT 1 FROM jobs WHERE id = 'J-2019' AND client_id = 'C-2004') as result;

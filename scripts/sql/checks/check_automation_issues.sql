-- Check and fix automation issues

-- 1. Check for duplicate workflows
SELECT 
  id,
  name,
  trigger_type,
  trigger_config,
  is_active,
  status,
  execution_count,
  user_id,
  created_at
FROM automation_workflows
WHERE is_active = true
  AND status = 'active'
  AND trigger_type = 'job_status_changed'
ORDER BY created_at DESC;

-- 2. Check recent automation logs for duplicates
WITH recent_logs AS (
  SELECT 
    id,
    workflow_id,
    trigger_type,
    status,
    created_at,
    trigger_data->>'job_id' as job_id,
    trigger_data->>'new_status' as new_status,
    ROW_NUMBER() OVER (PARTITION BY trigger_data->>'job_id', trigger_data->>'new_status' ORDER BY created_at) as rn
  FROM automation_execution_logs
  WHERE created_at > NOW() - INTERVAL '1 hour'
    AND trigger_type = 'job_status_changed'
)
SELECT * FROM recent_logs WHERE rn > 1;

-- 3. Check communication logs for duplicates
SELECT 
  COUNT(*) as count,
  type,
  direction,
  to_address,
  subject,
  DATE_TRUNC('minute', created_at) as minute
FROM communication_logs
WHERE created_at > NOW() - INTERVAL '1 hour'
  AND direction = 'outbound'
GROUP BY type, direction, to_address, subject, DATE_TRUNC('minute', created_at)
HAVING COUNT(*) > 1
ORDER BY minute DESC;

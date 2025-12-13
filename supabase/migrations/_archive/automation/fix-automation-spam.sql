-- Emergency fix for automation spam issue
-- This script stops the spam and cleans up old logs

-- 1. Mark all old pending logs as expired to stop them from being processed
UPDATE automation_execution_logs
SET 
  status = 'expired',
  error_message = 'Expired - old pending log',
  completed_at = NOW()
WHERE 
  status = 'pending'
  AND created_at < NOW() - INTERVAL '1 hour';

-- 2. Check how many pending logs exist
SELECT 
  COUNT(*) as total_pending,
  MIN(created_at) as oldest_log,
  MAX(created_at) as newest_log
FROM automation_execution_logs
WHERE status = 'pending';

-- 3. View recent automation activity
SELECT 
  id,
  workflow_id,
  trigger_type,
  status,
  created_at,
  error_message
FROM automation_execution_logs
WHERE created_at > NOW() - INTERVAL '10 minutes'
ORDER BY created_at DESC
LIMIT 20;

-- 4. Temporarily disable automations if needed (EMERGENCY ONLY)
-- UPDATE automation_workflows SET is_active = false WHERE is_active = true;

-- 5. Clear ALL pending logs (USE WITH CAUTION)
-- UPDATE automation_execution_logs
-- SET status = 'cancelled', error_message = 'Manually cancelled'
-- WHERE status = 'pending';

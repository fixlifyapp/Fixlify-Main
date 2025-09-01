-- AI ASSISTANT WEBHOOK MONITORING QUERIES

-- ============================================
-- 1. VIEW RECENT WEBHOOK CALLS
-- ============================================
SELECT 
  created_at,
  client_ip,
  caller_number,
  called_number,
  valid_structure,
  rate_limit_count
FROM webhook_logs
WHERE webhook_name = 'ai-assistant-webhook'
ORDER BY created_at DESC
LIMIT 20;

-- ============================================
-- 2. CHECK FOR SUSPICIOUS ACTIVITY
-- ============================================
SELECT 
  client_ip,
  COUNT(*) as attempts,
  SUM(CASE WHEN valid_structure THEN 1 ELSE 0 END) as valid_requests,
  SUM(CASE WHEN NOT valid_structure THEN 1 ELSE 0 END) as invalid_requests,
  MAX(created_at) as last_attempt
FROM webhook_logs
WHERE webhook_name = 'ai-assistant-webhook'
  AND created_at > NOW() - INTERVAL '24 hours'
GROUP BY client_ip
HAVING COUNT(*) > 10 OR SUM(CASE WHEN NOT valid_structure THEN 1 ELSE 0 END) > 0
ORDER BY invalid_requests DESC, attempts DESC;

-- ============================================
-- 3. HOURLY CALL VOLUME
-- ============================================
SELECT 
  DATE_TRUNC('hour', created_at) as hour,
  COUNT(*) as calls,
  COUNT(DISTINCT client_ip) as unique_ips
FROM webhook_logs
WHERE webhook_name = 'ai-assistant-webhook'
  AND created_at > NOW() - INTERVAL '24 hours'
GROUP BY DATE_TRUNC('hour', created_at)
ORDER BY hour DESC;

-- ============================================
-- 4. RATE LIMIT MONITORING
-- ============================================
SELECT 
  client_ip,
  MAX(rate_limit_count) as max_rate_limit,
  COUNT(*) as total_calls_today,
  CASE 
    WHEN MAX(rate_limit_count) > 90 THEN '⚠️ Near limit'
    WHEN MAX(rate_limit_count) > 50 THEN '📊 Moderate usage'
    ELSE '✅ Normal'
  END as status
FROM webhook_logs
WHERE webhook_name = 'ai-assistant-webhook'
  AND created_at > NOW() - INTERVAL '1 hour'
GROUP BY client_ip
ORDER BY max_rate_limit DESC;

-- ============================================
-- 5. CUSTOMER LOOKUP SUCCESS RATE
-- ============================================
SELECT 
  DATE(created_at) as date,
  COUNT(*) as total_calls,
  SUM(CASE 
    WHEN response_body::jsonb->'dynamic_variables'->>'is_existing_customer' = 'true' 
    THEN 1 ELSE 0 
  END) as existing_customers,
  ROUND(
    100.0 * SUM(CASE 
      WHEN response_body::jsonb->'dynamic_variables'->>'is_existing_customer' = 'true' 
      THEN 1 ELSE 0 
    END) / COUNT(*)
  , 1) as existing_customer_percentage
FROM webhook_logs
WHERE webhook_name = 'ai-assistant-webhook'
  AND created_at > NOW() - INTERVAL '7 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- ============================================
-- 6. INVALID REQUEST DETAILS
-- ============================================
SELECT 
  created_at,
  client_ip,
  user_agent,
  request_body::text as request_preview
FROM webhook_logs
WHERE webhook_name = 'ai-assistant-webhook'
  AND valid_structure = false
  AND created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC
LIMIT 10;

-- ============================================
-- 7. PERFORMANCE METRICS
-- ============================================
SELECT 
  DATE(created_at) as date,
  COUNT(*) as total_calls,
  COUNT(DISTINCT client_ip) as unique_callers,
  SUM(CASE WHEN valid_structure THEN 1 ELSE 0 END) as valid_calls,
  SUM(CASE WHEN NOT valid_structure THEN 1 ELSE 0 END) as invalid_calls,
  ROUND(
    100.0 * SUM(CASE WHEN valid_structure THEN 1 ELSE 0 END) / COUNT(*)
  , 1) as success_rate_percentage
FROM webhook_logs
WHERE webhook_name = 'ai-assistant-webhook'
  AND created_at > NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- ============================================
-- 8. CLEAN UP OLD LOGS (Run monthly)
-- ============================================
-- Keep only last 90 days of logs
DELETE FROM webhook_logs
WHERE webhook_name = 'ai-assistant-webhook'
  AND created_at < NOW() - INTERVAL '90 days';

-- ============================================
-- 9. CREATE INDEX FOR BETTER PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_webhook_logs_ai_assistant 
ON webhook_logs(webhook_name, created_at DESC) 
WHERE webhook_name = 'ai-assistant-webhook';

CREATE INDEX IF NOT EXISTS idx_webhook_logs_client_ip 
ON webhook_logs(client_ip, created_at DESC) 
WHERE webhook_name = 'ai-assistant-webhook';

-- ============================================
-- 10. ALERT QUERY - Run every hour
-- ============================================
-- Returns rows only if there are issues to investigate
SELECT 
  'HIGH_INVALID_RATE' as alert_type,
  COUNT(*) as invalid_calls_last_hour,
  STRING_AGG(DISTINCT client_ip, ', ') as suspicious_ips
FROM webhook_logs
WHERE webhook_name = 'ai-assistant-webhook'
  AND created_at > NOW() - INTERVAL '1 hour'
  AND valid_structure = false
HAVING COUNT(*) > 10

UNION ALL

SELECT 
  'RATE_LIMIT_NEAR' as alert_type,
  MAX(rate_limit_count)::text as max_count,
  client_ip as affected_ip
FROM webhook_logs
WHERE webhook_name = 'ai-assistant-webhook'
  AND created_at > NOW() - INTERVAL '1 hour'
  AND rate_limit_count > 90
GROUP BY client_ip;
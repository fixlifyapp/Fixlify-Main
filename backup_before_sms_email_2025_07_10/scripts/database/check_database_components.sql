-- SQL Script to check all database components that might need updates

-- 1. Check all database functions
SELECT 
    routine_name,
    routine_type,
    created,
    last_altered
FROM information_schema.routines
WHERE routine_schema = 'public'
ORDER BY routine_name;

-- 2. Check all triggers
SELECT 
    trigger_name,
    event_object_table,
    action_timing,
    event_manipulation,
    created
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY trigger_name;

-- 3. Check Telnyx configuration
SELECT * FROM telnyx_phone_numbers LIMIT 5;
SELECT * FROM telnyx_messaging_profiles LIMIT 5;

-- 4. Check communication logs
SELECT 
    COUNT(*) as total,
    communication_type,
    status,
    DATE(created_at) as date
FROM communication_logs
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY communication_type, status, DATE(created_at)
ORDER BY date DESC;

-- 5. Check for any stored API keys or configurations
SELECT 
    key,
    CASE 
        WHEN key LIKE '%api%' OR key LIKE '%key%' THEN '***HIDDEN***'
        ELSE value 
    END as value,
    created_at,
    updated_at
FROM app_settings
WHERE key LIKE '%telnyx%' OR key LIKE '%mailgun%'
ORDER BY key;

-- 6. Check webhook logs for errors
SELECT 
    COUNT(*) as error_count,
    webhook_type,
    error_message,
    DATE(created_at) as date
FROM webhook_logs
WHERE status = 'error'
AND created_at > NOW() - INTERVAL '7 days'
GROUP BY webhook_type, error_message, DATE(created_at)
ORDER BY date DESC, error_count DESC
LIMIT 20;

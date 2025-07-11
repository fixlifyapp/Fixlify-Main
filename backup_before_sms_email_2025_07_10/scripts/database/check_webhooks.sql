-- Check webhook configurations and logs

-- 1. Check if there's a webhook_logs table
SELECT table_name 
FROM information_schema.tables 
WHERE table_name LIKE '%webhook%' 
AND table_schema = 'public';

-- 2. Check communication logs for recent activity
SELECT 
    communication_type,
    status,
    COUNT(*) as count,
    MAX(created_at) as last_attempt
FROM communication_logs
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY communication_type, status
ORDER BY last_attempt DESC;

-- 3. Check estimate and invoice communications
SELECT 
    'estimate' as type,
    communication_type,
    status,
    COUNT(*) as count,
    MAX(created_at) as last_sent
FROM estimate_communications
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY communication_type, status

UNION ALL

SELECT 
    'invoice' as type,
    communication_type,
    status,
    COUNT(*) as count,
    MAX(created_at) as last_sent
FROM invoice_communications
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY communication_type, status
ORDER BY last_sent DESC;

-- 4. Check for any webhook configuration table
SELECT * 
FROM information_schema.columns 
WHERE column_name LIKE '%webhook%' 
AND table_schema = 'public'
LIMIT 20;

-- 5. Check Telnyx phone numbers and their webhook configuration
SELECT 
    id,
    phone_number,
    status,
    user_id,
    telnyx_phone_id,
    messaging_profile_id,
    created_at,
    updated_at
FROM telnyx_phone_numbers
WHERE status = 'active'
ORDER BY created_at DESC
LIMIT 10;

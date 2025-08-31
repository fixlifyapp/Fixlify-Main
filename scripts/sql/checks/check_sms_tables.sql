-- Check if SMS/Email tables already exist
SELECT 
    table_name,
    COUNT(*) as exists
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('phone_numbers', 'communication_logs', 'message_templates', 'organization_communication_settings')
GROUP BY table_name
ORDER BY table_name;
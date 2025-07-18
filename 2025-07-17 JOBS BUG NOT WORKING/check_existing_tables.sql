-- First, let's check what tables already exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('phone_numbers', 'communication_logs', 'message_templates', 'organization_communication_settings')
ORDER BY table_name;

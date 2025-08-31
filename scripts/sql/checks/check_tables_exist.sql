-- Check if SMS/Email tables exist
SELECT 
    'phone_numbers' as table_name,
    EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'phone_numbers'
    ) as exists
UNION ALL
SELECT 
    'communication_logs',
    EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'communication_logs'
    )
UNION ALL
SELECT 
    'message_templates',
    EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'message_templates'
    )
UNION ALL
SELECT 
    'organization_communication_settings',
    EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'organization_communication_settings'
    );

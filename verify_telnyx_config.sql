-- Quick SQL to verify your Telnyx configuration
-- Run this in Supabase SQL Editor

SELECT 
  '=== YOUR TELNYX CONFIGURATION ===' as section,
  NULL as value
UNION ALL
SELECT 
  'Greeting to use in Telnyx:',
  '{{greeting}}'
UNION ALL
SELECT 
  'What callers will hear:',
  REPLACE(REPLACE(greeting_message, '{{company_name}}', company_name), '{{agent_name}}', agent_name)
FROM ai_dispatcher_configs
WHERE company_name = 'Nicks appliance repair'
UNION ALL
SELECT 
  'Diagnostic fee:',
  '$' || diagnostic_fee
FROM ai_dispatcher_configs
WHERE company_name = 'Nicks appliance repair'
UNION ALL
SELECT
  'Services offered:',
  services_offered
FROM ai_dispatcher_configs
WHERE company_name = 'Nicks appliance repair';

-- If you need to update anything:
/*
UPDATE ai_dispatcher_configs 
SET 
  greeting_message = 'Your new greeting with {{company_name}} and {{agent_name}}',
  diagnostic_fee = '89',
  services_offered = 'Refrigerator, Washer, Dryer, etc'
WHERE company_name = 'Nicks appliance repair';
*/
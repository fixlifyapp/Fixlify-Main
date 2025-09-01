-- To update your greeting message, run this SQL in Supabase:

UPDATE ai_dispatcher_configs 
SET greeting_message = 'Your new greeting here with {{company_name}} and {{agent_name}}'
WHERE company_name = 'Nicks appliance repair';

-- Example greetings you could use:

-- Professional:
-- 'Good day, you've reached {{company_name}}. This is {{agent_name}}. How may I assist you with your appliance needs today?'

-- Friendly:
-- 'Hi there! Thanks for calling {{company_name}}. I'm {{agent_name}}, and I'm here to help with all your appliance repair needs!'

-- Brief:
-- '{{company_name}}, {{agent_name}} speaking. How can I help?'

-- Emergency-focused:
-- 'Thank you for calling {{company_name}}. I'm {{agent_name}}. Are you calling about an appliance emergency or to schedule service?'
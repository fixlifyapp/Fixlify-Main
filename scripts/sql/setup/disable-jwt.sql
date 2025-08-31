-- Disable JWT verification for the Telnyx webhook
UPDATE auth.functions
SET verify_jwt = false
WHERE slug = 'ai-assistant-webhook';

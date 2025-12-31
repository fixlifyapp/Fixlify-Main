-- Add call_routing column to phone_numbers table
-- This stores settings for live call routing when AI Dispatcher is OFF

ALTER TABLE public.phone_numbers
ADD COLUMN IF NOT EXISTS call_routing JSONB DEFAULT jsonb_build_object(
  'ring_timeout_seconds', 30,
  'voicemail_enabled', true,
  'allowed_roles', jsonb_build_array('admin', 'owner', 'dispatcher')
);

-- Add comment for documentation
COMMENT ON COLUMN public.phone_numbers.call_routing IS 'Call routing settings for live dispatcher mode: ring_timeout_seconds, forwarding_number, voicemail_enabled, allowed_roles';

-- Add voicemail settings to call_routing JSONB column
-- This migration updates the default to include voicemail greeting and voice settings

-- Update existing rows to have voicemail settings if they have call_routing but no voicemail_greeting
UPDATE public.phone_numbers
SET call_routing = call_routing || jsonb_build_object(
  'voicemail_greeting', 'Sorry, we cannot take your call right now. Please leave a message after the beep and we will get back to you as soon as possible.',
  'voicemail_voice', 'Telnyx.NaturalHD.andersen_johan',
  'voicemail_max_length', 120,
  'voicemail_transcription', true
)
WHERE call_routing IS NOT NULL
  AND call_routing->>'voicemail_greeting' IS NULL;

-- Update the default for new rows
ALTER TABLE public.phone_numbers
ALTER COLUMN call_routing SET DEFAULT jsonb_build_object(
  'ring_timeout_seconds', 30,
  'voicemail_enabled', true,
  'voicemail_greeting', 'Sorry, we cannot take your call right now. Please leave a message after the beep and we will get back to you as soon as possible.',
  'voicemail_voice', 'Telnyx.NaturalHD.andersen_johan',
  'voicemail_max_length', 120,
  'voicemail_transcription', true,
  'allowed_roles', jsonb_build_array('admin', 'owner', 'dispatcher')
);

-- Add comment for documentation
COMMENT ON COLUMN public.phone_numbers.call_routing IS 'Call routing settings including voicemail: ring_timeout_seconds, voicemail_enabled, voicemail_greeting, voicemail_voice (Telnyx.NaturalHD, Polly, Azure), voicemail_max_length, voicemail_transcription, allowed_roles';

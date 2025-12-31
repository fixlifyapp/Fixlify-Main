// Telnyx Configuration
export const TELNYX_CONFIG = {
  // Connection ID 
  CONNECTION_ID: '2709100729850660858',
  DEFAULT_CONNECTION_ID: '2709100729850660858',
  
  // Webhook URLs - Direct URLs (secrets are handled in edge functions)
  WEBHOOK_BASE_URL: 'https://mqppvcrlvsgrsqelglod.supabase.co',
  
  // Call settings
  DEFAULT_CALL_TIMEOUT: 30, // seconds
  MAX_CALL_DURATION: 3600, // 1 hour in seconds
  
  // Audio settings
  AUDIO_FORMAT: 'pcm16',
  SAMPLE_RATE: 8000,
  
  // AI Voice settings - Using Telnyx AI Assistant
  DEFAULT_AI_VOICE: 'Heart', // KokoroTTS voice model
  AI_VOICE_PROVIDER: 'telnyx',
  AI_VOICE_MODEL: 'KokoroTTS',
  AI_VOICE_SPEED: '100%',
  AI_VOICE_PITCH: 'medium',
};

export const getTelnyxWebhookUrl = (endpoint: string) => {
  return `${TELNYX_CONFIG.WEBHOOK_BASE_URL}/functions/v1/${endpoint}`;
};

// Helper to get user's organization's primary phone number
export const getUserPhoneNumber = async (userId: string) => {
  const { supabase } = await import('@/integrations/supabase/client');

  // First get user's organization
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', userId)
    .single();

  if (profileError || !profile?.organization_id) {
    throw new Error('User must belong to an organization to make calls.');
  }

  // Get organization's primary phone number (or any assigned number)
  const { data, error } = await supabase
    .from('phone_numbers')
    .select('phone_number')
    .eq('organization_id', profile.organization_id)
    .eq('pool_status', 'assigned')
    .in('status', ['active', 'purchased'])
    .order('is_primary', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    throw new Error('No phone number assigned to your organization. Please assign a number from the pool first.');
  }

  return data.phone_number;
};
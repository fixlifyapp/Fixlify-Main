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
  
  // AI Voice settings
  DEFAULT_AI_VOICE: 'alloy',
  AI_VOICE_SPEED: '100%',
  AI_VOICE_PITCH: 'medium',
};

export const getTelnyxWebhookUrl = (endpoint: string) => {
  return `${TELNYX_CONFIG.WEBHOOK_BASE_URL}/functions/v1/${endpoint}`;
};

// Helper to get user's phone number
export const getUserPhoneNumber = async (userId: string) => {
  const { supabase } = await import('@/integrations/supabase/client');
  
  const { data, error } = await supabase
    .from('phone_numbers')
    .select('phone_number')
    .eq('purchased_by', userId)
    .eq('is_active', true)
    .order('purchased_at', { ascending: false })
    .limit(1)
    .maybeSingle();
    
  if (error || !data) {
    throw new Error('No active phone number found for user. Please purchase a phone number first.');
  }
  
  return data.phone_number;
};
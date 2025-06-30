// Telnyx Configuration
export const TELNYX_CONFIG = {
  // Connection ID from environment
  CONNECTION_ID: import.meta.env.VITE_TELNYX_CONNECTION_ID || '2709100729850660858',
  
  // API Key
  API_KEY: import.meta.env.VITE_TELNYX_API_KEY || '',
  
  // Public Key for webhook validation
  PUBLIC_KEY: import.meta.env.VITE_TELNYX_PUBLIC_KEY || '',
  
  // Webhook URLs
  WEBHOOK_BASE_URL: import.meta.env.VITE_SUPABASE_URL || 'https://mqppvcrlvsgrsqelglod.supabase.co',
  
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
    .from('telnyx_phone_numbers')
    .select('phone_number')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('purchased_at', { ascending: false })
    .limit(1)
    .single();
    
  if (error || !data) {
    throw new Error('No active phone number found for user. Please purchase a phone number first.');
  }
  
  return data.phone_number;
};
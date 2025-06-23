// Telnyx Configuration
export const TELNYX_CONFIG = {
  // Default connection ID - should be set in environment variables
  DEFAULT_CONNECTION_ID: import.meta.env.VITE_TELNYX_CONNECTION_ID || '2709042883142354871',
  
  // Default from number
  DEFAULT_FROM_NUMBER: import.meta.env.VITE_TELNYX_DEFAULT_FROM_NUMBER || '+14375249932',
  
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
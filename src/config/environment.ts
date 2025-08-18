/**
 * Environment Configuration
 * This file centralizes all environment-dependent values
 * Falls back to current production values if env vars not set
 */

// Get environment variables with fallbacks to current values
export const env = {
  // Supabase Configuration
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL || 'https://mqppvcrlvsgrsqelglod.supabase.co',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xcHB2Y3JsdnNncnNxZWxnbG9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1OTE3MDUsImV4cCI6MjA2MzE2NzcwNX0.My-KiqG1bCMqzUru4m59d4v18N3WGxNoNtFPOFAmhzg',
    projectRef: import.meta.env.VITE_SUPABASE_PROJECT_REF || 'mqppvcrlvsgrsqelglod'
  },

  // Application Configuration
  app: {
    name: import.meta.env.VITE_APP_NAME || 'Fixlify',
    title: import.meta.env.VITE_APP_TITLE || 'Fixlify App',
    domain: import.meta.env.VITE_APP_DOMAIN || 'fixlify.app',
    supportEmail: import.meta.env.VITE_SUPPORT_EMAIL || 'support@fixlify.app',
    infoEmail: import.meta.env.VITE_INFO_EMAIL || 'info@fixlify.app',
    noReplyEmail: import.meta.env.VITE_NOREPLY_EMAIL || 'noreply@fixlify.app'
  },

  // Mailgun Configuration
  mailgun: {
    domain: import.meta.env.VITE_MAILGUN_DOMAIN || 'mg.fixlify.app',
    fromEmail: import.meta.env.VITE_MAILGUN_FROM_EMAIL || 'support@fixlify.app'
  },

  // Telnyx Configuration
  telnyx: {
    defaultPhone: import.meta.env.VITE_TELNYX_DEFAULT_PHONE || '+14375249932',
    aiAssistantId: import.meta.env.VITE_TELNYX_AI_ASSISTANT_ID || 'assistant-6f3d8e8f-2351-4946-9a6f-19a5e3ab8c83',
    mcpServerId: import.meta.env.VITE_TELNYX_MCP_SERVER_ID || 'c646fbf5-a768-49eb-b8d2-f2faeb116154'
  },

  // Development/Production flags
  isDevelopment: import.meta.env.DEV || false,
  isProduction: import.meta.env.PROD || true
};

// Helper function to get full Supabase URL
export const getSupabaseUrl = () => env.supabase.url;

// Helper function to get project-specific URLs
export const getProjectUrl = (path: string = '') => {
  const baseUrl = env.supabase.url.replace('https://', '').replace('.supabase.co', '');
  return `https://${baseUrl}.supabase.co${path}`;
};

// Helper function to get app domain URLs
export const getAppUrl = (subdomain: string = '') => {
  if (subdomain) {
    return `https://${subdomain}.${env.app.domain}`;
  }
  return `https://${env.app.domain}`;
};

// Export for backward compatibility
export default env;
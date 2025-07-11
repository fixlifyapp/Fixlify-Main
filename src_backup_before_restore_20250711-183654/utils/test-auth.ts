import { supabase } from '@/integrations/supabase/client';

export const testAuthentication = async () => {
  try {
    // Get current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    console.log('🔐 Current session:', {
      hasSession: !!session,
      accessToken: session?.access_token ? 'Present' : 'Missing',
      user: session?.user?.email,
      expiresAt: session?.expires_at,
      error: sessionError
    });

    if (!session) {
      console.error('❌ No active session found');
      return false;
    }

    // Check if token is expired
    if (session.expires_at && new Date(session.expires_at * 1000) < new Date()) {
      console.error('❌ Session token is expired');
      
      // Try to refresh
      const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
      if (refreshError) {
        console.error('❌ Failed to refresh session:', refreshError);
        return false;
      }
      
      console.log('✅ Session refreshed successfully');
      return true;
    }

    console.log('✅ Session is valid');
    return true;
  } catch (error) {
    console.error('❌ Error checking authentication:', error);
    return false;
  }
};

export const testEdgeFunctionCall = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      console.error('❌ No session available for edge function call');
      return;
    }

    console.log('🚀 Testing edge function with token:', session.access_token.substring(0, 20) + '...');

    // Test a simple edge function call
    const response = await fetch('https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/send-estimate-sms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xcHB2Y3JsdnNncnNxZWxnbG9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1OTE3MDUsImV4cCI6MjA2MzE2NzcwNX0.My-KiqG1bCMqzUru4m59d4v18N3WGxNoNtFPOFAmhzg'
      },
      body: JSON.stringify({
        estimateId: 'test',
        recipientPhone: 'test',
        message: 'test'
      })
    });

    const data = await response.json();
    console.log('📡 Edge function response:', {
      status: response.status,
      statusText: response.statusText,
      data
    });

  } catch (error) {
    console.error('❌ Edge function test failed:', error);
  }
};

// Add to window for easy browser console testing
if (typeof window !== 'undefined') {
  (window as any).testSupabaseAuth = testSupabaseAuth;
} 
import { supabase } from "@/integrations/supabase/client";

export const testEdgeFunctionDirectly = async () => {
  console.log('🔍 Testing Edge Function Directly...');
  
  try {
    // Step 1: Get current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    console.log('🔐 Session status:', {
      hasSession: !!session,
      sessionError,
      userId: session?.user?.id,
      accessToken: session?.access_token ? 'Present' : 'Missing'
    });

    if (!session) {
      console.error('❌ No active session. Please log in first.');
      return;
    }

    // Step 2: Get a real estimate ID
    const { data: estimates, error: estimateError } = await supabase
      .from('estimates')
      .select('id, estimate_number, client_id')
      .limit(1)
      .single();

    if (estimateError || !estimates) {
      console.error('❌ Could not fetch estimate:', estimateError);
      return;
    }

    console.log('📄 Using estimate:', {
      id: estimates.id,
      number: estimates.estimate_number
    });

    // Step 3: Test the edge function with different methods
    console.log('\n📡 Testing Edge Function Call Methods...\n');

    // Method 1: Using supabase.functions.invoke (recommended)
    console.log('1️⃣ Testing with supabase.functions.invoke...');
    try {
      const response1 = await supabase.functions.invoke('send-estimate-sms', {
        body: {
          estimateId: estimates.id,
          recipientPhone: '+16474242323',
          message: 'Test message from debug'
        }
      });

      console.log('Response from invoke:', {
        error: response1.error,
        data: response1.data,
        status: response1.error?.status
      });
    } catch (e) {
      console.error('Error with invoke:', e);
    }

    // Method 2: Direct fetch with auth header
    console.log('\n2️⃣ Testing with direct fetch...');
    try {
      const response2 = await fetch('https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/send-estimate-sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xcHB2Y3JsdnNncnNxZWxnbG9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1OTE3MDUsImV4cCI6MjA2MzE2NzcwNX0.My-KiqG1bCMqzUru4m59d4v18N3WGxNoNtFPOFAmhzg'
        },
        body: JSON.stringify({
          estimateId: estimates.id,
          recipientPhone: '+16474242323',
          message: 'Test message from debug'
        })
      });

      const data = await response2.text();
      console.log('Response from direct fetch:', {
        status: response2.status,
        statusText: response2.statusText,
        data: data
      });
    } catch (e) {
      console.error('Error with direct fetch:', e);
    }

    // Method 3: Check if it's a CORS issue by testing OPTIONS
    console.log('\n3️⃣ Testing CORS with OPTIONS request...');
    try {
      const response3 = await fetch('https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/send-estimate-sms', {
        method: 'OPTIONS',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('CORS Response:', {
        status: response3.status,
        headers: {
          'access-control-allow-origin': response3.headers.get('access-control-allow-origin'),
          'access-control-allow-headers': response3.headers.get('access-control-allow-headers'),
          'access-control-allow-methods': response3.headers.get('access-control-allow-methods')
        }
      });
    } catch (e) {
      console.error('Error with OPTIONS:', e);
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

// Add to window for easy testing
if (typeof window !== 'undefined') {
  (window as any).testEdgeFunction = testEdgeFunctionDirectly;
} 
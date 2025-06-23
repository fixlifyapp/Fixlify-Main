import { supabase } from "@/integrations/supabase/client";

export const debugSMSSending = async () => {
  try {
    console.log('🔍 Starting SMS debug test...');
    
    // Step 1: Check authentication
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    console.log('🔐 Session check:', {
      hasSession: !!session,
      sessionError,
      userId: session?.user?.id,
      email: session?.user?.email
    });

    if (!session) {
      console.error('❌ No active session');
      return;
    }

    // Step 2: Get a test estimate ID
    const { data: estimates, error: estimateError } = await supabase
      .from('estimates')
      .select('id, estimate_number')
      .limit(1);

    console.log('📄 Estimate query:', {
      found: estimates?.length || 0,
      error: estimateError,
      estimate: estimates?.[0]
    });

    if (!estimates || estimates.length === 0) {
      console.error('❌ No estimates found');
      return;
    }

    const testEstimateId = estimates[0].id;
    console.log('✅ Using estimate:', testEstimateId, 'Number:', estimates[0].estimate_number);

    // Step 3: Test the edge function directly
    console.log('🚀 Calling send-estimate-sms edge function...');
    
    const response = await fetch('https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/send-estimate-sms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xcHB2Y3JsdnNncnNxZWxnbG9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1OTE3MDUsImV4cCI6MjA2MzE2NzcwNX0.My-KiqG1bCMqzUru4m59d4v18N3WGxNoNtFPOFAmhzg'
      },
      body: JSON.stringify({
        estimateId: testEstimateId,
        recipientPhone: '+16474242323',
        message: 'Test SMS from debug'
      })
    });

    const responseText = await response.text();
    console.log('📡 Raw response:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      body: responseText
    });

    try {
      const data = JSON.parse(responseText);
      console.log('📦 Parsed response:', data);
    } catch (e) {
      console.error('❌ Failed to parse response as JSON');
    }

    // Step 4: Also test via Supabase client
    console.log('\n🚀 Testing via Supabase client...');
    const { data: supabaseData, error: supabaseError } = await supabase.functions.invoke('send-estimate-sms', {
      body: {
        estimateId: testEstimateId,
        recipientPhone: '+16474242323',
        message: 'Test SMS from debug via Supabase client'
      }
    });

    console.log('📡 Supabase client response:', {
      data: supabaseData,
      error: supabaseError
    });

  } catch (error) {
    console.error('❌ Debug test failed:', error);
  }
};

// Add to window for easy access
if (typeof window !== 'undefined') {
  (window as any).debugSMS = debugSMSSending;
} 
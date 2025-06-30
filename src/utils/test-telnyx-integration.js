// Test Telnyx Integration
// Run this in the browser console to test Telnyx phone number functionality

async function testTelnyxIntegration() {
  console.log('🧪 Testing Telnyx Integration...\n');
  
  // Import supabase
  const { supabase } = await import('@/integrations/supabase/client');
  
  // 1. Check user authentication
  console.log('1️⃣ Checking authentication...');
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    console.error('❌ Not authenticated. Please log in first.');
    return;
  }
  
  console.log('✅ Authenticated as:', user.email);
  console.log('   User ID:', user.id);
  
  // 2. Check user's phone numbers
  console.log('\n2️⃣ Checking user phone numbers...');
  const { data: phoneNumbers, error: phoneError } = await supabase
    .from('telnyx_phone_numbers')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'active');
    
  if (phoneError) {
    console.error('❌ Error fetching phone numbers:', phoneError);
    return;
  }
  
  if (phoneNumbers.length === 0) {
    console.log('⚠️ No phone numbers assigned to user');
    console.log('   Available numbers to claim:');
    
    // Check claimable numbers
    const { data: claimable } = await supabase
      .from('telnyx_phone_numbers')
      .select('phone_number, area_code')
      .is('user_id', null)
      .eq('status', 'active');
      
    if (claimable && claimable.length > 0) {
      claimable.forEach(num => {
        console.log(`   - ${num.phone_number} (Area: ${num.area_code})`);
      });
    }
  } else {
    console.log('✅ User has', phoneNumbers.length, 'phone number(s):');
    phoneNumbers.forEach(num => {
      console.log(`   - ${num.phone_number} (Area: ${num.area_code})`);
      if (num.ai_dispatcher_enabled) {
        console.log('     ↳ AI Dispatcher: Enabled');
      }
    });
  }
  
  // 3. Check Telnyx configuration
  console.log('\n3️⃣ Checking Telnyx configuration...');
  const config = {
    apiKey: import.meta.env.VITE_TELNYX_API_KEY ? '✅ Set' : '❌ Missing',
    connectionId: import.meta.env.VITE_TELNYX_CONNECTION_ID || 'Missing',
    publicKey: import.meta.env.VITE_TELNYX_PUBLIC_KEY ? '✅ Set' : '❌ Missing'
  };
  
  console.log('   API Key:', config.apiKey);
  console.log('   Connection ID:', config.connectionId);
  console.log('   Public Key:', config.publicKey);
  
  // 4. Test SMS sending capability
  if (phoneNumbers.length > 0) {
    console.log('\n4️⃣ Testing SMS capability...');
    console.log('   To send a test SMS, run:');
    console.log(`   testSendSMS('+1234567890', 'Hello from Fixlify!')`);
  }
  
  // 5. Check recent activity
  console.log('\n5️⃣ Checking recent activity...');
  const { data: recentLogs } = await supabase
    .from('communication_logs')
    .select('*')
    .eq('provider', 'telnyx')
    .order('created_at', { ascending: false })
    .limit(5);
    
  if (recentLogs && recentLogs.length > 0) {
    console.log(`   Found ${recentLogs.length} recent activities`);
  } else {
    console.log('   No recent Telnyx activity');
  }
  
  console.log('\n✅ Telnyx integration test complete!');
}

// Test SMS sending function
window.testSendSMS = async function(toNumber, message) {
  const { supabase } = await import('@/integrations/supabase/client');
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    console.error('Please log in first');
    return;
  }
  
  console.log('📱 Sending test SMS...');
  console.log('   To:', toNumber);
  console.log('   Message:', message);
  
  const { data, error } = await supabase.functions.invoke('telnyx-sms', {
    body: {
      recipientPhone: toNumber,
      message: message,
      user_id: user.id
    }
  });
  
  if (error) {
    console.error('❌ Error:', error);
  } else if (data.success) {
    console.log('✅ SMS sent successfully!');
    console.log('   Message ID:', data.id);
  } else {
    console.error('❌ Failed:', data.error);
  }
};

// Auto-run the test
testTelnyxIntegration();
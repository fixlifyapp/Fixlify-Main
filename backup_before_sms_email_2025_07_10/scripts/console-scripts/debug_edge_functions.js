// Debug Edge Functions for Send Estimate/Invoice
console.log('🔍 Debugging Edge Functions...\n');

async function testEdgeFunctions() {
  if (!window.supabase) {
    console.error('❌ Supabase client not found!');
    return;
  }

  try {
    // Get session
    const { data: { session } } = await window.supabase.auth.getSession();
    if (!session) {
      console.error('❌ No active session. Please log in.');
      return;
    }

    console.log('✅ User authenticated:', session.user.email);
    console.log('🔑 Access token available');
    
    // List of functions to test
    const functions = [
      'send-estimate',
      'send-estimate-sms',
      'send-invoice',
      'send-invoice-sms',
      'mailgun-email',
      'telnyx-sms'
    ];

    console.log('\n📋 Testing Edge Functions:');
    
    // Test each function with a simple ping
    for (const funcName of functions) {
      console.log(`\nTesting ${funcName}...`);
      
      try {
        const response = await fetch(
          `https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/${funcName}`,
          {
            method: 'OPTIONS',
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
              'apikey': session.access_token
            }
          }
        );
        
        if (response.ok) {
          console.log(`✅ ${funcName}: Accessible (${response.status})`);
        } else {
          console.error(`❌ ${funcName}: Error ${response.status} - ${response.statusText}`);
          
          // Try to get more details
          try {
            const errorText = await response.text();
            if (errorText) {
              console.log(`   Details: ${errorText}`);
            }
          } catch (e) {
            // Ignore text parsing errors
          }
        }
      } catch (error) {
        console.error(`❌ ${funcName}: Network error -`, error.message);
      }
    }
    
    // Test a simple estimate send
    console.log('\n\n🧪 Testing send-estimate with minimal data:');
    
    try {
      const testResponse = await window.supabase.functions.invoke('send-estimate', {
        body: {
          estimateId: 'test-id',
          recipientEmail: 'test@example.com'
        }
      });
      
      console.log('Response:', testResponse);
      
      if (testResponse.error) {
        console.error('❌ Error:', testResponse.error);
      } else {
        console.log('✅ Data:', testResponse.data);
      }
    } catch (error) {
      console.error('❌ Test failed:', error);
    }
    
    console.log('\n\n💡 Quick Actions:');
    console.log('1. Check if edge functions are deployed');
    console.log('2. Verify API keys are configured');
    console.log('3. Check function logs in Supabase dashboard');
    console.log('4. Try redeploying the functions');
    
  } catch (error) {
    console.error('❌ Error during testing:', error);
  }
}

// Test edge function URL directly
async function testDirectURL() {
  console.log('\n📡 Testing direct URL access...');
  
  const testUrl = 'https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/send-estimate';
  
  try {
    const response = await fetch(testUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    console.log(`Direct URL test: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      const text = await response.text();
      console.log('Response body:', text);
    }
  } catch (error) {
    console.error('Direct URL error:', error);
  }
}

// Run tests
testEdgeFunctions();
testDirectURL();

// Manual test function
window.debugSendEstimate = async function(estimateId) {
  console.log('\n🚀 Manual test: Sending estimate', estimateId);
  
  const { data: { session } } = await window.supabase.auth.getSession();
  if (!session) {
    console.error('Not authenticated');
    return;
  }
  
  try {
    // First, let's check if the estimate exists
    const { data: estimate, error: fetchError } = await window.supabase
      .from('estimates')
      .select('*')
      .eq('id', estimateId)
      .single();
    
    if (fetchError) {
      console.error('Error fetching estimate:', fetchError);
      return;
    }
    
    console.log('Estimate found:', estimate);
    
    // Try to send it
    const response = await window.supabase.functions.invoke('send-estimate', {
      body: {
        estimateId: estimateId,
        recipientEmail: 'test@example.com'
      }
    });
    
    console.log('Send response:', response);
  } catch (error) {
    console.error('Error:', error);
  }
};

console.log('\n💡 Use debugSendEstimate("estimate-id") to test with a real estimate');
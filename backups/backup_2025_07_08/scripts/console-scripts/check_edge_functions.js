// Debug Send Feature - Check Edge Function Status
// Run this in browser console to see what's happening

console.log('🔍 Checking Universal Send Edge Functions...');

async function checkEdgeFunctions() {
  const supabase = window.supabase;
  if (!supabase) {
    console.error('❌ Supabase client not found!');
    return;
  }

  // Check if functions are responding
  console.log('\n📡 Checking edge function endpoints...');
  
  const functions = ['send-estimate', 'send-invoice', 'send-estimate-sms', 'send-invoice-sms'];
  
  for (const func of functions) {
    try {
      const url = `${supabase.supabaseUrl}/functions/v1/${func}`;
      console.log(`Testing ${func}: ${url}`);
      
      const response = await fetch(url, {
        method: 'OPTIONS',
        headers: {
          'Authorization': `Bearer ${supabase.anonKey}`
        }
      });
      
      console.log(`${func}: Status ${response.status} ${response.status === 200 ? '✅' : '❌'}`);
    } catch (err) {
      console.error(`${func}: ❌ Error - ${err.message}`);
    }
  }

  // Test with a real estimate
  console.log('\n🧪 Testing with real data...');
  
  const { data: estimates, error: estError } = await supabase
    .from('estimates')
    .select('*, jobs(client_id), clients!estimates_client_id_fkey(*)')
    .limit(1);

  if (estError) {
    console.error('Error fetching estimates:', estError);
    return;
  }

  if (!estimates || estimates.length === 0) {
    console.log('No estimates found to test with');
    return;
  }

  const estimate = estimates[0];
  console.log('Test estimate:', {
    id: estimate.id,
    number: estimate.estimate_number,
    client: estimate.clients?.name || 'No client',
    email: estimate.clients?.email || estimate.client_email || 'No email'
  });

  // Try to invoke the function
  console.log('\n📤 Invoking send-estimate function...');
  
  try {
    const { data, error } = await supabase.functions.invoke('send-estimate', {
      body: {
        estimateId: estimate.id,
        sendToClient: true,
        customMessage: 'Debug test from console'
      }
    });

    if (error) {
      console.error('❌ Function error:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.status,
        details: error.details
      });
      
      // Try to get more details
      if (error.message?.includes('FetchError')) {
        console.error('🌐 Network error - edge function might not be deployed');
      } else if (error.message?.includes('401') || error.message?.includes('403')) {
        console.error('🔐 Authentication error - check function permissions');
      } else if (error.message?.includes('500')) {
        console.error('💥 Server error in edge function - check function logs');
      }
    } else {
      console.log('✅ Function response:', data);
    }
  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

// Also test the dialog component
function testSendDialog() {
  console.log('\n🎭 Checking Send Dialog...');
  
  // Find send buttons
  const sendButtons = Array.from(document.querySelectorAll('button')).filter(
    btn => btn.textContent?.includes('Send') || 
           btn.querySelector('svg[class*="Send"]')
  );
  
  console.log(`Found ${sendButtons.length} send button(s)`);
  
  if (sendButtons.length > 0) {
    console.log('Click a send button to open the dialog and test');
  }
}

checkEdgeFunctions();
testSendDialog();

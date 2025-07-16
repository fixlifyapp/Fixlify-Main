// Debug Universal Send Issue
// Run this in browser console to see the exact error

console.log('🔍 Debugging Universal Send...');

async function debugSend() {
  const supabase = window.supabase;
  if (!supabase) {
    console.error('❌ Supabase client not found!');
    return;
  }

  // Test the edge function directly
  console.log('📡 Testing edge function invocation...');
  
  try {
    // First, let's check if edge functions are accessible
    const testResponse = await fetch(
      `${supabase.supabaseUrl}/functions/v1/send-estimate`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabase.anonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          estimateId: 'test',
          sendToClient: true
        })
      }
    );

    console.log('Response status:', testResponse.status);
    const responseText = await testResponse.text();
    console.log('Response body:', responseText);

    // Now test with actual Supabase client
    console.log('\n📡 Testing with Supabase client...');
    
    // Get a real estimate ID
    const { data: estimates } = await supabase
      .from('estimates')
      .select('id, estimate_number, client_id, job_id')
      .limit(1);

    if (estimates && estimates.length > 0) {
      const testEstimate = estimates[0];
      console.log('Using estimate:', testEstimate);

      const { data, error } = await supabase.functions.invoke('send-estimate', {
        body: {
          estimateId: testEstimate.id,
          sendToClient: true,
          customMessage: 'Debug test'
        }
      });

      if (error) {
        console.error('❌ Edge function error:', error);
        console.error('Full error object:', JSON.stringify(error, null, 2));
      } else {
        console.log('✅ Edge function response:', data);
      }
    }

  } catch (err) {
    console.error('❌ Unexpected error:', err);
    console.error('Error stack:', err.stack);
  }
}

// Also check if the functions are deployed
async function checkDeployment() {
  console.log('\n🚀 Checking edge function deployment...');
  
  const functions = [
    'send-estimate',
    'send-invoice', 
    'send-estimate-sms',
    'send-invoice-sms'
  ];

  for (const func of functions) {
    try {
      const response = await fetch(
        `${window.supabase.supabaseUrl}/functions/v1/${func}`,
        { method: 'OPTIONS' }
      );
      console.log(`${func}: ${response.status === 200 ? '✅ Deployed' : '❌ Not found'}`);
    } catch (err) {
      console.log(`${func}: ❌ Error checking`);
    }
  }
}

debugSend();
checkDeployment();

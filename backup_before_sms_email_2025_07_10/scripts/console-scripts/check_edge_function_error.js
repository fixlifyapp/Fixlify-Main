// Run this in browser console to see the actual error

console.log('🔍 Checking edge function error...');

async function checkEdgeFunctionError() {
  const supabase = window.supabase;
  if (!supabase) {
    console.error('❌ Supabase client not found!');
    return;
  }

  // Find an estimate to test
  const { data: estimates } = await supabase
    .from('estimates')
    .select('id, estimate_number, client_id, job_id')
    .limit(1)
    .single();

  if (!estimates) {
    console.error('❌ No estimates found to test');
    return;
  }

  console.log(`📄 Testing with estimate #${estimates.estimate_number}`);
  console.log('Estimate ID:', estimates.id);

  // Call the edge function directly
  try {
    const { data, error } = await supabase.functions.invoke('send-estimate', {
      body: {
        estimateId: estimates.id,
        sendToClient: true,
        customMessage: 'Test message'
      }
    });

    if (error) {
      console.error('❌ Edge function error:', error);
      console.error('Error message:', error.message);
      console.error('Error details:', JSON.stringify(error, null, 2));
    } else {
      console.log('✅ Edge function response:', data);
    }

    // Also check the logs
    console.log('\n📋 Checking edge function logs...');
    const logsResponse = await supabase.functions.invoke('get-logs', {
      body: { functionName: 'send-estimate', limit: 5 }
    }).catch(err => {
      console.log('Could not fetch logs:', err.message);
    });

  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

// Also check if edge functions are deployed
async function checkDeployedFunctions() {
  console.log('\n📦 Checking deployed edge functions...');
  
  const functions = [
    'send-estimate',
    'send-invoice', 
    'send-estimate-sms',
    'send-invoice-sms'
  ];

  for (const func of functions) {
    try {
      // Try to call with empty body to see if it exists
      const { error } = await window.supabase.functions.invoke(func, {
        body: {}
      });
      
      if (error && error.message.includes('not found')) {
        console.error(`❌ ${func} - NOT DEPLOYED`);
      } else {
        console.log(`✅ ${func} - Deployed`);
      }
    } catch (err) {
      console.error(`❌ ${func} - Error: ${err.message}`);
    }
  }
}

checkEdgeFunctionError();
checkDeployedFunctions();

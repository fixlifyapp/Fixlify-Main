// Test Edge Function Error
// Run this in browser console to see the exact error

async function testSendError() {
  console.log('🔍 Testing send functionality...');
  
  // Get the first estimate with a client
  const { data: estimate } = await window.supabase
    .from('estimates')
    .select(`
      *,
      clients!estimates_client_id_fkey(
        id,
        name,
        email,
        phone
      ),
      jobs(
        id,
        client_id
      )
    `)
    .not('client_id', 'is', null)
    .limit(1)
    .single();

  if (!estimate) {
    console.error('No estimate with client found');
    return;
  }

  console.log('Test estimate:', {
    id: estimate.id,
    number: estimate.estimate_number,
    client: estimate.clients?.name,
    email: estimate.clients?.email
  });

  // Test the edge function
  console.log('\n📤 Calling edge function...');
  
  const { data, error } = await window.supabase.functions.invoke('send-estimate', {
    body: {
      estimateId: estimate.id,
      sendToClient: true,
      customMessage: 'Test from console'
    }
  });

  if (error) {
    console.error('❌ Error:', error);
    console.error('Full error:', JSON.stringify(error, null, 2));
    
    // Try direct fetch to get more details
    console.log('\n🔍 Trying direct fetch for more details...');
    
    try {
      const response = await fetch(
        `${window.supabase.supabaseUrl}/functions/v1/send-estimate`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${window.supabase.anonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            estimateId: estimate.id,
            sendToClient: true,
            customMessage: 'Test from console'
          })
        }
      );
      
      console.log('Response status:', response.status);
      const text = await response.text();
      console.log('Response body:', text);
      
      try {
        const json = JSON.parse(text);
        console.log('Parsed response:', json);
      } catch (e) {
        console.log('Response is not JSON');
      }
    } catch (fetchErr) {
      console.error('Fetch error:', fetchErr);
    }
  } else {
    console.log('✅ Success:', data);
  }
}

testSendError();

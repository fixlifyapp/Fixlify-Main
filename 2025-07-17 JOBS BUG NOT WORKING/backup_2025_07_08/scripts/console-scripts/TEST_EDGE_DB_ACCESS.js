// Test edge function database access
(async () => {
  console.log('Testing edge function database access...');
  
  // First, let's check if we can access the estimate from the client side
  const estimateId = '5c0cd9d9-6a8e-4a73-9bea-a0e4677c6fb1';
  
  const { data: estimate, error: estimateError } = await window.supabase
    .from('estimates')
    .select(`
      *,
      jobs(
        *,
        clients(*)
      )
    `)
    .eq('id', estimateId)
    .single();
  
  console.log('Client-side estimate query:', { estimate, error: estimateError });
  
  // If we can access it from client side, let's see why edge function can't
  if (estimate) {
    console.log('Estimate found:', {
      id: estimate.id,
      estimate_number: estimate.estimate_number,
      job_id: estimate.job_id,
      total: estimate.total
    });
    
    if (estimate.jobs) {
      console.log('Job found:', {
        id: estimate.jobs.id,
        client_id: estimate.jobs.client_id
      });
      
      if (estimate.jobs.clients) {
        console.log('Client found:', {
          id: estimate.jobs.clients.id,
          name: estimate.jobs.clients.name,
          phone: estimate.jobs.clients.phone
        });
      }
    }
  }
  
  // Now let's test a simpler edge function call
  console.log('\nTesting edge function with known data...');
  
  const { data: edgeResponse, error: edgeError } = await window.supabase.functions.invoke('send-estimate-sms', {
    body: {
      estimateId: estimateId,
      recipientPhone: '4377476737',
      message: 'Test message from console'
    }
  });
  
  console.log('Edge function response:', { data: edgeResponse, error: edgeError });
  
  // If there's an error, let's get more details
  if (edgeError) {
    console.error('Edge function error details:', edgeError);
    
    // Try to get the actual error message from the edge function
    const { data: { session } } = await window.supabase.auth.getSession();
    if (session) {
      try {
        const response = await fetch(
          `${window.supabase.supabaseUrl}/functions/v1/send-estimate-sms`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.access_token}`,
              'apikey': window.supabase.supabaseKey
            },
            body: JSON.stringify({
              estimateId: estimateId,
              recipientPhone: '4377476737',
              message: 'Test message'
            })
          }
        );
        
        const text = await response.text();
        console.log('\nRaw edge function response:');
        console.log('Status:', response.status);
        console.log('Body:', text);
        
        try {
          const parsed = JSON.parse(text);
          console.log('Parsed error:', parsed);
        } catch (e) {
          console.log('Response is not JSON:', text);
        }
      } catch (fetchError) {
        console.error('Fetch error:', fetchError);
      }
    }
  }
})();
// Check what's happening with the estimate data
(async () => {
  const estimateId = '5c0cd9d9-6a8e-4a73-9bea-a0e4677c6fb1';
  
  console.log('Checking estimate data...');
  
  // Check if estimate exists
  const { data: estimate, error: estimateError } = await window.supabase
    .from('estimates')
    .select('*')
    .eq('id', estimateId)
    .single();
    
  console.log('Estimate:', { estimate, error: estimateError });
  
  if (estimate && estimate.job_id) {
    // Check if job exists
    const { data: job, error: jobError } = await window.supabase
      .from('jobs')
      .select('*')
      .eq('id', estimate.job_id)
      .single();
      
    console.log('Job:', { job, error: jobError });
    
    if (job && job.client_id) {
      // Check if client exists
      const { data: client, error: clientError } = await window.supabase
        .from('clients')
        .select('*')
        .eq('id', job.client_id)
        .single();
        
      console.log('Client:', { client, error: clientError });
    }
  }
  
  // Now let's check the actual response from the edge function
  const { data: { session } } = await window.supabase.auth.getSession();
  if (session) {
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
    
    const responseText = await response.text();
    console.log('Edge function raw response:', {
      status: response.status,
      statusText: response.statusText,
      body: responseText
    });
    
    try {
      const parsed = JSON.parse(responseText);
      console.log('Parsed response:', parsed);
    } catch (e) {
      console.log('Could not parse response as JSON');
    }
  }
})();
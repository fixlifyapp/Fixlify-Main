// Add this script to the browser console to test the email sending
(async function testEmailSending() {
  // Get the current user's session
  const { data: { session } } = await window.supabase.auth.getSession();
  
  if (!session) {
    console.error('No active session. Please log in first.');
    return;
  }
  
  console.log('Session found, testing email send...');
  
  // Find an estimate to test with
  const { data: estimates, error: estimatesError } = await window.supabase
    .from('estimates')
    .select('*')
    .limit(1);
    
  if (estimatesError || !estimates.length) {
    console.error('No estimates found:', estimatesError);
    return;
  }
  
  const testEstimate = estimates[0];
  console.log('Testing with estimate:', testEstimate.id, testEstimate.estimate_number);
  
  // Call the edge function
  try {
    const { data, error } = await window.supabase.functions.invoke('send-estimate', {
      body: {
        estimateId: testEstimate.id,
        recipientEmail: 'test@example.com',
        customMessage: 'This is a test email from the browser console'
      }
    });
    
    if (error) {
      console.error('Edge function error:', error);
    } else {
      console.log('Success! Email sent:', data);
    }
  } catch (err) {
    console.error('Unexpected error:', err);
  }
})();

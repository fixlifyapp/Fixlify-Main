// Direct test for SMS sending
// Copy and paste this entire code into the browser console

async function testSendEstimateSMS() {
  // Get the estimate ID from the current page
  const estimateId = document.querySelector('[data-estimate-id]')?.dataset.estimateId || 
                     document.querySelector('input[name="estimateId"]')?.value ||
                     '5c0cd9d9-6a8e-4a73-9bea-a0e4677c6fb1'; // Use the ID from your screenshot
  
  const phone = '4377476737';
  const message = 'Test message from direct API call';
  
  console.log('Testing with:', { estimateId, phone, message });
  
  // Get the current session
  const { data: { session } } = await window.supabase.auth.getSession();
  
  if (!session) {
    console.error('No active session. Please log in first.');
    return;
  }
  
  console.log('Session found, calling edge function...');
  
  try {
    // Call the edge function directly using supabase
    const { data, error } = await window.supabase.functions.invoke('send-estimate-sms', {
      body: {
        estimateId: estimateId,
        recipientPhone: phone,
        message: message
      }
    });
    
    console.log('Edge function response:', { data, error });
    
    if (error) {
      console.error('Edge function error:', error);
      
      // Try direct fetch to get more details
      console.log('Trying direct fetch for more details...');
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
            recipientPhone: phone,
            message: message
          })
        }
      );
      
      const responseText = await response.text();
      console.log('Direct fetch response:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        body: responseText
      });
    }
    
    return data;
  } catch (error) {
    console.error('Error calling edge function:', error);
    return null;
  }
}

// Run the test
console.log('Starting SMS test...');
testSendEstimateSMS();
// Debug script for edge function error
// Run this in browser console to test the edge function directly

async function testSendEstimateFunction() {
  console.log('🔍 Testing send-estimate edge function...');
  
  try {
    // Get auth token
    const authToken = localStorage.getItem('fixlify-auth-token');
    if (!authToken) {
      console.error('❌ No auth token found. Please log in.');
      return;
    }
    
    const token = JSON.parse(authToken);
    
    // Create a test request
    const testPayload = {
      estimateId: 'test-id-12345',
      recipientEmail: 'test@example.com',
      customMessage: 'This is a test message'
    };
    
    console.log('📤 Sending test request:', testPayload);
    
    const response = await fetch('https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/send-estimate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token.access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testPayload)
    });
    
    const responseText = await response.text();
    let result;
    
    try {
      result = JSON.parse(responseText);
    } catch (e) {
      result = responseText;
    }
    
    console.log('📥 Response status:', response.status);
    console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));
    console.log('📥 Response body:', result);
    
    if (!response.ok) {
      console.error('❌ Edge function returned error:', {
        status: response.status,
        statusText: response.statusText,
        body: result
      });
      
      // Analyze the error
      if (result?.error?.includes('not configured') || result?.error?.includes('MAILGUN_API_KEY')) {
        console.error('🔑 MAILGUN_API_KEY is not set in Supabase environment variables!');
        console.log('👉 Go to: https://supabase.com/dashboard/project/mqppvcrlvsgrsqelglod/functions/secrets');
        console.log('👉 Add MAILGUN_API_KEY with your Mailgun API key');
      } else if (result?.error?.includes('not found')) {
        console.error('📧 The estimate was not found in the database');
      } else if (result?.error?.includes('authenticate')) {
        console.error('🔐 Authentication issue - try logging out and back in');
      }
    } else {
      console.log('✅ Edge function test successful!');
    }
    
  } catch (error) {
    console.error('❌ Network or other error:', error);
  }
}

// Run the test
testSendEstimateFunction();

console.log(`
📌 Common Solutions:
1. Set MAILGUN_API_KEY in Supabase Edge Function secrets
2. Make sure you're using a valid Mailgun API key
3. Check that your Mailgun domain is verified
4. Ensure the estimate exists in the database
`);

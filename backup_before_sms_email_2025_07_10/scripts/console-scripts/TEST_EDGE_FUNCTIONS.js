// Test Edge Function Script
// This script helps debug edge function issues

async function testEdgeFunction(functionName, payload) {
  const { data: { session } } = await window.supabase.auth.getSession();
  
  if (!session) {
    console.error('No active session. Please log in first.');
    return;
  }

  console.log(`Testing edge function: ${functionName}`);
  console.log('Payload:', payload);
  
  try {
    const response = await fetch(
      `${window.supabase.supabaseUrl}/functions/v1/${functionName}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': window.supabase.supabaseKey
        },
        body: JSON.stringify(payload)
      }
    );

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('Response text:', responseText);
    
    try {
      const data = JSON.parse(responseText);
      console.log('Parsed response:', data);
      return data;
    } catch (e) {
      console.error('Failed to parse response as JSON:', e);
      return responseText;
    }
  } catch (error) {
    console.error('Error calling edge function:', error);
    return null;
  }
}

// Test send-estimate-sms function
async function testSendEstimateSMS(estimateId, recipientPhone, message) {
  return testEdgeFunction('send-estimate-sms', {
    estimateId,
    recipientPhone,
    message
  });
}

// Test mailgun-email function
async function testMailgunEmail(to, subject, body) {
  return testEdgeFunction('mailgun-email', {
    to,
    subject,
    html: body,
    text: body
  });
}

// Instructions
console.log(`
Edge Function Test Script Loaded!

To test SMS sending:
testSendEstimateSMS('estimate-id', '4377476737', 'Custom message')

To test email sending:
testMailgunEmail('test@example.com', 'Test Subject', 'Test body')

Make sure you're logged in to the application first!
`);
// Step-by-step SMS webhook diagnostic
// This will help identify where the SMS is getting lost

const WEBHOOK_URL = 'https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/sms-webhook';

console.log('=== SMS Webhook Path Diagnostic ===\n');

console.log('STEP 1: The SMS flow path is:');
console.log('1. Telnyx receives SMS from +14168875839 (Taras) ✓ You see it in Telnyx debug');
console.log('2. Telnyx sends webhook to your URL');
console.log('3. Your edge function (sms-webhook) receives it');
console.log('4. Edge function processes and stores in database');
console.log('5. Message appears in Connect Center\n');

console.log('STEP 2: Checking webhook URL configuration:');
console.log(`Expected webhook URL: ${WEBHOOK_URL}`);
console.log('\nPlease verify in Telnyx portal:');
console.log('1. Go to https://portal.telnyx.com');
console.log('2. Navigate to Messaging > Messaging Profiles');
console.log('3. Click on your messaging profile');
console.log('4. Check the "Webhook URL" field');
console.log('5. Make sure it matches the URL above\n');

console.log('STEP 3: Testing webhook is reachable:');

// Test 1: Basic connectivity
fetch(WEBHOOK_URL, {
  method: 'OPTIONS',
  headers: {
    'Content-Type': 'application/json'
  }
})
.then(response => {
  console.log(`✓ Webhook is reachable (OPTIONS request): ${response.status}`);
  
  // Test 2: Send a test inbound message
  const testPayload = {
    data: {
      record_type: 'message',
      event_type: 'message.received',
      id: `diagnostic-test-${Date.now()}`,
      occurred_at: new Date().toISOString(),
      payload: {
        id: `msg-diagnostic-${Date.now()}`,
        from: {
          phone_number: '+14168875839',
          carrier: 'T-Mobile',
          line_type: 'Wireless'
        },
        to: [{
          phone_number: '+14375249932',
          status: 'delivered'
        }],
        text: `DIAGNOSTIC TEST: If you see this in database, webhook is working! Time: ${new Date().toLocaleTimeString()}`,
        direction: 'inbound',
        type: 'SMS',
        received_at: new Date().toISOString()
      }
    }
  };
  
  console.log('\nSTEP 4: Sending test message to webhook...');
  
  return fetch(WEBHOOK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'telnyx-webhooks'
    },
    body: JSON.stringify(testPayload)
  });
})
.then(response => {
  console.log(`✓ Test webhook sent: ${response.status} ${response.statusText}`);
  return response.text();
})
.then(responseText => {
  console.log(`Response: ${responseText}\n`);
  
  console.log('STEP 5: Check if test message appears in database:');
  console.log('Run this SQL query in Supabase:');
  console.log(`
SELECT * FROM sms_messages 
WHERE content LIKE '%DIAGNOSTIC TEST%' 
ORDER BY created_at DESC 
LIMIT 5;
`);
  
  console.log('\nSTEP 6: Common issues to check:');
  console.log('1. Webhook URL mismatch in Telnyx');
  console.log('2. Telnyx webhook signature verification failing');
  console.log('3. Edge function has an error processing real Telnyx payloads');
  console.log('4. Database constraints preventing insert');
  
  console.log('\nSTEP 7: Check edge function logs:');
  console.log('1. Go to Supabase dashboard');
  console.log('2. Navigate to Edge Functions > sms-webhook');
  console.log('3. Check the logs for any errors');
  
  console.log('\nSTEP 8: Telnyx webhook retry behavior:');
  console.log('- Telnyx retries failed webhooks up to 5 times');
  console.log('- Check if you see multiple webhook attempts in Telnyx debug');
  console.log('- If retries are failing, the issue is likely webhook URL or signature');
})
.catch(error => {
  console.error(`✗ Webhook test failed: ${error.message}`);
  console.log('\nThe webhook endpoint is not reachable!');
  console.log('This explains why Telnyx messages are not arriving.');
});

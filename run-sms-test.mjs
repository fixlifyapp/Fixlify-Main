// Run SMS Test - Simulates incoming SMS from unknown number
import fetch from 'node-fetch';

const SUPABASE_URL = 'https://mqppvcrlvsgrsqelglod.supabase.co';
const WEBHOOK_URL = `${SUPABASE_URL}/functions/v1/sms-webhook`;

// You need to get this from Supabase dashboard > Settings > API
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'YOUR_SERVICE_ROLE_KEY_HERE';

const TEST_UNKNOWN_NUMBER = '+19999999999';
const TEST_USER_NUMBER = '+14377476737';
const TEST_MESSAGE = 'Hi, I need a plumber for my kitchen sink. Can you help?';

async function testIncomingSMS() {
  console.log('🚀 Testing incoming SMS from unknown number...\n');
  
  if (SERVICE_ROLE_KEY === 'YOUR_SERVICE_ROLE_KEY_HERE') {
    console.error('❌ Please set your SUPABASE_SERVICE_ROLE_KEY in the environment or update this script');
    console.log('\nTo get your service role key:');
    console.log('1. Go to: https://supabase.com/dashboard/project/mqppvcrlvsgrsqelglod/settings/api');
    console.log('2. Copy the "service_role" key (starts with eyJ...)');
    console.log('3. Set it as environment variable or update this script');
    return;
  }
  
  console.log('📱 Simulating incoming SMS:');
  console.log('From (unknown):', TEST_UNKNOWN_NUMBER);
  console.log('To (your number):', TEST_USER_NUMBER);
  console.log('Message:', TEST_MESSAGE);
  
  const payload = {
    data: {
      event_type: 'message.received',
      payload: {
        id: `test-${Date.now()}`,
        from: {
          phone_number: TEST_UNKNOWN_NUMBER
        },
        to: [{
          phone_number: TEST_USER_NUMBER
        }],
        text: TEST_MESSAGE,
        received_at: new Date().toISOString()
      }
    }
  };
  
  try {
    console.log('\n📤 Sending webhook request...');
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
      },
      body: JSON.stringify(payload)
    });
    
    console.log('Response status:', response.status, response.statusText);
    
    const responseText = await response.text();
    if (responseText) {
      try {
        const responseData = JSON.parse(responseText);
        console.log('Response data:', JSON.stringify(responseData, null, 2));
      } catch {
        console.log('Response text:', responseText);
      }
    }
    
    if (response.ok) {
      console.log('\n✅ Webhook call successful!');
      console.log('\n🔍 Next steps to verify:');
      console.log('1. Check Supabase database for new client record');
      console.log('2. Check sms_conversations for new conversation');
      console.log('3. Check sms_messages for the message');
      console.log('4. Open Connect Center in the app to see the conversation');
      console.log('\n📊 Run these SQL queries in Supabase:');
      console.log(`
-- Check for new client
SELECT * FROM clients WHERE phone = '${TEST_UNKNOWN_NUMBER}';

-- Check for conversation
SELECT * FROM sms_conversations WHERE client_phone = '${TEST_UNKNOWN_NUMBER}';

-- Check for message
SELECT * FROM sms_messages WHERE from_number = '${TEST_UNKNOWN_NUMBER}';
      `);
    } else {
      console.error('\n❌ Webhook call failed');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the test
testIncomingSMS();

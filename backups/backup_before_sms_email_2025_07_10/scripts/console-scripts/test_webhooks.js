// Test Webhook Functionality
// Run this in the browser console to test webhook endpoints

async function testWebhooks() {
  console.log('🔍 Testing Webhook Configuration...\n');
  
  // Get Supabase instance
  const { supabase } = window;
  if (!supabase) {
    console.error('❌ Supabase not found. Make sure you\'re on the Fixlify app.');
    return;
  }

  // Test functions
  const webhookFunctions = [
    'telnyx-webhook',
    'telnyx-voice-webhook',
    'mailgun-webhook'
  ];

  console.log('📡 Testing Edge Function Status:\n');
  
  for (const funcName of webhookFunctions) {
    try {
      console.log(`Testing ${funcName}...`);
      
      // Try to invoke with a test payload
      const { data, error } = await supabase.functions.invoke(funcName, {
        body: {
          test: true,
          timestamp: new Date().toISOString()
        }
      });
      
      if (error) {
        console.error(`❌ ${funcName}: Error - ${error.message}`);
      } else {
        console.log(`✅ ${funcName}: Responding (${JSON.stringify(data).substring(0, 50)}...)`);
      }
    } catch (err) {
      console.error(`❌ ${funcName}: Failed - ${err.message}`);
    }
  }

  console.log('\n📊 Checking Recent Webhook Activity:\n');

  // Check communication logs
  try {
    const { data: recentLogs, error } = await supabase
      .from('communication_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (error) {
      console.error('❌ Could not fetch communication logs:', error);
    } else if (recentLogs && recentLogs.length > 0) {
      console.log('Recent Communication Logs:');
      recentLogs.forEach(log => {
        console.log(`- ${log.communication_type} to ${log.recipient} - ${log.status} (${new Date(log.created_at).toLocaleString()})`);
      });
    } else {
      console.log('ℹ️ No recent communication logs found');
    }
  } catch (err) {
    console.error('❌ Error checking logs:', err);
  }

  console.log('\n🔗 Webhook URLs for Configuration:\n');
  console.log('SMS Webhook:', `https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/telnyx-webhook`);
  console.log('Voice Webhook:', `https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/telnyx-voice-webhook`);
  console.log('Email Webhook:', `https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/mailgun-webhook`);
  
  console.log('\n📝 Next Steps:');
  console.log('1. Configure these URLs in your Telnyx Messaging Profile');
  console.log('2. Configure these URLs in your Mailgun domain settings');
  console.log('3. Send a test SMS to your phone number');
  console.log('4. Check the logs with: supabase functions logs <function-name>');
}

// Function to send a test SMS
async function sendTestSMS(phoneNumber, message = 'Test message from Fixlify') {
  const { supabase } = window;
  
  console.log(`📱 Sending test SMS to ${phoneNumber}...`);
  
  try {
    const { data, error } = await supabase.functions.invoke('telnyx-sms', {
      body: {
        recipientPhone: phoneNumber,
        message: message,
        test: true
      }
    });
    
    if (error) {
      console.error('❌ SMS send failed:', error);
    } else {
      console.log('✅ SMS sent successfully:', data);
    }
  } catch (err) {
    console.error('❌ Error:', err);
  }
}

// Function to check Telnyx phone numbers
async function checkPhoneNumbers() {
  const { supabase } = window;
  
  console.log('📞 Checking configured phone numbers...\n');
  
  try {
    const { data: phones, error } = await supabase
      .from('telnyx_phone_numbers')
      .select('*')
      .eq('status', 'active');
    
    if (error) {
      console.error('❌ Could not fetch phone numbers:', error);
    } else if (phones && phones.length > 0) {
      console.log('Active Phone Numbers:');
      phones.forEach(phone => {
        console.log(`- ${phone.phone_number} (User: ${phone.user_id || 'Unassigned'})`);
        console.log(`  Profile ID: ${phone.messaging_profile_id || 'Not set'}`);
        console.log(`  Telnyx ID: ${phone.telnyx_phone_id}`);
      });
    } else {
      console.log('⚠️ No active phone numbers found');
    }
  } catch (err) {
    console.error('❌ Error:', err);
  }
}

// Run the tests
console.log('🚀 Fixlify Webhook Test Suite\n');
console.log('Available functions:');
console.log('- testWebhooks() - Test all webhook endpoints');
console.log('- sendTestSMS(phoneNumber, message) - Send a test SMS');
console.log('- checkPhoneNumbers() - List configured phone numbers');
console.log('\nRun testWebhooks() to start...');

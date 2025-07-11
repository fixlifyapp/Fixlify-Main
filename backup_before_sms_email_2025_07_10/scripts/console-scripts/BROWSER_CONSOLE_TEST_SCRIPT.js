// ===================================
// FIXLIFY WEBHOOK & SMS/EMAIL TEST SUITE
// ===================================
// Copy and paste this entire script into your browser console
// while on your Fixlify app (http://localhost:8083)

// Test all webhook endpoints
async function testWebhooks() {
  console.log('🔍 Testing Webhook Configuration...\n');
  
  const { supabase } = window;
  if (!supabase) {
    console.error('❌ Supabase not found. Make sure you\'re on the Fixlify app.');
    return;
  }

  const webhookFunctions = [
    'telnyx-webhook',
    'telnyx-voice-webhook', 
    'mailgun-webhook',
    'telnyx-sms',
    'send-invoice',
    'send-estimate',
    'send-invoice-sms',
    'send-estimate-sms'
  ];

  console.log('📡 Testing Edge Function Status:\n');
  
  for (const funcName of webhookFunctions) {
    try {
      console.log(`Testing ${funcName}...`);
      
      const { data, error } = await supabase.functions.invoke(funcName, {
        body: { test: true, timestamp: new Date().toISOString() }
      });
      
      if (error) {
        console.error(`❌ ${funcName}: Error - ${error.message}`);
      } else {
        console.log(`✅ ${funcName}: Responding`);
      }
    } catch (err) {
      console.error(`❌ ${funcName}: Failed - ${err.message}`);
    }
  }
}

// Check configured phone numbers
async function checkPhoneNumbers() {
  const { supabase } = window;
  
  console.log('\n📞 Checking configured phone numbers...\n');
  
  try {
    const { data: phones, error } = await supabase
      .from('telnyx_phone_numbers')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ Could not fetch phone numbers:', error);
    } else if (phones && phones.length > 0) {
      console.log('Phone Numbers in Database:');
      phones.forEach(phone => {
        console.log(`\n📱 ${phone.phone_number}`);
        console.log(`   Status: ${phone.status}`);
        console.log(`   User ID: ${phone.user_id || 'Unassigned'}`);
        console.log(`   Profile ID: ${phone.messaging_profile_id || 'Not set'}`);
        console.log(`   Created: ${new Date(phone.created_at).toLocaleString()}`);
      });
    } else {
      console.log('⚠️ No phone numbers found in database');
    }
  } catch (err) {
    console.error('❌ Error:', err);
  }
}

// Check recent communication logs
async function checkRecentComms() {
  const { supabase } = window;
  
  console.log('\n📊 Checking Recent Communications...\n');
  
  // Check general logs
  try {
    const { data: logs, error } = await supabase
      .from('communication_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (!error && logs && logs.length > 0) {
      console.log('Recent Communication Logs:');
      logs.forEach(log => {
        console.log(`- ${log.communication_type} to ${log.recipient} - ${log.status} (${new Date(log.created_at).toLocaleString()})`);
      });
    }
  } catch (err) {}

  // Check estimate communications
  try {
    const { data: estComms, error } = await supabase
      .from('estimate_communications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (!error && estComms && estComms.length > 0) {
      console.log('\nRecent Estimate Communications:');
      estComms.forEach(comm => {
        console.log(`- ${comm.communication_type} to ${comm.recipient} - ${comm.status} (${new Date(comm.created_at).toLocaleString()})`);
      });
    }
  } catch (err) {}

  // Check invoice communications
  try {
    const { data: invComms, error } = await supabase
      .from('invoice_communications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (!error && invComms && invComms.length > 0) {
      console.log('\nRecent Invoice Communications:');
      invComms.forEach(comm => {
        console.log(`- ${comm.communication_type} to ${comm.recipient} - ${comm.status} (${new Date(comm.created_at).toLocaleString()})`);
      });
    }
  } catch (err) {}
}

// Test sending an SMS
async function testSendSMS(phoneNumber) {
  const { supabase } = window;
  
  if (!phoneNumber) {
    console.error('❌ Please provide a phone number: testSendSMS("+1234567890")');
    return;
  }
  
  console.log(`\n📱 Sending test SMS to ${phoneNumber}...`);
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase.functions.invoke('telnyx-sms', {
      body: {
        recipientPhone: phoneNumber,
        message: `Test SMS from Fixlify at ${new Date().toLocaleString()}`,
        user_id: user?.id
      }
    });
    
    if (error) {
      console.error('❌ SMS send failed:', error);
    } else {
      console.log('✅ SMS sent successfully!');
      if (data) console.log('Response:', data);
    }
  } catch (err) {
    console.error('❌ Error:', err);
  }
}

// Test sending an email
async function testSendEmail(emailAddress) {
  const { supabase } = window;
  
  if (!emailAddress) {
    console.error('❌ Please provide an email: testSendEmail("test@example.com")');
    return;
  }
  
  console.log(`\n📧 Sending test email to ${emailAddress}...`);
  
  try {
    const { data, error } = await supabase.functions.invoke('mailgun-email', {
      body: {
        to: emailAddress,
        subject: 'Test Email from Fixlify',
        html: `<h1>Test Email</h1><p>This is a test email sent at ${new Date().toLocaleString()}</p>`,
        text: `Test email from Fixlify at ${new Date().toLocaleString()}`
      }
    });
    
    if (error) {
      console.error('❌ Email send failed:', error);
    } else {
      console.log('✅ Email sent successfully!');
      if (data) console.log('Response:', data);
    }
  } catch (err) {
    console.error('❌ Error:', err);
  }
}

// Check environment variables (secrets)
async function checkSecrets() {
  const { supabase } = window;
  
  console.log('\n🔐 Checking API Keys Configuration...\n');
  
  // Test Telnyx
  try {
    const { error: telnyxError } = await supabase.functions.invoke('telnyx-sms', {
      body: { test: true, checkConfig: true }
    });
    
    if (telnyxError?.message?.includes('TELNYX_API_KEY')) {
      console.error('❌ TELNYX_API_KEY not configured');
    } else {
      console.log('✅ TELNYX_API_KEY appears to be configured');
    }
  } catch (err) {}

  // Test Mailgun
  try {
    const { error: mailgunError } = await supabase.functions.invoke('mailgun-email', {
      body: { test: true, checkConfig: true }
    });
    
    if (mailgunError?.message?.includes('MAILGUN_API_KEY')) {
      console.error('❌ MAILGUN_API_KEY not configured');
    } else {
      console.log('✅ MAILGUN_API_KEY appears to be configured');
    }
  } catch (err) {}
}

// Main diagnostic function
async function runFullDiagnostics() {
  console.clear();
  console.log('🏥 FIXLIFY COMMUNICATION SYSTEM DIAGNOSTICS');
  console.log('==========================================\n');
  
  await checkSecrets();
  await testWebhooks();
  await checkPhoneNumbers();
  await checkRecentComms();
  
  console.log('\n📋 WEBHOOK URLs FOR CONFIGURATION:');
  console.log('=====================================');
  console.log('SMS Webhook:   https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/telnyx-webhook');
  console.log('Voice Webhook: https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/telnyx-voice-webhook');
  console.log('Email Webhook: https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/mailgun-webhook');
  
  console.log('\n🧪 AVAILABLE TEST FUNCTIONS:');
  console.log('============================');
  console.log('testSendSMS("+1234567890")     - Send a test SMS');
  console.log('testSendEmail("test@test.com") - Send a test email');
  console.log('checkPhoneNumbers()            - List all phone numbers');
  console.log('checkRecentComms()             - Show recent communications');
  console.log('testWebhooks()                 - Test all webhooks');
}

// Auto-run diagnostics
console.log('🚀 Fixlify Communication Test Suite Loaded!\n');
console.log('Run these commands:');
console.log('-------------------');
console.log('runFullDiagnostics()           - Run complete system check');
console.log('testWebhooks()                 - Test webhook endpoints');
console.log('checkPhoneNumbers()            - Check phone configuration');
console.log('testSendSMS("+1234567890")     - Send test SMS');
console.log('testSendEmail("you@email.com") - Send test email');
console.log('\nStarting diagnostics...\n');

// Run diagnostics automatically
runFullDiagnostics();

// FIXLIFY TEST SUITE - FIXED VERSION
// Copy and paste this entire script into console

(async function() {
  console.clear();
  console.log('🏥 FIXLIFY COMMUNICATION SYSTEM DIAGNOSTICS');
  console.log('==========================================\n');

  // Check API Keys
  console.log('🔐 Checking API Keys Configuration...\n');
  
  try {
    const { error: telnyxError } = await supabase.functions.invoke('telnyx-sms', {
      body: { test: true, checkConfig: true }
    });
    console.log(telnyxError?.message?.includes('TELNYX_API_KEY') 
      ? '❌ TELNYX_API_KEY not configured' 
      : '✅ TELNYX_API_KEY appears to be configured');
  } catch (err) {}

  try {
    const { error: mailgunError } = await supabase.functions.invoke('mailgun-email', {
      body: { test: true, checkConfig: true }
    });
    console.log(mailgunError?.message?.includes('MAILGUN_API_KEY') 
      ? '❌ MAILGUN_API_KEY not configured' 
      : '✅ MAILGUN_API_KEY appears to be configured');
  } catch (err) {}

  // Test Edge Functions
  console.log('\n📡 Testing Edge Function Status:\n');
  
  const functions = [
    'telnyx-webhook',
    'telnyx-voice-webhook',
    'mailgun-webhook',
    'telnyx-sms',
    'send-invoice',
    'send-estimate',
    'send-invoice-sms',
    'send-estimate-sms',
    'mailgun-email'
  ];

  for (const func of functions) {
    try {
      const { data, error } = await supabase.functions.invoke(func, {
        body: { test: true }
      });
      console.log(error ? `❌ ${func}: ${error.message}` : `✅ ${func}: Responding`);
    } catch (e) {
      console.log(`❌ ${func}: Failed - ${e.message}`);
    }
  }

  // Check Phone Numbers
  console.log('\n📞 Checking configured phone numbers...\n');
  
  try {
    const { data: phones, error } = await supabase
      .from('telnyx_phone_numbers')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (phones && phones.length > 0) {
      console.log('Phone Numbers in Database:');
      phones.forEach(phone => {
        console.log(`📱 ${phone.phone_number}`);
        console.log(`   Status: ${phone.status}`);
        console.log(`   User ID: ${phone.user_id || 'Unassigned'}`);
        console.log(`   Profile ID: ${phone.messaging_profile_id || 'Not set'}\n`);
      });
    } else {
      console.log('⚠️ No phone numbers found');
    }
  } catch (err) {
    console.error('❌ Error fetching phones:', err);
  }

  // Check Recent Communications
  console.log('📊 Checking Recent Communications...\n');
  
  const tables = [
    { name: 'communication_logs', label: 'General Logs' },
    { name: 'estimate_communications', label: 'Estimate Communications' },
    { name: 'invoice_communications', label: 'Invoice Communications' }
  ];

  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table.name)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3);
      
      if (data && data.length > 0) {
        console.log(`${table.label}:`);
        data.forEach(log => {
          const type = log.communication_type || 'unknown';
          const to = log.recipient || log.to || 'unknown';
          const status = log.status || 'unknown';
          const date = new Date(log.created_at).toLocaleString();
          console.log(`  - ${type} to ${to} - ${status} (${date})`);
        });
        console.log('');
      }
    } catch (err) {}
  }

  console.log('📋 WEBHOOK URLs FOR CONFIGURATION:');
  console.log('=====================================');
  console.log('SMS Webhook:   https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/telnyx-webhook');
  console.log('Voice Webhook: https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/telnyx-voice-webhook');
  console.log('Email Webhook: https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/mailgun-webhook');
  
  console.log('\n✅ Diagnostics Complete!');
  console.log('\n🧪 TEST FUNCTIONS AVAILABLE:');
  console.log('============================');
  console.log('testSMS("+1234567890")         - Send a test SMS');
  console.log('testEmail("test@example.com")  - Send a test email');
  console.log('testInvoice()                  - Test invoice sending');
  console.log('testEstimate()                 - Test estimate sending');
})();

// Test SMS Function
window.testSMS = async function(phoneNumber) {
  if (!phoneNumber) {
    console.error('Please provide a phone number: testSMS("+1234567890")');
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
      console.error('❌ SMS failed:', error.message);
    } else {
      console.log('✅ SMS sent successfully!');
      if (data) console.log('Response:', data);
    }
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
};

// Test Email Function
window.testEmail = async function(emailAddress) {
  if (!emailAddress) {
    console.error('Please provide an email: testEmail("test@example.com")');
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
      console.error('❌ Email failed:', error.message);
    } else {
      console.log('✅ Email sent successfully!');
      if (data) console.log('Response:', data);
    }
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
};

// Test Invoice Sending
window.testInvoice = async function() {
  console.log('\n📄 Testing invoice send functionality...');
  
  try {
    // Get a recent invoice
    const { data: invoices, error } = await supabase
      .from('invoices')
      .select('*, clients!inner(*)')
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (error || !invoices || invoices.length === 0) {
      console.error('❌ No invoices found to test with');
      return;
    }
    
    const invoice = invoices[0];
    const client = invoice.clients;
    
    console.log(`Found invoice #${invoice.invoice_number} for ${client.name}`);
    
    if (client.email) {
      console.log(`Testing email to ${client.email}...`);
      const { error: emailError } = await supabase.functions.invoke('send-invoice', {
        body: {
          invoiceId: invoice.id,
          sendToClient: true,
          customMessage: 'This is a test from the diagnostic tool'
        }
      });
      
      console.log(emailError ? `❌ Email failed: ${emailError.message}` : '✅ Invoice email sent!');
    }
    
    if (client.phone) {
      console.log(`Testing SMS to ${client.phone}...`);
      const { error: smsError } = await supabase.functions.invoke('send-invoice-sms', {
        body: {
          invoiceId: invoice.id,
          recipientPhone: client.phone,
          customMessage: 'Test SMS'
        }
      });
      
      console.log(smsError ? `❌ SMS failed: ${smsError.message}` : '✅ Invoice SMS sent!');
    }
  } catch (err) {
    console.error('❌ Test failed:', err.message);
  }
};

// Test Estimate Sending
window.testEstimate = async function() {
  console.log('\n📋 Testing estimate send functionality...');
  
  try {
    // Get a recent estimate
    const { data: estimates, error } = await supabase
      .from('estimates')
      .select('*, clients!inner(*)')
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (error || !estimates || estimates.length === 0) {
      console.error('❌ No estimates found to test with');
      return;
    }
    
    const estimate = estimates[0];
    const client = estimate.clients;
    
    console.log(`Found estimate #${estimate.estimate_number} for ${client.name}`);
    
    if (client.email) {
      console.log(`Testing email to ${client.email}...`);
      const { error: emailError } = await supabase.functions.invoke('send-estimate', {
        body: {
          estimateId: estimate.id,
          sendToClient: true,
          customMessage: 'This is a test from the diagnostic tool'
        }
      });
      
      console.log(emailError ? `❌ Email failed: ${emailError.message}` : '✅ Estimate email sent!');
    }
    
    if (client.phone) {
      console.log(`Testing SMS to ${client.phone}...`);
      const { error: smsError } = await supabase.functions.invoke('send-estimate-sms', {
        body: {
          estimateId: estimate.id,
          recipientPhone: client.phone,
          customMessage: 'Test SMS'
        }
      });
      
      console.log(smsError ? `❌ SMS failed: ${smsError.message}` : '✅ Estimate SMS sent!');
    }
  } catch (err) {
    console.error('❌ Test failed:', err.message);
  }
};

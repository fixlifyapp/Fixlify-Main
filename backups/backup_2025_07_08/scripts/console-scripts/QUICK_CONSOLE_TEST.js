// QUICK TEST - Copy this entire block and paste in console

// 1. Test all webhooks
async function testWebhooks() {
  console.log('Testing webhooks...');
  const functions = ['telnyx-webhook', 'telnyx-sms', 'mailgun-email', 'send-invoice', 'send-estimate'];
  for (const func of functions) {
    try {
      const { error } = await supabase.functions.invoke(func, { body: { test: true } });
      console.log(error ? `❌ ${func}: ${error.message}` : `✅ ${func}: OK`);
    } catch (e) {
      console.log(`❌ ${func}: Failed`);
    }
  }
}

// 2. Check phone numbers
async function checkPhoneNumbers() {
  const { data, error } = await supabase.from('telnyx_phone_numbers').select('*');
  if (data) {
    console.log('\nPhone Numbers:');
    data.forEach(p => console.log(`${p.phone_number} - ${p.status} - User: ${p.user_id || 'None'}`));
  }
}

// 3. Quick SMS test
async function testSMS(phone) {
  console.log(`Sending SMS to ${phone}...`);
  const { error } = await supabase.functions.invoke('telnyx-sms', {
    body: { recipientPhone: phone, message: 'Test from Fixlify' }
  });
  console.log(error ? `❌ Failed: ${error.message}` : '✅ SMS sent!');
}

// 4. Quick Email test  
async function testEmail(email) {
  console.log(`Sending email to ${email}...`);
  const { error } = await supabase.functions.invoke('mailgun-email', {
    body: { to: email, subject: 'Test', html: '<p>Test email from Fixlify</p>' }
  });
  console.log(error ? `❌ Failed: ${error.message}` : '✅ Email sent!');
}

// Run tests
console.log('🧪 Running tests...\n');
await testWebhooks();
await checkPhoneNumbers();
console.log('\n📝 To test SMS: testSMS("+1234567890")');
console.log('📝 To test Email: testEmail("test@example.com")');

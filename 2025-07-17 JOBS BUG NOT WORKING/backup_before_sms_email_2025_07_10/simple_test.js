// Simple Email/SMS Test Script
console.clear();
console.log('🔍 Testing Email & SMS Functions...\n');

// Test 1: Simple Mailgun test
console.log('📧 Test 1: Mailgun Email');
supabase.functions.invoke('mailgun-email', {
  body: {
    to: 'test@example.com',
    subject: 'Test Email',
    text: 'This is a test email',
    html: '<p>This is a test email</p>'
  }
}).then(result => {
  if (result.error) {
    console.error('❌ Mailgun failed:', result.error.message);
    console.log('Full error:', result.error);
  } else {
    console.log('✅ Mailgun success:', result.data);
  }
}).catch(err => {
  console.error('❌ Mailgun error:', err);
});

// Test 2: Get user and test with user ID
supabase.auth.getUser().then(({ data: { user } }) => {
  if (!user) {
    console.error('❌ Not logged in');
    return;
  }
  
  console.log('\n👤 User:', user.email);
  
  // Test 3: Mailgun with user ID
  console.log('\n📧 Test 2: Mailgun with User ID');
  supabase.functions.invoke('mailgun-email', {
    body: {
      to: 'test@example.com',
      subject: 'Test with User',
      text: 'Test email with user ID',
      userId: user.id
    }
  }).then(result => {
    if (result.error) {
      console.error('❌ Failed:', result.error.message);
    } else {
      console.log('✅ Success:', result.data);
    }
  });
  
  // Test 4: Check estimates
  console.log('\n📋 Test 3: Checking Estimates');
  supabase
    .from('estimates')
    .select('id, estimate_number, clients(name, email)')
    .eq('user_id', user.id)
    .limit(3)
    .then(({ data, error }) => {
      if (error) {
        console.error('❌ Error:', error);
      } else {
        console.log('Found estimates:', data);
        
        // If we have an estimate with client email, test sending
        const estimateWithEmail = data?.find(e => e.clients?.email);
        if (estimateWithEmail) {
          console.log('\n📨 Test 4: Sending estimate', estimateWithEmail.estimate_number);
          supabase.functions.invoke('send-estimate', {
            body: {
              estimateId: estimateWithEmail.id,
              sendToClient: true,
              customMessage: 'Test from console'
            }
          }).then(result => {
            if (result.error) {
              console.error('❌ Send failed:', result.error.message);
            } else {
              console.log('✅ Sent:', result.data);
            }
          });
        } else {
          console.log('⚠️  No estimates with client emails found');
        }
      }
    });
});

// Test 5: SMS test
console.log('\n📱 Test 5: SMS Notification');
supabase.functions.invoke('notifications', {
  body: {
    type: 'custom',
    phoneNumber: '+1234567890',
    data: { message: 'Test SMS' },
    isTest: true,
    message: 'Test SMS from console'
  }
}).then(result => {
  if (result.error) {
    console.error('❌ SMS failed:', result.error.message);
  } else {
    console.log('✅ SMS success:', result.data);
  }
});

console.log('\n⏳ Tests running... Check results above');
console.log('\n💡 Also check Supabase logs for server errors:');
console.log('https://supabase.com/dashboard/project/mqppvcrlvsgrsqelglod/logs/edge-functions');

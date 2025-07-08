// DEBUG AND FIX SCRIPT
// Copy and paste this to check what's wrong

(async function() {
  console.clear();
  console.log('🔧 DEBUGGING FIXLIFY COMMUNICATION ISSUES');
  console.log('=========================================\n');

  // 1. Check your current user
  console.log('1️⃣ Checking current user...');
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError) {
    console.error('❌ User error:', userError);
  } else {
    console.log('✅ Logged in as:', user.email);
    console.log('   User ID:', user.id);
  }

  // 2. Check phone numbers assigned to user
  console.log('\n2️⃣ Checking phone numbers for this user...');
  try {
    const { data: phones, error } = await supabase
      .from('telnyx_phone_numbers')
      .select('*')
      .eq('user_id', user?.id);
    
    if (phones && phones.length > 0) {
      console.log('✅ Found phone numbers:');
      phones.forEach(p => {
        console.log(`   ${p.phone_number} - Status: ${p.status}`);
        console.log(`   Messaging Profile: ${p.messaging_profile_id || 'NOT SET'}`);
      });
    } else {
      console.log('❌ No phone numbers assigned to your user ID');
      console.log('   This is why SMS is failing!');
    }
  } catch (err) {
    console.error('❌ Error checking phones:', err);
  }

  // 3. Test with a simple direct call
  console.log('\n3️⃣ Testing edge functions with proper auth...');
  
  // Test mailgun-email with minimal payload
  try {
    console.log('Testing mailgun-email...');
    const { data, error } = await supabase.functions.invoke('mailgun-email', {
      body: {
        to: 'boomymarketing.com@gmail.com',
        subject: 'Test from Debug Script',
        text: 'If you receive this, email is working!',
        html: '<p>If you receive this, email is working!</p>'
      }
    });
    
    if (error) {
      console.error('❌ Mailgun error:', error.message);
      if (error.message.includes('non-2xx')) {
        console.log('   This usually means the API key is invalid or not set');
      }
    } else {
      console.log('✅ Mailgun response:', data);
    }
  } catch (err) {
    console.error('❌ Mailgun exception:', err);
  }

  // 4. Check if we need to update secrets
  console.log('\n4️⃣ API Key Status:');
  console.log('If the above tests failed, you need to:');
  console.log('1. Run: supabase secrets set TELNYX_API_KEY=your_key_here');
  console.log('2. Run: supabase secrets set MAILGUN_API_KEY=your_key_here');
  console.log('3. Make sure the keys are valid and active');

  // 5. Phone assignment fix
  console.log('\n5️⃣ To fix SMS sending:');
  console.log('The phone number +1234567890 needs to be assigned to your user.');
  console.log('Run this to assign it:');
  console.log(`
await supabase
  .from('telnyx_phone_numbers')
  .update({ user_id: '${user?.id}' })
  .eq('phone_number', '+1234567890');
  `);

  // 6. Check webhook configuration
  console.log('\n6️⃣ Webhook Configuration:');
  console.log('The CORS errors suggest webhooks aren\'t configured in Telnyx/Mailgun.');
  console.log('Configure these URLs in your service dashboards:');
  console.log('Telnyx SMS: https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/telnyx-webhook');
  console.log('Mailgun: https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/mailgun-webhook');

})();

// Function to assign phone to current user
window.assignPhoneToMe = async function(phoneNumber) {
  const { data: { user } } = await supabase.auth.getUser();
  
  console.log(`\nAssigning ${phoneNumber} to user ${user.email}...`);
  
  const { data, error } = await supabase
    .from('telnyx_phone_numbers')
    .update({ 
      user_id: user.id,
      status: 'active'
    })
    .eq('phone_number', phoneNumber);
  
  if (error) {
    console.error('❌ Failed:', error);
  } else {
    console.log('✅ Phone assigned successfully!');
  }
};

// Function to check secrets (requires admin)
window.checkSecrets = async function() {
  console.log('\n🔐 Checking if secrets are set...');
  
  // Try to call functions that require API keys
  const tests = [
    { name: 'TELNYX_API_KEY', func: 'telnyx-sms', body: { test: true } },
    { name: 'MAILGUN_API_KEY', func: 'mailgun-email', body: { test: true } }
  ];
  
  for (const test of tests) {
    try {
      const { error } = await supabase.functions.invoke(test.func, { body: test.body });
      if (error?.message?.includes('API_KEY') || error?.message?.includes('not configured')) {
        console.error(`❌ ${test.name} is NOT set or invalid`);
      } else if (error?.message?.includes('401') || error?.message?.includes('Unauthorized')) {
        console.error(`❌ ${test.name} is invalid or expired`);
      } else {
        console.log(`✅ ${test.name} appears to be set`);
      }
    } catch (err) {
      console.error(`❌ ${test.name} check failed:`, err.message);
    }
  }
};

// Auto-run checks
checkSecrets();

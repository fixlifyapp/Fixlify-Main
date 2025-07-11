// DEBUG API KEY ISSUES
// Copy and paste this to check what's wrong

(async function() {
  console.clear();
  console.log('🔍 DEBUGGING API KEY ISSUES');
  console.log('===========================\n');

  // 1. Check if we can access the functions at all
  console.log('1️⃣ Testing basic function access...');
  try {
    const response = await fetch('https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/mailgun-email', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabase.supabaseKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ test: true })
    });
    
    const text = await response.text();
    console.log('Raw response:', response.status, text);
    
    if (response.status === 500) {
      console.log('❌ 500 Error - Function is crashing internally');
      console.log('   Likely causes:');
      console.log('   - API key format is wrong');
      console.log('   - API key is for wrong region/domain');
      console.log('   - Missing required environment variables');
    }
  } catch (e) {
    console.error('Network error:', e);
  }

  // 2. Test with minimal valid payload
  console.log('\n2️⃣ Testing with minimal valid email...');
  try {
    const result = await supabase.functions.invoke('mailgun-email', {
      body: {
        to: 'test@example.com',
        subject: 'Test',
        text: 'Test message'
      }
    });
    
    console.log('Result:', result);
    
    if (result.error?.message?.includes('timeout')) {
      console.log('❌ Function is timing out - likely waiting for API response');
    }
  } catch (e) {
    console.error('Error:', e);
  }

  // 3. Check your Mailgun configuration
  console.log('\n3️⃣ Mailgun Configuration Check:');
  console.log('Make sure your Mailgun API key is:');
  console.log('1. For the US region (not EU)');
  console.log('2. For the domain: mg.fixlify.com');
  console.log('3. Has sending permissions');
  console.log('4. Starts with "key-" or is a private API key');
  
  // 4. Check Telnyx configuration
  console.log('\n4️⃣ Telnyx Configuration Check:');
  console.log('Make sure your Telnyx API key:');
  console.log('1. Is a V2 API key (starts with "KEY")');
  console.log('2. Has SMS permissions enabled');
  console.log('3. Is not a test mode key');
  
  // 5. View function URLs
  console.log('\n5️⃣ Edge Function URLs:');
  console.log('Mailgun: https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/mailgun-email');
  console.log('Telnyx: https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/telnyx-sms');
  
  console.log('\n6️⃣ To view function logs:');
  console.log('Go to: https://supabase.com/dashboard/project/mqppvcrlvsgrsqelglod/functions');
  console.log('Click on a function name to see its logs');
  
  // 7. Test if secrets are actually set
  console.log('\n7️⃣ Verifying secrets are set...');
  console.log('Run this in terminal to check:');
  console.log('supabase secrets list --project-ref mqppvcrlvsgrsqelglod');
})();

// Open Supabase function logs
window.openFunctionLogs = function() {
  window.open('https://supabase.com/dashboard/project/mqppvcrlvsgrsqelglod/functions', '_blank');
};

console.log('\n💡 Run openFunctionLogs() to see detailed error logs');

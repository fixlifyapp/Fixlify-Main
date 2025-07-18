// Test script to check email/SMS configuration
// Run this in the browser console

async function checkEmailConfiguration() {
  console.log('🔍 Checking email/SMS configuration...');
  
  try {
    // Get the auth token
    const authToken = localStorage.getItem('fixlify-auth-token');
    if (!authToken) {
      console.error('❌ No auth token found. Please log in.');
      return;
    }
    
    const token = JSON.parse(authToken);
    
    // Call the check-email-config function
    const response = await fetch('https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/check-email-config', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token.access_token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const result = await response.json();
    
    console.log('📧 Email/SMS Configuration Status:');
    console.log('================================');
    
    if (result.configuration) {
      console.log('📨 Mailgun (Email):', result.configuration.mailgun.configured ? '✅ Configured' : '❌ NOT CONFIGURED');
      if (result.configuration.mailgun.configured) {
        console.log('   - Key prefix:', result.configuration.mailgun.keyPrefix);
      }
      
      console.log('📱 Telnyx (SMS):', result.configuration.telnyx.configured ? '✅ Configured' : '❌ NOT CONFIGURED');
      if (result.configuration.telnyx.configured) {
        console.log('   - Key prefix:', result.configuration.telnyx.keyPrefix);
      }
      
      if (result.recommendations && result.recommendations.length > 0) {
        console.log('\n⚠️ Recommendations:');
        result.recommendations.forEach(rec => console.log('   -', rec));
      }
      
      console.log('\n📋 Available Environment Variables:', result.configuration.availableEnvVars);
    } else {
      console.error('❌ Failed to get configuration:', result);
    }
    
  } catch (error) {
    console.error('❌ Error checking configuration:', error);
  }
}

// Run the check
checkEmailConfiguration();

console.log(`
📌 Next Steps:
1. If Mailgun is NOT CONFIGURED, you need to set MAILGUN_API_KEY in Supabase
2. If Telnyx is NOT CONFIGURED, you need to set TELNYX_API_KEY in Supabase
3. Go to https://supabase.com/dashboard/project/mqppvcrlvsgrsqelglod/functions/secrets
4. Add the missing API keys
5. Refresh this page and try sending an estimate again
`);

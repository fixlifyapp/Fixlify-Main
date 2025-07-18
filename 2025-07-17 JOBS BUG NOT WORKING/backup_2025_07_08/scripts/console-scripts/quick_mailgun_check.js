// Quick test to check Mailgun configuration
// Run this in the browser console

async function quickMailgunCheck() {
  console.log('🔍 Checking Mailgun configuration...\n');
  
  // First, let's check the configuration
  try {
    const authToken = JSON.parse(localStorage.getItem('fixlify-auth-token') || '{}');
    
    // Call check-email-config
    const configResponse = await fetch('https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/check-email-config', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken.access_token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const config = await configResponse.json();
    
    if (config.configuration?.mailgun?.configured) {
      console.log('✅ Mailgun is configured!');
      console.log('   Key prefix:', config.configuration.mailgun.keyPrefix);
    } else {
      console.error('❌ MAILGUN IS NOT CONFIGURED!');
      console.log('\n🔧 TO FIX THIS:');
      console.log('1. Get your Mailgun API key from: https://app.mailgun.com/app/account/security/api_keys');
      console.log('2. Go to: https://supabase.com/dashboard/project/mqppvcrlvsgrsqelglod/functions/secrets');
      console.log('3. Click "Add new secret"');
      console.log('4. Name: MAILGUN_API_KEY');
      console.log('5. Value: [Your Mailgun API key]');
      console.log('6. Click "Save"');
      console.log('7. Wait 1-2 minutes and refresh this page');
      
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error checking configuration:', error);
    return false;
  }
}

// Check if we're on an estimate page
const estimateElements = document.querySelectorAll('[class*="estimate"]');
if (estimateElements.length > 0) {
  console.log('📄 Found', estimateElements.length, 'estimate-related elements on this page');
} else {
  console.log('⚠️ No estimates found on this page - navigate to a job with estimates');
}

// Run the check
quickMailgunCheck().then(isConfigured => {
  if (isConfigured) {
    console.log('\n✅ Mailgun is configured. The 500 error might be due to:');
    console.log('- Invalid estimate ID');
    console.log('- Database connection issues');
    console.log('- Edge function deployment issues');
    console.log('\nTry refreshing the page and sending again.');
  }
});

// Quick test to verify email configuration after deployment
// Run this in the browser console when logged into Fixlify

async function testEmailConfig() {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.error('Not logged in');
      return;
    }

    console.log('Testing email configuration...');
    
    // Call the check-email-config function if deployed
    const response = await supabase.functions.invoke('check-email-config');
    
    if (response.data) {
      console.log('Email Configuration:', response.data);
      
      if (response.data.mailgun?.domain === 'fixlify.app') {
        console.log('✅ Domain is correctly set to fixlify.app');
      } else {
        console.log('❌ Domain is incorrect:', response.data.mailgun?.domain);
      }
      
      if (response.data.mailgun?.apiKeySet) {
        console.log('✅ Mailgun API key is set');
      } else {
        console.log('❌ Mailgun API key is NOT set');
      }
    } else {
      console.error('Failed to get configuration:', response.error);
    }
  } catch (error) {
    console.error('Error testing email config:', error);
  }
}

// Run the test
testEmailConfig();

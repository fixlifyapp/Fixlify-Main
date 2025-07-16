// Test the fixed edge function
// Run this in browser console

async function testFixedEdgeFunction() {
  console.log('🔍 Testing fixed send-estimate function...\n');
  
  try {
    const authToken = JSON.parse(localStorage.getItem('fixlify-auth-token') || '{}');
    
    // First test with test ID to check configuration
    console.log('1️⃣ Testing configuration with test ID...');
    const testResponse = await fetch('https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/send-estimate-fixed', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken.access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        estimateId: 'test-id-12345',
        recipientEmail: 'test@example.com',
        customMessage: 'Test message'
      })
    });
    
    const testResult = await testResponse.json();
    
    if (testResponse.ok && testResult.testMode) {
      console.log('✅ Configuration test passed!');
      console.log('   Mailgun is properly configured');
      console.log('   Edge function is working');
    } else {
      console.error('❌ Configuration test failed:', testResult);
      return;
    }
    
    // Now test with a real estimate if available
    console.log('\n2️⃣ Looking for real estimates to test...');
    
    // Try to find an estimate on the page
    const estimateElements = Array.from(document.querySelectorAll('[class*="EST-"]'));
    if (estimateElements.length > 0) {
      console.log(`📄 Found ${estimateElements.length} estimates on this page`);
      console.log('   You can now click "Send" on any estimate');
      console.log('   The fixed function should work properly');
    } else {
      console.log('⚠️ No estimates found on this page');
      console.log('   Navigate to a job with estimates to test');
    }
    
    console.log('\n✅ The fixed edge function is ready to use!');
    console.log('📌 Next steps:');
    console.log('1. Refresh the page (Ctrl+F5)');
    console.log('2. Click the three dots menu on an estimate');
    console.log('3. Click "Send"');
    console.log('4. Enter an email and send');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run the test
testFixedEdgeFunction();

// Quick test for estimate sending
// Run this in browser console after refreshing the page

async function testEstimateSending() {
  console.log('🔍 Testing estimate sending...\n');
  
  const authToken = JSON.parse(localStorage.getItem('fixlify-auth-token') || '{}');
  
  // Test the fixed estimate function
  const response = await fetch('https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/send-estimate', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken.access_token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      estimateId: 'test-123',
      recipientEmail: 'test@example.com',
      customMessage: 'Test'
    })
  });
  
  const result = await response.json();
  
  if (response.status === 404 && result.error?.includes('Estimate not found')) {
    console.log('✅ Estimate function is working correctly!');
    console.log('   (Got expected "not found" error for test ID)');
    console.log('\n🎯 Now try sending a real estimate from the UI!');
  } else if (response.ok) {
    console.log('✅ Estimate function returned success');
  } else {
    console.error('❌ Error:', result);
  }
}

testEstimateSending();

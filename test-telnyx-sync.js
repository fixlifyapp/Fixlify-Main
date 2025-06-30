// Quick Test Script to Check Telnyx Numbers
// Run this in your browser console when logged into your app

async function testTelnyxSync() {
  try {
    console.log('🔍 Fetching numbers from Telnyx...');
    
    const response = await fetch('https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/telnyx-phone-numbers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('fixlify-auth-token')?.replace(/['"]/g, '')}`,
      },
      body: JSON.stringify({ action: 'list_available_from_telnyx' })
    });

    const data = await response.json();
    console.log('✅ Response:', data);
    
    if (data.success) {
      console.log(`Found ${data.total} numbers:`);
      data.available_numbers.forEach(num => {
        console.log(`📞 ${num.phone_number} - Status: ${num.status}`);
      });
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run the test
testTelnyxSync();
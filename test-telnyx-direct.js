// Simple test to check your Telnyx account
// This bypasses edge functions and tests directly from browser

async function checkTelnyxDirect() {
  console.log('🔍 Checking your Telnyx account directly...\n');
  
  const TELNYX_API_KEY = 'KEY01973792571E803B1EF8E470CD832D49';
  
  try {
    // Create a proxy URL to avoid CORS
    const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
    const telnyxUrl = 'https://api.telnyx.com/v2/phone_numbers';
    
    console.log('⚠️ Note: If this fails, you may need to:');
    console.log('1. Visit https://cors-anywhere.herokuapp.com/corsdemo');
    console.log('2. Click "Request temporary access"\n');
    
    const response = await fetch(proxyUrl + telnyxUrl, {
      headers: {
        'Authorization': `Bearer ${TELNYX_API_KEY}`,
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      }
    });

    if (!response.ok) {
      // Try without proxy
      console.log('Proxy failed, trying direct connection...');
      const directResponse = await fetch(telnyxUrl, {
        headers: {
          'Authorization': `Bearer ${TELNYX_API_KEY}`,
          'Accept': 'application/json'
        },
        mode: 'no-cors' // This will limit response but might work
      });
      
      console.log('Direct request sent. Check Network tab for response.');
      return;
    }

    const data = await response.json();
    const numbers = data.data || [];
    
    console.log(`✅ Found ${numbers.length} phone numbers in your Telnyx account:\n`);
    
    numbers.forEach((num, i) => {
      console.log(`${i + 1}. ${num.phone_number}`);
      console.log(`   Status: ${num.status}`);
      console.log(`   Created: ${new Date(num.created_at).toLocaleDateString()}`);
      console.log('');
    });
    
    return numbers;
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n💡 Try this instead:');
    console.log('1. Open https://portal.telnyx.com in a new tab');
    console.log('2. Go to Numbers → Phone Numbers');
    console.log('3. You\'ll see all your numbers there');
  }
}

// Alternative: Check what's in your database
async function checkDatabaseNumbers() {
  console.log('\n📊 Checking numbers in your database...\n');
  
  const { supabase } = await import('@/integrations/supabase/client');
  
  const { data, error } = await supabase
    .from('telnyx_phone_numbers')
    .select('*')
    .order('phone_number');
    
  if (error) {
    console.error('Database error:', error);
    return;
  }
  
  console.log(`Found ${data.length} numbers in database:\n`);
  
  data.forEach((num, i) => {
    console.log(`${i + 1}. ${num.phone_number}`);
    console.log(`   Status: ${num.status}`);
    console.log(`   User ID: ${num.user_id || 'Not assigned'}`);
    console.log(`   Area Code: ${num.area_code}`);
    console.log('');
  });
}

// Run both checks
console.log('=== TELNYX ACCOUNT CHECK ===\n');
checkTelnyxDirect().then(() => {
  checkDatabaseNumbers();
});
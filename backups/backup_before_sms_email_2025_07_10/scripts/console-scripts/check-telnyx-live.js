// Script to check Telnyx phone numbers directly from API
// Run this in the browser console to see your actual Telnyx numbers

async function checkTelnyxNumbers() {
  console.log('🔍 Checking Telnyx account for phone numbers...\n');
  
  const TELNYX_API_KEY = 'KEY01973792571E803B1EF8E470CD832D49';
  
  try {
    // Get phone numbers from Telnyx
    const response = await fetch('https://api.telnyx.com/v2/phone_numbers?page[size]=100', {
      headers: {
        'Authorization': `Bearer ${TELNYX_API_KEY}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      console.error('❌ Telnyx API Error:', response.status);
      const error = await response.text();
      console.error('Error details:', error);
      return;
    }

    const data = await response.json();
    const numbers = data.data || [];
    
    console.log(`✅ Found ${numbers.length} phone numbers in your Telnyx account:\n`);
    
    if (numbers.length === 0) {
      console.log('   No phone numbers found in your Telnyx account');
      return;
    }
    
    // Display each number with details
    numbers.forEach((number, index) => {
      console.log(`${index + 1}. ${number.phone_number}`);
      console.log(`   Status: ${number.status}`);
      console.log(`   Connection ID: ${number.connection_id || 'Not set'}`);
      console.log(`   Created: ${new Date(number.created_at).toLocaleDateString()}`);
      
      if (number.messaging_profile_id) {
        console.log(`   Messaging Profile: ${number.messaging_profile_id}`);
      }
      
      if (number.tags && number.tags.length > 0) {
        console.log(`   Tags: ${number.tags.join(', ')}`);
      }
      
      console.log('');
    });
    
    // Check which ones are in database
    console.log('📊 Checking database status...\n');
    const { supabase } = await import('@/integrations/supabase/client');
    
    const { data: dbNumbers } = await supabase
      .from('telnyx_phone_numbers')
      .select('phone_number, user_id, status');
      
    const dbNumbersMap = new Map(dbNumbers?.map(n => [n.phone_number, n]) || []);
    
    console.log('📱 Summary:');
    numbers.forEach(number => {
      const dbStatus = dbNumbersMap.get(number.phone_number);
      if (!dbStatus) {
        console.log(`❗ ${number.phone_number} - NOT in database (needs sync)`);
      } else if (!dbStatus.user_id) {
        console.log(`✅ ${number.phone_number} - Available to claim`);
      } else {
        console.log(`👤 ${number.phone_number} - Assigned to user`);
      }
    });
    
    return numbers;
  } catch (error) {
    console.error('❌ Error checking Telnyx:', error);
  }
}

// Also check messaging profiles
async function checkMessagingProfiles() {
  console.log('\n📨 Checking Messaging Profiles...\n');
  
  const TELNYX_API_KEY = 'KEY01973792571E803B1EF8E470CD832D49';
  
  try {
    const response = await fetch('https://api.telnyx.com/v2/messaging_profiles', {
      headers: {
        'Authorization': `Bearer ${TELNYX_API_KEY}`,
        'Accept': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      if (data.data && data.data.length > 0) {
        console.log(`Found ${data.data.length} messaging profiles:`);
        data.data.forEach(profile => {
          console.log(`- ${profile.name} (ID: ${profile.id})`);
        });
      } else {
        console.log('No messaging profiles found');
      }
    }
  } catch (error) {
    console.error('Error checking messaging profiles:', error);
  }
}

// Run both checks
(async () => {
  await checkTelnyxNumbers();
  await checkMessagingProfiles();
})();
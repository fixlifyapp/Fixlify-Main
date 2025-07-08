// Automated Telnyx Setup Script
// This script will help you set up Telnyx API key and test the sync

console.log('🚀 Starting automated Telnyx setup...\n');

// Step 1: Check if we have a Telnyx API key stored locally
let telnyxApiKey = localStorage.getItem('telnyx_api_key_temp');

if (!telnyxApiKey) {
  console.log('📋 STEP 1: We need your Telnyx API key');
  console.log('Please follow these steps:\n');
  console.log('1. Open a new tab and go to: https://portal.telnyx.com/#/app/account/api-keys');
  console.log('2. Log in to your Telnyx account');
  console.log('3. Copy your API key (it starts with "KEY...")');
  console.log('4. Come back here and run this command:\n');
  console.log('setTelnyxKey("YOUR_API_KEY_HERE")');
  console.log('\nExample: setTelnyxKey("KEY0123456789...")');
  
  // Create the helper function
  window.setTelnyxKey = function(apiKey) {
    if (!apiKey || !apiKey.startsWith('KEY')) {
      console.error('❌ Invalid API key. It should start with "KEY"');
      return;
    }
    localStorage.setItem('telnyx_api_key_temp', apiKey);
    console.log('✅ API key saved temporarily. Now run the setup script again!');
    console.log('Just refresh the page and the script will continue automatically.');
  };
} else {
  console.log('✅ Found Telnyx API key in temporary storage\n');
  
  // Step 2: Set up the API key in Supabase
  console.log('📋 STEP 2: Setting up API key in Supabase...');
  
  async function setupTelnyxInSupabase() {
    try {
      // First, let's test if the key works
      console.log('🔍 Testing your Telnyx API key...');
      
      const testResponse = await fetch('https://api.telnyx.com/v2/phone_numbers?page[size]=1', {
        headers: {
          'Authorization': `Bearer ${telnyxApiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!testResponse.ok) {
        throw new Error('Invalid Telnyx API key. Please check and try again.');
      }
      
      console.log('✅ Telnyx API key is valid!\n');
      
      // Get the phone numbers from Telnyx
      console.log('📱 Fetching your Telnyx phone numbers...');
      const numbersResponse = await fetch('https://api.telnyx.com/v2/phone_numbers?page[size]=100', {
        headers: {
          'Authorization': `Bearer ${telnyxApiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      const numbersData = await numbersResponse.json();
      const telnyxNumbers = numbersData.data || [];
      
      console.log(`✅ Found ${telnyxNumbers.length} phone numbers in your Telnyx account\n`);
      
      if (telnyxNumbers.length > 0) {
        console.log('Your Telnyx phone numbers:');
        telnyxNumbers.forEach(num => {
          console.log(`  📞 ${num.phone_number}`);
        });
        console.log('');
      }
      
      // Now add these numbers to Supabase database
      console.log('💾 Adding phone numbers to your Fixlify database...\n');
      
      const authToken = localStorage.getItem('fixlify-auth-token')?.replace(/['"]/g, '');
      if (!authToken) {
        throw new Error('You need to be logged in to Fixlify first!');
      }
      
      let addedCount = 0;
      let errorCount = 0;
      
      for (const telnyxNum of telnyxNumbers) {
        try {
          const response = await fetch('https://mqppvcrlvsgrsqelglod.supabase.co/rest/v1/telnyx_phone_numbers', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xcHB2Y3JsdnNncnNxZWxnbG9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1OTE3MDUsImV4cCI6MjA2MzE2NzcwNX0.My-KiqG1bCMqzUru4m59d4v18N3WGxNoNtFPOFAmhzg',
              'Authorization': `Bearer ${authToken}`,
              'Prefer': 'resolution=merge-duplicates'
            },
            body: JSON.stringify({
              phone_number: telnyxNum.phone_number,
              telnyx_phone_number_id: telnyxNum.id,
              status: 'available',
              country_code: telnyxNum.country_code || 'US',
              area_code: telnyxNum.phone_number.substring(2, 5),
              locality: telnyxNum.region_information?.locality,
              region: telnyxNum.region_information?.region,
              features: ['sms', 'voice', 'mms'],
              connection_id: telnyxNum.connection_id,
              messaging_profile_id: telnyxNum.messaging_profile_id,
              monthly_cost: 0,
              setup_cost: 0,
              purchased_at: telnyxNum.created_at || new Date().toISOString()
            })
          });
          
          if (response.ok) {
            addedCount++;
            console.log(`✅ Added ${telnyxNum.phone_number}`);
          } else {
            errorCount++;
            const error = await response.text();
            if (error.includes('duplicate')) {
              console.log(`ℹ️ ${telnyxNum.phone_number} already exists (that's OK)`);
            } else {
              console.log(`⚠️ Could not add ${telnyxNum.phone_number}`);
            }
          }
        } catch (err) {
          errorCount++;
          console.log(`❌ Error adding ${telnyxNum.phone_number}:`, err.message);
        }
      }
      
      console.log(`\n📊 Summary: Added ${addedCount} numbers, ${errorCount} skipped or failed\n`);
      
      // Step 3: Save configuration instructions
      console.log('📋 FINAL STEP: Save your Telnyx configuration\n');
      console.log('⚠️ IMPORTANT: Your Telnyx API key needs to be saved in Supabase for SMS to work.\n');
      console.log('Unfortunately, I cannot directly access Supabase dashboard for security reasons.');
      console.log('But I\'ve created a quick guide for you:\n');
      console.log('1. Copy this API key:', telnyxApiKey);
      console.log('2. Open this link in a new tab: https://supabase.com/dashboard/project/mqppvcrlvsgrsqelglod/settings/vault');
      console.log('3. Click "New secret"');
      console.log('4. Name: TELNYX_API_KEY');
      console.log('5. Value: Paste your API key');
      console.log('6. Click "Save"\n');
      console.log('That\'s it! Your phone numbers are ready to use for SMS! 🎉\n');
      
      // Offer to claim a number
      if (telnyxNumbers.length > 0) {
        console.log('💡 Would you like to claim one of these numbers for your account?');
        console.log('Run this command with the phone number you want:');
        console.log(`claimNumber("${telnyxNumbers[0].phone_number}")`);
        
        window.claimNumber = async function(phoneNumber) {
          try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
              console.error('❌ You need to be logged in');
              return;
            }
            
            const { error } = await supabase
              .from('telnyx_phone_numbers')
              .update({ 
                user_id: user.id, 
                status: 'active' 
              })
              .eq('phone_number', phoneNumber)
              .is('user_id', null);
              
            if (error) {
              console.error('❌ Error claiming number:', error.message);
            } else {
              console.log(`✅ Successfully claimed ${phoneNumber} for your account!`);
              console.log('You can now send SMS from this number! 📱');
            }
          } catch (err) {
            console.error('❌ Error:', err.message);
          }
        };
      }
      
      // Clean up temporary storage
      console.log('\n🧹 Cleaning up temporary data...');
      localStorage.removeItem('telnyx_api_key_temp');
      console.log('✅ Setup complete!\n');
      
      // Refresh the page if on phone management
      if (window.location.pathname.includes('phone')) {
        console.log('🔄 Refreshing page to show your numbers...');
        setTimeout(() => window.location.reload(), 2000);
      }
      
    } catch (error) {
      console.error('❌ Setup failed:', error.message);
      console.log('\nPlease check your API key and try again.');
      console.log('To reset and start over, run: localStorage.removeItem("telnyx_api_key_temp")');
    }
  }
  
  // Run the setup
  setupTelnyxInSupabase();
}

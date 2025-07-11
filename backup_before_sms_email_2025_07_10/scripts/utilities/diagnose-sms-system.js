// RUN THIS SCRIPT IN YOUR BROWSER CONSOLE (F12)
// It will help diagnose why SMS is not working

console.log("🔍 Starting SMS System Diagnosis...\n");

// Function to check Telnyx configuration
async function checkTelnyxConfig() {
  try {
    const session = await window.supabase.auth.getSession();
    if (!session.data.session) {
      console.error("❌ Not logged in! Please log in first.");
      return;
    }

    console.log("1️⃣ Checking Telnyx API Key configuration...");
    
    const response = await fetch('https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/check-telnyx-key', {
      headers: {
        'Authorization': 'Bearer ' + session.data.session.access_token,
        'Content-Type': 'application/json'
      }
    });
    
    const result = await response.json();
    
    if (result.success) {
      if (result.telnyx_api_key.exists) {
        console.log("✅ Telnyx API Key is configured!");
        console.log(`   - Key length: ${result.telnyx_api_key.length} characters`);
        console.log(`   - Is test key: ${result.telnyx_api_key.isTestKey ? 'Yes (simulation mode)' : 'No (live mode)'}`);
      } else {
        console.error("❌ Telnyx API Key is NOT configured!");
        console.log("   👉 Go to: https://supabase.com/dashboard/project/mqppvcrlvsgrsqelglod/functions/secrets");
        console.log("   👉 Add: TELNYX_API_KEY = your_api_key_here");
      }
      
      console.log("\n📋 Other configuration:");
      console.log(`   - Messaging Profile ID: ${result.other_keys.messaging_profile_id ? '✅ Set' : '❌ Not set (optional)'}`);
      console.log(`   - Public Key: ${result.other_keys.public_key ? '✅ Set' : '❌ Not set (optional)'}`);
      console.log(`   - Connection ID: ${result.other_keys.connection_id ? '✅ Set' : '❌ Not set (optional)'}`);
    } else {
      console.error("❌ Failed to check configuration:", result.error);
    }
  } catch (error) {
    console.error("❌ Error checking Telnyx config:", error);
  }
}

// Function to check phone numbers
async function checkPhoneNumbers() {
  try {
    console.log("\n2️⃣ Checking phone numbers in database...");
    
    const { data: phoneNumbers, error } = await window.supabase
      .from('telnyx_phone_numbers')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("❌ Error fetching phone numbers:", error);
      return;
    }
    
    console.log(`   Found ${phoneNumbers.length} phone numbers:`);
    
    phoneNumbers.forEach((phone, index) => {
      const status = phone.status === 'active' ? '✅' : '⚠️';
      const assigned = phone.user_id ? `Assigned to: ${phone.user_id.substring(0, 8)}...` : '❌ Not assigned';
      console.log(`   ${index + 1}. ${phone.phone_number} - ${status} ${phone.status} - ${assigned}`);
    });
    
    const activeNumbers = phoneNumbers.filter(p => p.status === 'active' && p.user_id);
    if (activeNumbers.length === 0) {
      console.warn("\n⚠️ No active phone numbers assigned to users!");
      console.log("   👉 Run this SQL to assign a number to your user:");
      console.log(`   UPDATE telnyx_phone_numbers SET user_id = 'YOUR_USER_ID', status = 'active' WHERE phone_number = '${phoneNumbers[0]?.phone_number}';`);
    }
  } catch (error) {
    console.error("❌ Error checking phone numbers:", error);
  }
}

// Function to test SMS sending
async function testSendSMS(testPhone = '+1234567890') {
  try {
    console.log("\n3️⃣ Testing SMS sending functionality...");
    console.log(`   Sending test SMS to: ${testPhone}`);
    
    const session = await window.supabase.auth.getSession();
    const response = await fetch('https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/telnyx-sms', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + session.data.session.access_token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        recipientPhone: testPhone,
        message: 'Test SMS from Fixlify diagnostic tool',
        client_id: null,
        job_id: null
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log("✅ SMS test successful!");
      console.log(`   - Message ID: ${result.messageId}`);
      console.log(`   - From: ${result.from}`);
      console.log(`   - To: ${result.to}`);
    } else {
      console.error("❌ SMS test failed:", result.error);
      
      if (result.error.includes('No active phone number')) {
        console.log("\n💡 Solution: Assign a phone number to your user (see step 2 above)");
      } else if (result.error.includes('authentication')) {
        console.log("\n💡 Solution: Set TELNYX_API_KEY in Supabase secrets (see step 1 above)");
      }
    }
  } catch (error) {
    console.error("❌ Error testing SMS:", error);
  }
}

// Function to get current user info
async function getCurrentUser() {
  try {
    console.log("\n4️⃣ Getting current user information...");
    
    const { data: { user } } = await window.supabase.auth.getUser();
    if (user) {
      console.log(`   User ID: ${user.id}`);
      console.log(`   Email: ${user.email}`);
      console.log("\n   👉 Use this ID when assigning phone numbers in the database");
    } else {
      console.error("❌ No user logged in!");
    }
  } catch (error) {
    console.error("❌ Error getting user:", error);
  }
}

// Main diagnostic function
async function diagnoseSMS() {
  console.clear();
  console.log("🏥 SMS SYSTEM DIAGNOSTIC TOOL");
  console.log("==============================\n");
  
  await checkTelnyxConfig();
  await checkPhoneNumbers();
  await getCurrentUser();
  
  console.log("\n==============================");
  console.log("📋 SUMMARY & NEXT STEPS:");
  console.log("==============================");
  console.log("\n1. If Telnyx API Key is missing:");
  console.log("   - Get your key from https://portal.telnyx.com");
  console.log("   - Add it at https://supabase.com/dashboard/project/mqppvcrlvsgrsqelglod/functions/secrets");
  console.log("\n2. If no phone numbers are assigned:");
  console.log("   - Copy your User ID from above");
  console.log("   - Run the UPDATE SQL query shown above");
  console.log("\n3. To test SMS after fixing:");
  console.log("   - Run: testSendSMS('+1YOUR_PHONE_NUMBER')");
  console.log("\n4. Still having issues?");
  console.log("   - Check Edge Function logs for errors");
  console.log("   - Ensure your Telnyx account has SMS credit");
}

// Run the diagnostic
diagnoseSMS();

// Export test function for manual use
window.testSendSMS = testSendSMS;
console.log("\n💡 TIP: You can manually test SMS by running: testSendSMS('+1234567890')");

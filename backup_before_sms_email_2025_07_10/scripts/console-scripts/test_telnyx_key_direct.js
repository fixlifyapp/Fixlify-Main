// Direct Telnyx API Key Test Script
// Copy and paste this entire script into your browser console

window.testTelnyxKey = async function(apiKey) {
  console.clear();
  console.log("🔍 Testing Telnyx API Key...\n");
  
  if (!apiKey || !apiKey.startsWith('KEY')) {
    console.error("❌ Invalid key format. Key must start with 'KEY'");
    console.log("Usage: testTelnyxKey('KEY...')");
    return;
  }
  
  console.log(`📋 Testing key: ${apiKey.substring(0, 15)}...`);
  console.log(`📏 Key length: ${apiKey.length} characters\n`);
  
  try {
    // Test 1: Check phone numbers endpoint
    console.log("📞 Test 1: Checking phone numbers...");
    const phoneResponse = await fetch('https://api.telnyx.com/v2/phone_numbers', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (phoneResponse.ok) {
      const phoneData = await phoneResponse.json();
      console.log("✅ Phone numbers endpoint: SUCCESS");
      console.log(`   Found ${phoneData.data.length} phone numbers`);
      
      if (phoneData.data.length > 0) {
        console.log("   Your phone numbers:");
        phoneData.data.forEach(phone => {
          console.log(`   - ${phone.phone_number} (${phone.status})`);
        });
      }
    } else {
      const error = await phoneResponse.json();
      console.error("❌ Phone numbers endpoint: FAILED");
      console.error("   Error:", error.errors?.[0]?.detail || error);
    }
    
    // Test 2: Check messaging profiles
    console.log("\n📨 Test 2: Checking messaging profiles...");
    const profileResponse = await fetch('https://api.telnyx.com/v2/messaging_profiles', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (profileResponse.ok) {
      const profileData = await profileResponse.json();
      console.log("✅ Messaging profiles endpoint: SUCCESS");
      console.log(`   Found ${profileData.data.length} messaging profiles`);
      
      if (profileData.data.length > 0) {
        console.log("   Your messaging profiles:");
        profileData.data.forEach(profile => {
          console.log(`   - ${profile.name} (ID: ${profile.id})`);
        });
      }
    } else {
      const error = await profileResponse.json();
      console.error("❌ Messaging profiles endpoint: FAILED");
      console.error("   Error:", error.errors?.[0]?.detail || error);
    }
    
    // Test 3: Check account balance
    console.log("\n💰 Test 3: Checking account balance...");
    const balanceResponse = await fetch('https://api.telnyx.com/v2/balance', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (balanceResponse.ok) {
      const balanceData = await balanceResponse.json();
      console.log("✅ Balance endpoint: SUCCESS");
      console.log(`   Balance: ${balanceData.data.balance} ${balanceData.data.currency}`);
    } else {
      const error = await balanceResponse.json();
      console.error("❌ Balance endpoint: FAILED");
      console.error("   Error:", error.errors?.[0]?.detail || error);
    }
    
    // Summary
    console.log("\n📊 SUMMARY:");
    if (phoneResponse.ok && profileResponse.ok && balanceResponse.ok) {
      console.log("✅ API Key is VALID and working!");
      console.log("\n🎯 Next steps:");
      console.log("1. Copy this working API key");
      console.log("2. Go to: https://supabase.com/dashboard/project/mqppvcrlvsgrsqelglod/functions/secrets");
      console.log("3. Update TELNYX_API_KEY with this key");
      console.log("4. Save and wait 30 seconds");
      console.log("5. Test SMS sending from your app");
    } else {
      console.error("❌ API Key has issues!");
      console.log("\n🔧 Troubleshooting:");
      console.log("1. Make sure this is your production API key");
      console.log("2. Check if the key is active in Telnyx portal");
      console.log("3. Verify your Telnyx account is in good standing");
      console.log("4. Try generating a new API key in Telnyx");
    }
    
  } catch (error) {
    console.error("❌ Network error:", error.message);
    console.log("\nMake sure you're connected to the internet and try again.");
  }
};

// Instructions
console.log("🚀 Telnyx API Key Tester Ready!\n");
console.log("To test your key, run:");
console.log("testTelnyxKey('YOUR_API_KEY_HERE')");
console.log("\nExample:");
console.log("testTelnyxKey('KEY01973792571E80381EF8E470CD832049')");
console.log("\n⚠️  Make sure to use your FULL API key from Telnyx portal");

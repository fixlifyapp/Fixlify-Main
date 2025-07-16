// Verify Telnyx API Key Script
// This tests your Telnyx API key directly with their API

async function verifyTelnyxKey() {
  console.log("🔍 Verifying Telnyx API Key...\n");
  
  // Your Telnyx API key from Supabase (first 15 chars match what we see)
  // You'll need to get the full key from Telnyx portal
  const testKey = "KEY01973792571E"; // This is just the prefix we can see
  
  console.log("⚠️  IMPORTANT: This script needs your FULL Telnyx API key");
  console.log("📝 To get your correct key:");
  console.log("1. Go to: https://portal.telnyx.com");
  console.log("2. Log in to your account");
  console.log("3. Navigate to: API Keys");
  console.log("4. Copy your API key");
  console.log("\n");
  
  // Test function to verify key with Telnyx
  window.testTelnyxKey = async function(apiKey) {
    if (!apiKey || !apiKey.startsWith('KEY')) {
      console.error("❌ Invalid key format. Key must start with 'KEY'");
      return;
    }
    
    console.log("🔍 Testing key with Telnyx API...");
    
    try {
      // Test the key by fetching phone numbers
      const response = await fetch('https://api.telnyx.com/v2/phone_numbers', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log("✅ API Key is VALID!");
        console.log(`📱 Found ${data.data.length} phone numbers in your account`);
        
        if (data.data.length > 0) {
          console.log("\n📞 Your Telnyx phone numbers:");
          data.data.forEach(phone => {
            console.log(`   - ${phone.phone_number} (${phone.status})`);
          });
        }
        
        console.log("\n✅ Next step: Update the key in Supabase");
        console.log("Go to: https://supabase.com/dashboard/project/mqppvcrlvsgrsqelglod/functions/secrets");
        console.log("Update TELNYX_API_KEY with this valid key");
        
      } else {
        const error = await response.json();
        console.error("❌ API Key is INVALID!");
        console.error("Error:", error);
        
        if (error.errors && error.errors[0]) {
          console.error("Details:", error.errors[0].detail);
        }
        
        console.log("\n📝 Please check:");
        console.log("1. Is this the correct API key from your Telnyx account?");
        console.log("2. Is the key active (not revoked)?");
        console.log("3. Are you using the right account (production vs test)?");
      }
      
    } catch (error) {
      console.error("❌ Error testing key:", error);
    }
  };
  
  console.log("📋 To test your key, run:");
  console.log("testTelnyxKey('YOUR_FULL_API_KEY')");
  console.log("\nExample:");
  console.log("testTelnyxKey('KEY01973792571E80381EF8E470CD832049')");
}

// Run the verification guide
verifyTelnyxKey();

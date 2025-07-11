// Clean Telnyx API Key Test Script
// Copy and paste this entire script into your browser console

window.testTelnyxKey = async function(apiKey) {
  console.clear();
  console.log("🔍 Testing Telnyx API Key...\n");
  
  if (!apiKey || !apiKey.startsWith('KEY')) {
    console.error("❌ Invalid key format. Key must start with 'KEY'");
    console.log("Usage: testTelnyxKey('KEY...')");
    return;
  }
  
  console.log("📋 Testing key: " + apiKey.substring(0, 15) + "...");
  console.log("📏 Key length: " + apiKey.length + " characters\n");
  
  try {
    // Test the API key with Telnyx
    console.log("📞 Testing with Telnyx API...");
    const response = await fetch('https://api.telnyx.com/v2/phone_numbers', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + apiKey,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log("✅ API Key is VALID!");
      console.log("Found " + data.data.length + " phone numbers in your account");
      
      if (data.data.length > 0) {
        console.log("\nYour Telnyx phone numbers:");
        data.data.forEach(function(phone) {
          console.log("- " + phone.phone_number + " (" + phone.status + ")");
        });
      }
      
      console.log("\n✅ Next steps:");
      console.log("1. Copy this working API key");
      console.log("2. Go to Supabase secrets page");
      console.log("3. Update TELNYX_API_KEY with this key");
      console.log("4. Save and wait 30 seconds");
      
    } else {
      const errorText = await response.text();
      console.error("❌ API Key is INVALID!");
      console.error("Response: " + errorText);
      
      console.log("\n🔧 To fix this:");
      console.log("1. Go to https://portal.telnyx.com");
      console.log("2. Navigate to API Keys section");
      console.log("3. Create a new API key or copy an active one");
      console.log("4. Test it with this script");
    }
    
  } catch (error) {
    console.error("❌ Network error: " + error.message);
    console.log("Make sure you're connected to the internet");
  }
};

// Show instructions
console.log("🚀 Telnyx API Key Tester Ready!\n");
console.log("To test your key, run:");
console.log("testTelnyxKey('YOUR_API_KEY_HERE')");
console.log("\nExample:");
console.log("testTelnyxKey('KEY01973792571E80381EF8E470CD832049')");

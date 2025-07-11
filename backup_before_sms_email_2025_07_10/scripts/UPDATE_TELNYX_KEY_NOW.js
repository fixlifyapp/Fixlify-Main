// Update TELNYX API Key Script
// This script helps you update the Telnyx API key in Supabase

console.clear();
console.log("🔧 TELNYX API Key Update Instructions\n");

const CORRECT_API_KEY = "KEY0197DAA8BF3E951E5527CAA98E7770FC";

console.log("📋 Your correct Telnyx API key is:");
console.log("   " + CORRECT_API_KEY);
console.log("");

console.log("🚀 Step 1: Test the key first");
console.log("Run this command to verify it works:");
console.log("");
console.log("testTelnyxKey('" + CORRECT_API_KEY + "')");
console.log("");

console.log("📝 Step 2: Update in Supabase");
console.log("1. Go to: https://supabase.com/dashboard/project/mqppvcrlvsgrsqelglod/functions/secrets");
console.log("2. Find 'TELNYX_API_KEY' in the list");
console.log("3. Click the edit icon (pencil)");
console.log("4. Replace the current value with:");
console.log("   " + CORRECT_API_KEY);
console.log("5. Make sure there are NO spaces before or after");
console.log("6. Click 'Save'");
console.log("");

console.log("⏱️  Step 3: Wait for propagation");
console.log("Wait 30-60 seconds for the changes to take effect");
console.log("");

console.log("✅ Step 4: Test SMS sending");
console.log("Go to your Jobs page and try sending an SMS");
console.log("");

// Also create the test function with the correct key
window.testCorrectKey = async function() {
  console.log("\n🔍 Testing the correct Telnyx API key...");
  
  try {
    const response = await fetch('https://api.telnyx.com/v2/phone_numbers', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + CORRECT_API_KEY,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log("✅ API Key is VALID!");
      console.log("Found " + data.data.length + " phone numbers");
      if (data.data.length > 0) {
        console.log("Phone numbers:");
        data.data.forEach(phone => {
          console.log("- " + phone.phone_number + " (" + phone.status + ")");
        });
      }
    } else {
      const error = await response.text();
      console.error("❌ API Key test failed!");
      console.error("Error: " + error);
    }
  } catch (err) {
    console.error("Network error: " + err.message);
  }
};

console.log("💡 Quick test: Run testCorrectKey() to verify the API key");

// Open Supabase secrets page
if (confirm("Would you like to open the Supabase secrets page now?")) {
  window.open('https://supabase.com/dashboard/project/mqppvcrlvsgrsqelglod/functions/secrets', '_blank');
}

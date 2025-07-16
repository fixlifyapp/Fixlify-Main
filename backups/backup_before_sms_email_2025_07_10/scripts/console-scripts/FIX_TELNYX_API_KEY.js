// Fix TELNYX API Key Issue - Complete Solution
// Run this script in your browser console

async function fixTelnyxApiKey() {
  console.log("🔧 TELNYX API Key Fix - Complete Solution\n");
  
  console.log("📋 PROBLEM IDENTIFIED:");
  console.log("The edge functions are failing because the TELNYX_API_KEY in Supabase secrets is invalid.");
  console.log("The current key might be the wrong format or malformed.\n");
  
  console.log("✅ SOLUTION:");
  console.log("Update the TELNYX_API_KEY in Supabase secrets with the correct API key.\n");
  
  console.log("📝 STEP-BY-STEP INSTRUCTIONS:\n");
  
  console.log("1. FIND YOUR CORRECT TELNYX API KEY:");
  console.log("   - Go to: https://portal.telnyx.com");
  console.log("   - Log in to your Telnyx account");
  console.log("   - Navigate to: API Keys section");
  console.log("   - Copy your API key (it should start with 'KEY')");
  console.log("   - Example format: KEY01973792571E80381EF8E470CD832049");
  
  console.log("\n2. UPDATE SUPABASE SECRETS:");
  console.log("   - Go to: https://supabase.com/dashboard/project/mqppvcrlvsgrsqelglod/functions/secrets");
  console.log("   - Find 'TELNYX_API_KEY' in the list");
  console.log("   - Click the edit icon (pencil) next to it");
  console.log("   - Replace the value with your correct API key");
  console.log("   - Make sure there are NO spaces before or after the key");
  console.log("   - Click 'Save'");
  
  console.log("\n3. WAIT FOR PROPAGATION:");
  console.log("   - Wait 30-60 seconds for the new key to propagate");
  console.log("   - The edge functions will automatically use the new key");
  
  console.log("\n4. TEST THE FIX:");
  console.log("   Run this test function after updating:");
  console.log(`
async function testSMS() {
  const response = await fetch('https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/test-env', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xcHB2Y3JsdnNncnNxZWxnbG9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1OTE3MDUsImV4cCI6MjA2MzE2NzcwNX0.My-KiqG1bCMqzUru4m59d4v18N3WGxNoNtFPOFAmhzg',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({})
  });
  const data = await response.json();
  console.log('Environment check:', data);
}
testSMS();
  `);
  
  console.log("\n⚠️  IMPORTANT NOTES:");
  console.log("- The API key should start with 'KEY' (not 'sk_' or other prefixes)");
  console.log("- Do NOT include quotes around the API key in Supabase secrets");
  console.log("- Make sure there are no extra spaces or line breaks");
  console.log("- The edge functions use TELNYX_API_KEY (without VITE_ prefix)");
  
  console.log("\n🔍 CURRENT STATUS:");
  console.log("Based on the error messages, the current API key is being rejected by Telnyx.");
  console.log("This usually means the key format is wrong or the key is invalid.");
  
  // Open the secrets page
  const openSecretsPage = confirm("Would you like to open the Supabase secrets page now?");
  if (openSecretsPage) {
    window.open('https://supabase.com/dashboard/project/mqppvcrlvsgrsqelglod/functions/secrets', '_blank');
  }
  
  console.log("\n✅ Once you've updated the key, test sending an SMS from the Jobs page!");
}

// Run the fix guide
fixTelnyxApiKey();

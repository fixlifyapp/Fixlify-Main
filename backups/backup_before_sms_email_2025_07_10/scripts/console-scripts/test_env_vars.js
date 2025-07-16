// Test Environment Variables Script
// Run this in the browser console

async function testEnvironmentVariables() {
  console.log("🔍 Testing Edge Function Environment Variables...\n");
  
  const projectUrl = 'https://mqppvcrlvsgrsqelglod.supabase.co';
  const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xcHB2Y3JsdnNncnNxZWxnbG9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1OTE3MDUsImV4cCI6MjA2MzE2NzcwNX0.My-KiqG1bCMqzUru4m59d4v18N3WGxNoNtFPOFAmhzg';
  
  try {
    console.log("📡 Calling test-env function...");
    const response = await fetch(`${projectUrl}/functions/v1/test-env`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${anonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({})
    });
    
    const data = await response.json();
    
    console.log("📋 Environment Variables Status:");
    console.log(JSON.stringify(data, null, 2));
    
    if (data.environment?.TELNYX_API_KEY === 'NOT SET') {
      console.error("\n❌ TELNYX_API_KEY is NOT SET!");
      console.log("\n📝 To fix this:");
      console.log("1. Go to: https://supabase.com/dashboard/project/mqppvcrlvsgrsqelglod/functions/secrets");
      console.log("2. Click 'Add new secret'");
      console.log("3. Add:");
      console.log("   Key: TELNYX_API_KEY");
      console.log("   Value: Your Telnyx API key (starts with 'KEY')");
      console.log("4. Click 'Save'");
    } else if (data.telnyxKeyDetails) {
      console.log("\n✅ TELNYX_API_KEY is set!");
      console.log("Details:", data.telnyxKeyDetails);
      
      if (!data.telnyxKeyDetails.startsWithKEY) {
        console.warn("⚠️  API key doesn't start with 'KEY' - might be invalid!");
      }
      if (data.telnyxKeyDetails.hasSpaces) {
        console.warn("⚠️  API key has spaces - this might cause issues!");
      }
    }
    
  } catch (error) {
    console.error("❌ Error testing environment:", error);
  }
}

// Run the test
testEnvironmentVariables();

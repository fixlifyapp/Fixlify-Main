// Script to check TELNYX_API_KEY secret in Supabase
// Run this in the browser console after logging into Supabase Dashboard

async function checkTelnyxSecret() {
  console.log("🔍 Checking TELNYX_API_KEY configuration...\n");
  
  // Check if we're on the right page
  const currentUrl = window.location.href;
  const projectRef = currentUrl.match(/project\/([^\/]+)/)?.[1];
  
  if (!projectRef || !currentUrl.includes('supabase.com/dashboard')) {
    console.error("❌ Please run this on your Supabase dashboard!");
    console.log("   Navigate to: https://supabase.com/dashboard/project/mqppvcrlvsgrsqelglod/functions/secrets");
    return;
  }
  
  console.log(`✅ Project ref: ${projectRef}`);
  console.log(`📍 Current URL: ${currentUrl}`);
  
  // Check if we're on the secrets page
  if (!currentUrl.includes('/functions/secrets')) {
    console.log("\n⚠️  Not on the secrets page. Redirecting...");
    window.location.href = `https://supabase.com/dashboard/project/${projectRef}/functions/secrets`;
    return;
  }
  
  console.log("\n📋 Instructions to check/set TELNYX_API_KEY:");
  console.log("1. Look for 'TELNYX_API_KEY' in the list of secrets");
  console.log("2. If it's not there, click 'Add new secret'");
  console.log("3. Set the following:");
  console.log("   - Key: TELNYX_API_KEY");
  console.log("   - Value: Your actual Telnyx API key (no quotes, no spaces)");
  console.log("4. Click 'Save'");
  
  console.log("\n🔑 The API key should look like: KEY0197DAA88F3E951E5527CAA98E7770FC...");
  console.log("   (starts with 'KEY' followed by a long string)");
  
  console.log("\n📝 Note: The edge functions use TELNYX_API_KEY (without VITE_ prefix)");
  console.log("   Frontend uses VITE_TELNYX_API_KEY (with VITE_ prefix)");
  
  // Try to find existing secrets on the page
  setTimeout(() => {
    const secretElements = document.querySelectorAll('[data-testid="secret-key"]');
    if (secretElements.length > 0) {
      console.log("\n🔍 Found secrets on page:");
      secretElements.forEach(el => {
        const key = el.textContent;
        if (key.includes('TELNYX')) {
          console.log(`   ✅ ${key} - Found!`);
        }
      });
    }
  }, 1000);
}

// Run the check
checkTelnyxSecret();

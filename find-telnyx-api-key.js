// Run this in browser console to find your Telnyx API Key options

console.log('🔍 Finding your Telnyx API Key options...\n');

// Option 1: Check if you have the API key in your browser
if (typeof TELNYX_API_KEY !== 'undefined') {
  console.log('Found in browser:', TELNYX_API_KEY);
}

// Option 2: Guide to find it in Telnyx Dashboard
console.log('📋 To find your Telnyx API Key:\n');
console.log('1. Go to Telnyx Dashboard: https://portal.telnyx.com');
console.log('2. Click on "API Keys" in the left sidebar');
console.log('3. You should see your API keys listed there');
console.log('4. Look for:');
console.log('   - Production Key: Starts with "KEY" (no TEST)');
console.log('   - Test Key: Starts with "KEYTEST"');
console.log('\n5. In the MCP Server API Key dropdown, you should see these keys');
console.log('6. Select the one that matches what you use for SMS\n');

// Option 3: Check Supabase Dashboard
console.log('🔐 Alternative - Check in Supabase Dashboard:');
console.log('1. Go to: https://supabase.com/dashboard/project/mqppvcrlvsgrsqelglod/functions/secrets');
console.log('2. Look for "TELNYX_API_KEY"');
console.log('3. Click "Reveal" to see the value');
console.log('4. This is the key you should select in the dropdown\n');

console.log('⚠️ IMPORTANT: Do NOT type the webhook secret in the API Key field!');
console.log('The API Key dropdown should show your actual Telnyx API keys.');
console.log('Select the one that starts with "KEY" or "KEYTEST"');

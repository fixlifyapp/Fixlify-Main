// Verify Telnyx API Key Format
// This helps ensure your API key is in the correct format

function verifyTelnyxApiKey() {
  const apiKey = prompt('Paste your Telnyx API key here to verify format:');
  
  if (!apiKey) {
    console.log('❌ No API key provided');
    return;
  }
  
  console.log('\n🔍 Checking API key format...\n');
  
  // Check for common issues
  const issues = [];
  
  if (apiKey !== apiKey.trim()) {
    issues.push('⚠️ API key has leading or trailing spaces');
  }
  
  if (apiKey.includes('"') || apiKey.includes("'")) {
    issues.push('⚠️ API key contains quotes - remove them');
  }
  
  if (!apiKey.startsWith('KEY')) {
    issues.push('❌ API key should start with "KEY" (for API v2)');
    issues.push('💡 Make sure you\'re using a Telnyx API v2 key, not v1');
  }
  
  if (apiKey.length < 40) {
    issues.push('⚠️ API key seems too short');
  }
  
  if (apiKey.includes(' ') || apiKey.includes('\n') || apiKey.includes('\t')) {
    issues.push('❌ API key contains whitespace characters');
  }
  
  if (issues.length === 0) {
    console.log('✅ API key format looks correct!');
    console.log('📏 Length:', apiKey.length, 'characters');
    console.log('🔑 Starts with:', apiKey.substring(0, 8) + '...');
    console.log('\n📝 Next steps:');
    console.log('1. Copy this exact key (no modifications)');
    console.log('2. Go to Supabase Edge Functions > Secrets');
    console.log('3. Update TELNYX_API_KEY with this value');
    console.log('4. Make sure to save without any quotes or spaces');
  } else {
    console.log('❌ Issues found with API key:\n');
    issues.forEach(issue => console.log(issue));
    console.log('\n📝 Corrected key would be:');
    console.log(apiKey.trim().replace(/['"]/g, ''));
  }
}

// Run the verification
verifyTelnyxApiKey();
// ============================================
// LOCALHOST vs PRODUCTION DOMAIN ISSUES
// ============================================

console.clear();
console.log('%c🌐 LOCALHOST vs PRODUCTION CONFIGURATION', 'color: #2563eb; font-size: 20px; font-weight: bold;');
console.log('%c============================================', 'color: #2563eb;');

console.log('\nYou are testing on LOCALHOST but production is hub.fixlify.app');
console.log('This can cause several issues:\n');

console.log('%c1. MAILGUN DOMAIN MISMATCH', 'color: #dc2626; font-size: 16px; font-weight: bold;');
console.log('   - Mailgun domains are specific to URLs');
console.log('   - If MAILGUN_DOMAIN is set to "mg.fixlify.app"');
console.log('   - But emails have localhost URLs in them');
console.log('   - This can cause delivery issues\n');

console.log('%c2. CORS & SECURITY', 'color: #dc2626; font-size: 16px; font-weight: bold;');
console.log('   - Edge functions might have CORS restrictions');
console.log('   - Some APIs check the origin domain\n');

console.log('%c3. PORTAL LINKS', 'color: #dc2626; font-size: 16px; font-weight: bold;');
console.log('   - Estimates generate portal links');
console.log('   - On localhost: http://localhost:5173/estimate/xxx');
console.log('   - Should be: https://hub.fixlify.app/estimate/xxx\n');

console.log('%c🔧 SOLUTIONS', 'color: #059669; font-size: 16px; font-weight: bold;');

console.log('\n1. Check PUBLIC_SITE_URL in edge functions:');
console.log('   - Should be set to: https://hub.fixlify.app');
console.log('   - Not: http://localhost:5173\n');

console.log('2. For Mailgun, you might need:');
console.log('   - Separate sandbox domain for testing');
console.log('   - Or use test email addresses\n');

console.log('3. Check these environment variables in Supabase:');
console.log('   - PUBLIC_SITE_URL = https://hub.fixlify.app');
console.log('   - MAILGUN_DOMAIN = mg.fixlify.app (or your domain)');
console.log('   - MAILGUN_FROM_EMAIL = noreply@fixlify.app\n');

// Test current configuration
console.log('%c📊 TESTING CURRENT CONFIGURATION', 'color: #059669; font-size: 16px; font-weight: bold;');

// Check what URL is being used
console.log('\nCurrent browser URL:', window.location.origin);
console.log('Should use in production:', 'https://hub.fixlify.app');

// Test with corrected portal URL
async function testWithProductionURL() {
  console.log('\n🧪 Testing email with production URLs...');
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.error('Not authenticated');
    return;
  }
  
  // Get an estimate
  const { data: estimates } = await supabase
    .from('estimates')
    .select('*, clients(*)')
    .eq('user_id', user.id)
    .limit(1);
    
  if (!estimates || estimates.length === 0) {
    console.log('No estimates found');
    return;
  }
  
  const estimate = estimates[0];
  console.log('Testing with estimate:', estimate.estimate_number);
  
  // The edge function should use PUBLIC_SITE_URL, not window.location
  const { data, error } = await supabase.functions.invoke('send-estimate', {
    body: {
      estimateId: estimate.id,
      sendToClient: true,
      customMessage: 'Test from localhost with production URL'
    }
  });
  
  if (error) {
    console.error('❌ Error:', error.message);
    console.log('This might be due to localhost/production mismatch');
  } else {
    console.log('✅ Success:', data);
    console.log('Check if portal URL is correct:', data.portalUrl);
  }
}

// Test Mailgun with explicit from address
async function testMailgunWithDomain() {
  console.log('\n🧪 Testing Mailgun with explicit domain...');
  
  const { data, error } = await supabase.functions.invoke('mailgun-email', {
    body: {
      to: 'test@example.com',
      from: 'noreply@fixlify.app', // Use production domain
      subject: 'Test from localhost',
      text: 'Testing email from localhost with production domain',
      html: '<p>Testing email from localhost with production domain</p>'
    }
  });
  
  if (error) {
    console.error('❌ Mailgun error:', error.message);
    if (error.message.includes('domain')) {
      console.log('⚠️  This confirms domain mismatch issue');
    }
  } else {
    console.log('✅ Mailgun success:', data);
  }
}

// Run tests
console.log('\n🚀 Running tests...\n');
testWithProductionURL();
testMailgunWithDomain();

console.log('\n%c💡 RECOMMENDATIONS', 'color: #f59e0b; font-size: 16px; font-weight: bold;');
console.log('\n1. Update Supabase Edge Function environment variables:');
console.log('   https://supabase.com/dashboard/project/mqppvcrlvsgrsqelglod/settings/functions');
console.log('   Set: PUBLIC_SITE_URL = https://hub.fixlify.app');

console.log('\n2. For local testing, consider:');
console.log('   - Using Mailgun sandbox domain');
console.log('   - Or creating a test configuration');

console.log('\n3. Check edge function code:');
console.log('   - Portal URLs should use PUBLIC_SITE_URL');
console.log('   - Not window.location or hardcoded localhost');

console.log('\n4. Test on production:');
console.log('   Deploy and test on https://hub.fixlify.app');
console.log('   Many email issues only appear in production');

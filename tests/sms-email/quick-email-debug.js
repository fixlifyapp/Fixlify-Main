// Quick Email Debug Script
// Run this in F12 console to diagnose the issue

console.log('🔍 QUICK EMAIL DIAGNOSIS\n');

// 1. Test if edge functions are accessible
async function quickTest() {
  // Check if logged in
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    console.error('❌ Not logged in! Please log in first.');
    return;
  }
  
  console.log('✅ Logged in as:', session.user.email);
  
  // Test mailgun-email function
  console.log('\n📧 Testing mailgun-email edge function...');
  const mailgunUrl = `${supabase.supabaseUrl}/functions/v1/mailgun-email`;
  
  try {
    const response = await fetch(mailgunUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
        'apikey': supabase.supabaseKey
      },
      body: JSON.stringify({
        to: 'test@example.com',
        subject: 'Test',
        text: 'Test email',
        userId: session.user.id
      })
    });
    
    const result = await response.text();
    console.log('Response status:', response.status);
    console.log('Response:', result);
    
    if (!response.ok) {
      console.error('❌ Mailgun function returned error');
      console.log('\n⚠️ COMMON ISSUES:');
      console.log('1. Function not deployed');
      console.log('2. MAILGUN_API_KEY not set in Supabase secrets');
      console.log('3. CORS or authentication issues');
    }
  } catch (error) {
    console.error('❌ Failed to call mailgun function:', error);
    console.log('\n🚨 The function might not be deployed!');
  }
  
  // Test send-estimate function
  console.log('\n📄 Testing send-estimate edge function...');
  const sendEstimateUrl = `${supabase.supabaseUrl}/functions/v1/send-estimate`;
  
  try {
    const response = await fetch(sendEstimateUrl, {
      method: 'OPTIONS',
      headers: {
        'apikey': supabase.supabaseKey
      }
    });
    
    if (response.ok) {
      console.log('✅ send-estimate function is deployed');
    } else {
      console.log('❌ send-estimate function not accessible (Status:', response.status, ')');
    }
  } catch (error) {
    console.error('❌ send-estimate function not found');
  }
}

quickTest();

console.log('\n📋 DEPLOYMENT COMMANDS:');
console.log('Run these in your terminal:');
console.log('1. npx supabase functions deploy mailgun-email --no-verify-jwt');
console.log('2. npx supabase functions deploy send-estimate');
console.log('3. npx supabase functions deploy check-email-config');

// Diagnose Empty Logs Issue
// Run this in the browser console

console.log('🔍 DIAGNOSING EMPTY LOGS ISSUE\n');

async function diagnoseEmailIssue() {
  // 1. Check if we're logged in
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    console.error('❌ Not logged in!');
    return;
  }
  
  console.log('✅ Logged in as:', session.user.email);
  console.log('User ID:', session.user.id);
  
  // 2. Check if edge function responds
  console.log('\n📡 Testing edge function connectivity...');
  
  try {
    const testResponse = await supabase.functions.invoke('send-estimate', {
      body: {
        estimateId: 'test-123',
        recipientEmail: 'test@example.com'
      }
    });
    
    console.log('Edge function response:', testResponse);
    
    if (testResponse.error) {
      console.log('✅ Function is responding (got expected error)');
      console.log('Error details:', testResponse.error);
    } else {
      console.log('Response data:', testResponse.data);
    }
  } catch (error) {
    console.error('❌ Failed to invoke function:', error);
  }
  
  // 3. Try to get a real estimate and send it
  console.log('\n📄 Looking for a real estimate to test...');
  
  const { data: estimates, error: estError } = await supabase
    .from('estimates')
    .select(`
      *,
      jobs!inner(
        *,
        clients!inner(*)
      )
    `)
    .limit(1);
    
  if (estError || !estimates || estimates.length === 0) {
    console.error('❌ No estimates found');
    return;
  }
  
  const estimate = estimates[0];
  console.log('Found estimate:', {
    id: estimate.id,
    number: estimate.estimate_number,
    client: estimate.jobs?.clients?.name,
    email: estimate.jobs?.clients?.email
  });
  
  // 4. Test with real estimate
  console.log('\n📧 Testing with real estimate...');
  
  try {
    const sendResponse = await supabase.functions.invoke('send-estimate', {
      body: {
        estimateId: estimate.id,
        recipientEmail: estimate.jobs?.clients?.email || 'test@example.com',
        customMessage: 'Test email from console'
      }
    });
    
    console.log('Send response:', sendResponse);
    
    if (sendResponse.error) {
      console.error('❌ Send failed:', sendResponse.error);
      
      // Check if it's a Mailgun issue
      if (sendResponse.error.message?.includes('MAILGUN')) {
        console.log('\n⚠️ MAILGUN CONFIGURATION ISSUE');
        console.log('1. Check MAILGUN_API_KEY is set in Supabase secrets');
        console.log('2. Verify MAILGUN_DOMAIN=fixlify.app is set');
      }
    } else {
      console.log('✅ Email sent successfully!');
      console.log('Result:', sendResponse.data);
    }
  } catch (error) {
    console.error('❌ Function invocation error:', error);
  }
  
  // 5. Check logs API directly
  console.log('\n📋 Checking logs directly...');
  console.log('Go to: https://supabase.com/dashboard/project/mqppvcrlvsgrsqelglod/functions/send-estimate/logs');
  console.log('Make sure:');
  console.log('1. You are on the "Logs" tab');
  console.log('2. Time range is set to "Last hour" or "Today"');
  console.log('3. Severity filter includes all levels');
  console.log('4. Try refreshing the page');
  
  // 6. Test mailgun-email function directly
  console.log('\n📮 Testing mailgun-email function...');
  
  try {
    const mailgunTest = await supabase.functions.invoke('mailgun-email', {
      body: {
        to: 'test@example.com',
        subject: 'Test from Console',
        text: 'This is a test email',
        userId: session.user.id
      }
    });
    
    console.log('Mailgun function response:', mailgunTest);
  } catch (error) {
    console.error('❌ Mailgun function error:', error);
  }
}

// Run the diagnosis
diagnoseEmailIssue();

console.log('\n💡 COMMON REASONS FOR EMPTY LOGS:');
console.log('1. Edge functions were just deployed (logs may take a minute)');
console.log('2. Log retention/filtering in Supabase dashboard');
console.log('3. Function is failing before any console.log statements');
console.log('4. MAILGUN_API_KEY not set (function fails early)');
console.log('5. Wrong time range selected in logs viewer');

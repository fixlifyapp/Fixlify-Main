// ============================================
// EDGE FUNCTION ERROR DIAGNOSTICS - FIXED
// ============================================

console.clear();
console.log('%c🔍 EDGE FUNCTION ERROR DIAGNOSTICS', 'color: #dc2626; font-size: 20px; font-weight: bold;');
console.log('%c============================================', 'color: #dc2626;');

console.log('\nAPI keys are configured ✅ but functions are failing.');
console.log('Running detailed diagnostics...\n');

const supabase = window.supabase;

// 1. Test Mailgun with detailed error capture
async function testMailgunDetailed() {
  console.log('%c📧 Testing Mailgun Email Function...', 'color: #059669; font-size: 16px; font-weight: bold;');
  
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('❌ Not authenticated');
      return;
    }
    
    console.log('✅ Authenticated as:', user.email);
    
    // Try minimal email send
    console.log('\nAttempting minimal email send...');
    const { data, error } = await supabase.functions.invoke('mailgun-email', {
      body: {
        to: 'test@example.com',
        subject: 'Test',
        text: 'Test email body'
      }
    });
    
    if (error) {
      console.error('❌ Mailgun error:', error);
      console.log('\nError details:');
      console.log('- Message:', error.message);
      console.log('- Status:', error.status);
      console.log('- Details:', JSON.stringify(error, null, 2));
      
      // Common issues
      if (error.message.includes('not configured')) {
        console.log('\n⚠️  Issue: Email service not configured properly');
        console.log('Check that these secrets exist and are correct:');
        console.log('- MAILGUN_API_KEY');
        console.log('- MAILGUN_DOMAIN');
      } else if (error.message.includes('401') || error.message.includes('Forbidden')) {
        console.log('\n⚠️  Issue: Invalid Mailgun API key');
        console.log('The API key might be incorrect or expired');
      } else if (error.message.includes('domain')) {
        console.log('\n⚠️  Issue: Mailgun domain problem');
        console.log('Check that MAILGUN_DOMAIN matches your verified domain');
      }
    } else {
      console.log('✅ Mailgun working! Response:', data);
    }
    
  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

// 2. Test Send-Estimate function
async function testSendEstimateDetailed() {
  console.log('\n%c📋 Testing Send-Estimate Function...', 'color: #059669; font-size: 16px; font-weight: bold;');
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    // Get an estimate to test with
    const { data: estimates, error: fetchError } = await supabase
      .from('estimates')
      .select(`
        id,
        estimate_number,
        client_id,
        clients (
          id,
          name,
          email
        )
      `)
      .eq('user_id', user.id)
      .limit(1);
    
    if (fetchError) {
      console.error('❌ Error fetching estimates:', fetchError);
      return;
    }
    
    if (!estimates || estimates.length === 0) {
      console.log('⚠️  No estimates found to test with');
      return;
    }
    
    const estimate = estimates[0];
    console.log('Found estimate:', estimate);
    
    if (!estimate.clients?.email) {
      console.log('❌ Issue: Client has no email address');
      console.log('   Client:', estimate.clients?.name || 'Unknown');
      console.log('   This is why the function fails!');
      return;
    }
    
    // Try to send
    console.log('\nAttempting to send estimate...');
    const { data, error } = await supabase.functions.invoke('send-estimate', {
      body: {
        estimateId: estimate.id,
        sendToClient: true,
        customMessage: 'Debug test'
      }
    });
    
    if (error) {
      console.error('❌ Send-estimate error:', error);
      console.log('\nError details:', JSON.stringify(error, null, 2));
    } else {
      console.log('✅ Send-estimate working! Response:', data);
    }
    
  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

// 3. Test Notifications (SMS) function
async function testNotificationsDetailed() {
  console.log('\n%c📱 Testing Notifications (SMS) Function...', 'color: #059669; font-size: 16px; font-weight: bold;');
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    console.log('\nAttempting SMS send...');
    const { data, error } = await supabase.functions.invoke('notifications', {
      body: {
        type: 'custom',
        phoneNumber: '+1234567890',
        data: {
          message: 'Test SMS'
        },
        isTest: true,
        message: 'Test SMS from diagnostics'
      }
    });
    
    if (error) {
      console.error('❌ Notifications error:', error);
      console.log('\nError details:', JSON.stringify(error, null, 2));
      
      if (error.message.includes('not configured')) {
        console.log('\n⚠️  Issue: SMS service not configured');
        console.log('Check that these secrets exist:');
        console.log('- TELNYX_API_KEY');
        console.log('- TELNYX_PHONE_NUMBER');
      }
    } else {
      console.log('✅ Notifications working! Response:', data);
    }
    
  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

// 4. Check database for clues
async function checkDatabaseClues() {
  console.log('\n%c🗄️ Checking Database...', 'color: #059669; font-size: 16px; font-weight: bold;');
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    // Check communication logs for recent errors
    const { data: logs, error } = await supabase
      .from('communication_logs')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'failed')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (logs && logs.length > 0) {
      console.log('\n❌ Recent failed communications:');
      logs.forEach(log => {
        console.log(`\n- ${log.type} to ${log.recipient}`);
        console.log('  Time:', new Date(log.created_at).toLocaleString());
        console.log('  Error:', log.error);
      });
    } else {
      console.log('✅ No recent failed communications in logs');
    }
    
  } catch (err) {
    console.error('❌ Database check error:', err);
  }
}

// 5. Direct API test instructions
function showDirectAPITest() {
  console.log('\n%c🔌 Testing Direct Mailgun API...', 'color: #059669; font-size: 16px; font-weight: bold;');
  console.log('(This tests if the issue is with the edge function or Mailgun itself)');
  
  console.log('\nTo test Mailgun directly:');
  console.log('1. Get your API key from Supabase secrets');
  console.log('2. Run this curl command in terminal:');
  console.log('\ncurl -s --user \'api:YOUR_MAILGUN_API_KEY\' \\');
  console.log('  https://api.mailgun.net/v3/YOUR_DOMAIN/messages \\');
  console.log('  -F from=\'Test <test@YOUR_DOMAIN>\' \\');
  console.log('  -F to=\'test@example.com\' \\');
  console.log('  -F subject=\'Direct API Test\' \\');
  console.log('  -F text=\'Testing Mailgun API directly\'');
  console.log('\nIf this works but edge function doesn\'t, the issue is in the edge function code.');
}

// 6. Check Supabase logs link
function showSupabaseLogsLink() {
  console.log('\n%c📊 Check Supabase Edge Function Logs', 'color: #059669; font-size: 16px; font-weight: bold;');
  console.log('For server-side error details, check:');
  console.log('https://supabase.com/dashboard/project/mqppvcrlvsgrsqelglod/logs/edge-functions');
  console.log('\nLook for:');
  console.log('- Red error entries');
  console.log('- Status codes 400, 401, 500');
  console.log('- Error messages about API keys or domains');
}

// Run all diagnostics
async function runDiagnostics() {
  console.log('\n⏳ Running comprehensive diagnostics...\n');
  
  await testMailgunDetailed();
  await testSendEstimateDetailed();
  await testNotificationsDetailed();
  await checkDatabaseClues();
  showDirectAPITest();
  showSupabaseLogsLink();
  
  console.log('\n%c============================================', 'color: #dc2626;');
  console.log('%c📊 DIAGNOSTICS COMPLETE', 'color: #dc2626; font-size: 18px; font-weight: bold;');
  console.log('%c============================================', 'color: #dc2626;');
  
  console.log('\n💡 Common Solutions:');
  console.log('1. Check secret names are EXACTLY: MAILGUN_API_KEY, MAILGUN_DOMAIN, etc.');
  console.log('2. Ensure Mailgun domain is verified (not in sandbox mode for production)');
  console.log('3. Check if clients have email addresses in the database');
  console.log('4. Verify API keys are active and not expired');
  console.log('5. Check the Supabase logs link above for server errors');
}

// Run diagnostics
runDiagnostics();

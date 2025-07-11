// ============================================
// DEBUGGING: WHAT CHANGED IN THE LAST WEEK?
// ============================================

console.clear();
console.log('%c🔍 INVESTIGATING WHAT CHANGED', 'color: #dc2626; font-size: 20px; font-weight: bold;');
console.log('%c============================================', 'color: #dc2626;');
console.log('\nEmails worked 1 week ago on localhost, now failing...\n');

const supabase = window.supabase;

// 1. Check edge function versions
console.log('%c1️⃣ CHECKING EDGE FUNCTION VERSIONS', 'color: #059669; font-size: 16px; font-weight: bold;');
console.log('Edge functions might have been redeployed with errors');
console.log('Current versions:');
console.log('- mailgun-email: v42 (deployed recently)');
console.log('- send-estimate: v8 (deployed recently)');
console.log('\nThese were deployed TODAY - this might be the issue!\n');

// 2. Test with minimal payload
async function testMinimalEmail() {
  console.log('%c2️⃣ TESTING WITH MINIMAL EMAIL', 'color: #059669; font-size: 16px; font-weight: bold;');
  
  try {
    // Super minimal test
    const { data, error } = await supabase.functions.invoke('mailgun-email', {
      body: {
        to: 'test@example.com',
        subject: 'Test',
        text: 'Test'
      }
    });
    
    if (error) {
      console.error('❌ Even minimal email fails:', error.message);
      console.log('Full error object:', error);
      
      // Check specific error types
      if (error.message.includes('Internal Server Error')) {
        console.log('\n⚠️  500 Error = Edge function is crashing');
        console.log('Possible causes:');
        console.log('- Missing await statements');
        console.log('- Undefined variables');
        console.log('- Import errors');
      } else if (error.message.includes('Bad Request')) {
        console.log('\n⚠️  400 Error = Invalid request format');
      }
    } else {
      console.log('✅ Minimal email works!', data);
    }
  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

// 3. Check if it's an auth issue
async function testAuthIssue() {
  console.log('\n%c3️⃣ CHECKING AUTHENTICATION', 'color: #059669; font-size: 16px; font-weight: bold;');
  
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (!user) {
    console.error('❌ Not authenticated');
    return;
  }
  
  console.log('✅ Authenticated as:', user.email);
  
  // Get auth token
  const { data: { session } } = await supabase.auth.getSession();
  console.log('Session exists:', !!session);
  console.log('Token expires:', session?.expires_at ? new Date(session.expires_at * 1000) : 'N/A');
}

// 4. Check recent changes in database
async function checkRecentChanges() {
  console.log('\n%c4️⃣ CHECKING RECENT DATABASE CHANGES', 'color: #059669; font-size: 16px; font-weight: bold;');
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  
  // Check communication logs
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
  const { data: oldLogs } = await supabase
    .from('communication_logs')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'sent')
    .gte('created_at', oneWeekAgo.toISOString())
    .order('created_at', { ascending: false })
    .limit(5);
    
  if (oldLogs && oldLogs.length > 0) {
    console.log(`✅ Found ${oldLogs.length} successful emails from last week:`);
    oldLogs.forEach(log => {
      console.log(`- ${new Date(log.created_at).toLocaleDateString()}: ${log.type} to ${log.recipient}`);
    });
  }
  
  // Check recent failures
  const { data: failedLogs } = await supabase
    .from('communication_logs')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'failed')
    .order('created_at', { ascending: false })
    .limit(5);
    
  if (failedLogs && failedLogs.length > 0) {
    console.log(`\n❌ Recent failed attempts:`);
    failedLogs.forEach(log => {
      console.log(`- ${new Date(log.created_at).toLocaleDateString()}: ${log.error}`);
    });
  }
}

// 5. Direct check edge function health
async function checkEdgeFunctionHealth() {
  console.log('\n%c5️⃣ CHECKING EDGE FUNCTION HEALTH', 'color: #059669; font-size: 16px; font-weight: bold;');
  
  // Try to call with empty body to see the error
  try {
    const response = await fetch(`${supabase.supabaseUrl}/functions/v1/mailgun-email`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabase.anonKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    });
    
    const text = await response.text();
    console.log('Raw response:', text);
    console.log('Status:', response.status);
    
    if (response.status === 500) {
      console.log('\n⚠️  Edge function is crashing on startup');
      console.log('Check Supabase logs for the actual error');
    }
  } catch (err) {
    console.error('Direct call error:', err);
  }
}

// 6. Check Mailgun secrets
console.log('\n%c6️⃣ POSSIBLE SECRET ISSUES', 'color: #059669; font-size: 16px; font-weight: bold;');
console.log('Even though secrets are set, check if:');
console.log('1. Secret names are EXACTLY correct (case-sensitive)');
console.log('2. No extra spaces in secret values');
console.log('3. API key hasn\'t expired or been rotated');
console.log('4. Mailgun account is active (not suspended for billing)');

// Run all checks
async function runAllChecks() {
  console.log('\n🔄 Running all diagnostics...\n');
  
  await testAuthIssue();
  await testMinimalEmail();
  await checkRecentChanges();
  await checkEdgeFunctionHealth();
  
  console.log('\n%c🚨 MOST LIKELY ISSUES', 'color: #dc2626; font-size: 18px; font-weight: bold;');
  console.log('\nSince it worked a week ago:');
  console.log('1. Edge functions were redeployed TODAY with errors');
  console.log('2. Mailgun API key expired or account issue');
  console.log('3. A code change broke the edge functions');
  
  console.log('\n%c🔧 IMMEDIATE ACTIONS', 'color: #059669; font-size: 18px; font-weight: bold;');
  console.log('1. Check Supabase Edge Function Logs NOW:');
  console.log('   https://supabase.com/dashboard/project/mqppvcrlvsgrsqelglod/logs/edge-functions');
  console.log('   Look for red errors in the last hour');
  
  console.log('\n2. Check Mailgun Dashboard:');
  console.log('   - Is your account active?');
  console.log('   - Any alerts or warnings?');
  console.log('   - API key still valid?');
  
  console.log('\n3. Redeploy edge functions:');
  console.log('   Since they were deployed today, there might be an error');
  console.log('   in the deployment. Try redeploying.');
}

runAllChecks();

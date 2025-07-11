// ============================================
// COMPLETE EMAIL & SMS SYSTEM TEST SCRIPT
// ============================================
// Run this in browser console (F12) to test everything

console.clear();
console.log('%c🚀 FIXLIFY COMMUNICATION SYSTEM TEST', 'color: #2563eb; font-size: 20px; font-weight: bold;');
console.log('%c============================================', 'color: #2563eb;');
console.log('This script will test:', '\n✉️  Email sending\n📱 SMS sending\n📋 Estimate sending\n🔒 Data isolation\n');

const supabase = window.supabase;

// Test results storage
const testResults = {
  auth: false,
  clientEmails: false,
  edgeFunctions: false,
  directEmail: false,
  directSMS: false,
  estimateSend: false,
  dataIsolation: false
};

// 1. CHECK AUTHENTICATION
async function testAuth() {
  console.log('\n%c📌 TEST 1: Authentication', 'color: #059669; font-size: 16px; font-weight: bold;');
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      console.error('❌ Not authenticated');
      return null;
    }
    
    console.log('✅ Authenticated as:', user.email);
    console.log('   User ID:', user.id);
    testResults.auth = true;
    return user;
  } catch (err) {
    console.error('❌ Auth error:', err);
    return null;
  }
}

// 2. CHECK & FIX CLIENT EMAILS
async function testClientEmails(userId) {
  console.log('\n%c📌 TEST 2: Client Email Addresses', 'color: #059669; font-size: 16px; font-weight: bold;');
  
  try {
    // Check clients without email
    const { data: noEmailClients, error: checkError } = await supabase
      .from('clients')
      .select('id, name')
      .is('email', null)
      .eq('user_id', userId)
      .limit(10);
    
    if (checkError) throw checkError;
    
    if (noEmailClients && noEmailClients.length > 0) {
      console.log(`⚠️  Found ${noEmailClients.length} clients without email`);
      console.log('   Adding demo emails...');
      
      // Add demo emails
      for (const client of noEmailClients) {
        const email = `${client.name.toLowerCase().replace(/\s+/g, '.')}@demo.com`;
        await supabase
          .from('clients')
          .update({ email })
          .eq('id', client.id);
        console.log(`   ✅ Added ${email} to ${client.name}`);
      }
    }
    
    // Get clients with email
    const { data: emailClients, error: emailError } = await supabase
      .from('clients')
      .select('id, name, email, phone')
      .not('email', 'is', null)
      .eq('user_id', userId)
      .limit(5);
    
    if (emailError) throw emailError;
    
    console.log(`✅ Found ${emailClients?.length || 0} clients with email:`);
    emailClients?.forEach(c => {
      console.log(`   • ${c.name}: ${c.email} ${c.phone ? '📱' : ''}`);
    });
    
    testResults.clientEmails = true;
    return emailClients?.[0];
  } catch (err) {
    console.error('❌ Client email test failed:', err);
    return null;
  }
}

// 3. CHECK EDGE FUNCTIONS
async function testEdgeFunctions() {
  console.log('\n%c📌 TEST 3: Edge Functions Status', 'color: #059669; font-size: 16px; font-weight: bold;');
  
  const functions = [
    { name: 'mailgun-email', purpose: 'Email sending' },
    { name: 'send-estimate', purpose: 'Estimate emails' },
    { name: 'notifications', purpose: 'SMS sending' }
  ];
  
  let allWorking = true;
  
  for (const func of functions) {
    try {
      const url = `${supabase.supabaseUrl}/functions/v1/${func.name}`;
      const response = await fetch(url, { method: 'OPTIONS' });
      
      if (response.ok || response.status === 405) {
        console.log(`✅ ${func.name}: Active (${func.purpose})`);
      } else {
        console.log(`❌ ${func.name}: Not found (${response.status})`);
        allWorking = false;
      }
    } catch (err) {
      console.log(`❌ ${func.name}: Error checking`);
      allWorking = false;
    }
  }
  
  testResults.edgeFunctions = allWorking;
  return allWorking;
}

// 4. TEST DIRECT EMAIL
async function testDirectEmail(userId, testEmail = 'test@example.com') {
  console.log('\n%c📌 TEST 4: Direct Email Send', 'color: #059669; font-size: 16px; font-weight: bold;');
  console.log(`   Sending test email to: ${testEmail}`);
  
  try {
    const { data, error } = await supabase.functions.invoke('mailgun-email', {
      body: {
        to: testEmail,
        subject: 'Fixlify Email Test - ' + new Date().toLocaleTimeString(),
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>✅ Email System Working!</h2>
            <p>This test email was sent at: ${new Date().toLocaleString()}</p>
            <p>If you're seeing this, your Mailgun integration is properly configured.</p>
            <hr>
            <p style="color: #666;">Sent from Fixlify Communication Test</p>
          </div>
        `,
        text: 'Email System Working! This test email confirms your Mailgun integration is configured correctly.',
        userId: userId
      }
    });
    
    if (error) {
      console.error('❌ Email send failed:', error);
      console.log('\n📝 To fix:');
      console.log('1. Go to: https://supabase.com/dashboard/project/mqppvcrlvsgrsqelglod/functions/secrets');
      console.log('2. Add: MAILGUN_API_KEY, MAILGUN_DOMAIN');
      return false;
    }
    
    console.log('✅ Email sent successfully!');
    console.log('   Response:', data);
    testResults.directEmail = true;
    return true;
  } catch (err) {
    console.error('❌ Email test error:', err);
    return false;
  }
}

// 5. TEST DIRECT SMS
async function testDirectSMS(userId, testPhone = '+1234567890') {
  console.log('\n%c📌 TEST 5: Direct SMS Send', 'color: #059669; font-size: 16px; font-weight: bold;');
  console.log(`   Sending test SMS to: ${testPhone}`);
  
  try {
    const { data, error } = await supabase.functions.invoke('notifications', {
      body: {
        type: 'custom',
        phoneNumber: testPhone,
        data: {
          message: `Fixlify SMS Test - ${new Date().toLocaleTimeString()}`
        },
        isTest: true,
        message: `Fixlify SMS Test: Your SMS system is working! Time: ${new Date().toLocaleTimeString()}`,
        userId: userId
      }
    });
    
    if (error) {
      console.error('❌ SMS send failed:', error);
      console.log('\n📝 To fix:');
      console.log('1. Add Telnyx secrets: TELNYX_API_KEY, TELNYX_PHONE_NUMBER');
      return false;
    }
    
    console.log('✅ SMS sent successfully!');
    console.log('   Response:', data);
    testResults.directSMS = true;
    return true;
  } catch (err) {
    console.error('❌ SMS test error:', err);
    return false;
  }
}

// 6. TEST ESTIMATE SEND
async function testEstimateSend(userId) {
  console.log('\n%c📌 TEST 6: Estimate Email Send', 'color: #059669; font-size: 16px; font-weight: bold;');
  
  try {
    // Get an estimate with client email
    const { data: estimates, error: fetchError } = await supabase
      .from('estimates')
      .select(`
        id,
        estimate_number,
        total,
        status,
        clients!inner(
          id,
          name,
          email
        )
      `)
      .not('clients.email', 'is', null)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (fetchError) throw fetchError;
    
    if (!estimates || estimates.length === 0) {
      console.log('⚠️  No estimates with client emails found');
      console.log('   Create an estimate first, then run this test again');
      return false;
    }
    
    const estimate = estimates[0];
    console.log(`📋 Found estimate #${estimate.estimate_number}`);
    console.log(`   Client: ${estimate.clients.name}`);
    console.log(`   Email: ${estimate.clients.email}`);
    console.log(`   Total: $${estimate.total}`);
    
    // Send the estimate
    const { data, error } = await supabase.functions.invoke('send-estimate', {
      body: {
        estimateId: estimate.id,
        sendToClient: true,
        customMessage: 'This is a test estimate email sent from the communication test script.'
      }
    });
    
    if (error) {
      console.error('❌ Estimate send failed:', error);
      return false;
    }
    
    console.log('✅ Estimate sent successfully!');
    console.log('   Portal URL:', data.portalUrl);
    console.log('   Sent to:', data.recipient);
    testResults.estimateSend = true;
    return true;
  } catch (err) {
    console.error('❌ Estimate send error:', err);
    return false;
  }
}

// 7. TEST DATA ISOLATION
async function testDataIsolation(userId) {
  console.log('\n%c📌 TEST 7: Data Isolation (RLS)', 'color: #059669; font-size: 16px; font-weight: bold;');
  
  try {
    // Test clients isolation
    const { data: clients, error: clientError } = await supabase
      .from('clients')
      .select('id, user_id')
      .limit(5);
    
    if (clientError) throw clientError;
    
    const clientsOk = clients?.every(c => c.user_id === userId) ?? true;
    console.log(`${clientsOk ? '✅' : '❌'} Clients: ${clients?.length || 0} records (all belong to current user: ${clientsOk})`);
    
    // Test estimates isolation
    const { data: estimates, error: estimateError } = await supabase
      .from('estimates')
      .select('id, user_id')
      .limit(5);
    
    if (estimateError) throw estimateError;
    
    const estimatesOk = estimates?.every(e => e.user_id === userId) ?? true;
    console.log(`${estimatesOk ? '✅' : '❌'} Estimates: ${estimates?.length || 0} records (all belong to current user: ${estimatesOk})`);
    
    // Test communication logs isolation
    const { data: logs, error: logError } = await supabase
      .from('communication_logs')
      .select('id, user_id')
      .limit(5);
    
    if (logError) throw logError;
    
    const logsOk = logs?.every(l => l.user_id === userId) ?? true;
    console.log(`${logsOk ? '✅' : '❌'} Logs: ${logs?.length || 0} records (all belong to current user: ${logsOk})`);
    
    testResults.dataIsolation = clientsOk && estimatesOk && logsOk;
    return testResults.dataIsolation;
  } catch (err) {
    console.error('❌ Data isolation test error:', err);
    return false;
  }
}

// 8. CHECK RECENT COMMUNICATION LOGS
async function checkRecentLogs(userId) {
  console.log('\n%c📌 Communication Logs (Last 10)', 'color: #059669; font-size: 16px; font-weight: bold;');
  
  try {
    const { data: logs, error } = await supabase
      .from('communication_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (error) throw error;
    
    if (!logs || logs.length === 0) {
      console.log('📭 No communication logs found');
      return;
    }
    
    console.log(`📬 Found ${logs.length} recent communications:`);
    logs.forEach((log, i) => {
      const time = new Date(log.created_at).toLocaleString();
      const status = log.status === 'sent' ? '✅' : '❌';
      console.log(`${i + 1}. ${status} ${log.type.toUpperCase()} to ${log.recipient}`);
      console.log(`   Subject: ${log.subject || log.message?.substring(0, 50) + '...'}`);
      console.log(`   Time: ${time}`);
      if (log.error) console.log(`   Error: ${log.error}`);
    });
  } catch (err) {
    console.error('❌ Error fetching logs:', err);
  }
}

// MAIN TEST RUNNER
async function runAllTests() {
  console.log('\n⏳ Starting comprehensive system test...\n');
  
  // 1. Test Authentication
  const user = await testAuth();
  if (!user) {
    console.log('\n❌ Cannot continue without authentication');
    return;
  }
  
  // 2. Test Client Emails
  const testClient = await testClientEmails(user.id);
  
  // 3. Test Edge Functions
  await testEdgeFunctions();
  
  // 4. Test Direct Email (only if edge functions work)
  if (testResults.edgeFunctions) {
    await testDirectEmail(user.id, testClient?.email || 'test@example.com');
  }
  
  // 5. Test Direct SMS
  if (testResults.edgeFunctions && testClient?.phone) {
    await testDirectSMS(user.id, testClient.phone);
  }
  
  // 6. Test Estimate Send
  if (testResults.directEmail) {
    await testEstimateSend(user.id);
  }
  
  // 7. Test Data Isolation
  await testDataIsolation(user.id);
  
  // 8. Check Recent Logs
  await checkRecentLogs(user.id);
  
  // FINAL REPORT
  console.log('\n%c============================================', 'color: #2563eb;');
  console.log('%c📊 FINAL TEST REPORT', 'color: #2563eb; font-size: 18px; font-weight: bold;');
  console.log('%c============================================', 'color: #2563eb;');
  
  const totalTests = Object.keys(testResults).length;
  const passedTests = Object.values(testResults).filter(r => r).length;
  const successRate = Math.round((passedTests / totalTests) * 100);
  
  console.log(`\n📈 Success Rate: ${successRate}% (${passedTests}/${totalTests} tests passed)\n`);
  
  Object.entries(testResults).forEach(([test, passed]) => {
    const icon = passed ? '✅' : '❌';
    const testName = test.replace(/([A-Z])/g, ' $1').trim();
    console.log(`${icon} ${testName.charAt(0).toUpperCase() + testName.slice(1)}`);
  });
  
  // RECOMMENDATIONS
  console.log('\n%c💡 RECOMMENDATIONS', 'color: #f59e0b; font-size: 16px; font-weight: bold;');
  
  if (!testResults.edgeFunctions) {
    console.log('\n🔧 Deploy Edge Functions:');
    console.log('   Run: deploy_edge_functions.bat');
  }
  
  if (!testResults.directEmail) {
    console.log('\n📧 Configure Mailgun:');
    console.log('   1. Go to Supabase Dashboard > Edge Functions > Secrets');
    console.log('   2. Add: MAILGUN_API_KEY and MAILGUN_DOMAIN');
  }
  
  if (!testResults.directSMS) {
    console.log('\n📱 Configure Telnyx:');
    console.log('   1. Go to Supabase Dashboard > Edge Functions > Secrets');
    console.log('   2. Add: TELNYX_API_KEY and TELNYX_PHONE_NUMBER');
  }
  
  if (successRate === 100) {
    console.log('\n%c🎉 ALL SYSTEMS OPERATIONAL!', 'color: #10b981; font-size: 20px; font-weight: bold;');
    console.log('Your email and SMS systems are fully configured and working perfectly! 🚀');
  }
  
  console.log('\n%c============================================', 'color: #2563eb;');
  console.log('Test completed at:', new Date().toLocaleString());
}

// RUN THE TESTS
runAllTests().catch(err => {
  console.error('❌ Test suite error:', err);
});

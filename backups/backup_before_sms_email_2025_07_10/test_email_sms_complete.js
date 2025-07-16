// Test script for Mailgun & Telnyx with edge functions
console.log('=== Comprehensive Email & SMS Test Script ===\n');

// Get Supabase client
const supabase = window.supabase;
if (!supabase) {
  console.error('❌ Supabase client not found. Run this in the browser console.');
  throw new Error('Supabase not initialized');
}

// Get current user
async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    console.error('❌ No authenticated user found');
    return null;
  }
  console.log('✅ Current user:', user.email, 'ID:', user.id);
  return user;
}

// Check edge functions
async function checkEdgeFunctions() {
  console.log('\n📡 Checking Edge Functions...');
  
  const edgeFunctions = [
    'notifications', // For Telnyx SMS
    'send-email',    // For Mailgun email (if exists)
    'mailgun-email', // Alternative Mailgun function name
    'telnyx-sms'     // Alternative Telnyx function name
  ];
  
  for (const funcName of edgeFunctions) {
    try {
      const url = `${supabase.supabaseUrl}/functions/v1/${funcName}`;
      const response = await fetch(url, { method: 'OPTIONS' });
      
      if (response.ok || response.status === 405) {
        console.log(`✅ Edge function '${funcName}' is deployed`);
      } else {
        console.log(`❌ Edge function '${funcName}' not found (${response.status})`);
      }
    } catch (error) {
      console.log(`❌ Edge function '${funcName}' error:`, error.message);
    }
  }
}

// Check a sample client
async function checkClientData() {
  console.log('\n👥 Checking Client Data...');
  
  // Get first client with email
  const { data: clients, error } = await supabase
    .from('clients')
    .select('id, name, email, phone')
    .not('email', 'is', null)
    .limit(5);
    
  if (error) {
    console.error('❌ Error fetching clients:', error);
    return null;
  }
  
  if (!clients || clients.length === 0) {
    console.error('❌ No clients with email found!');
    console.log('   This is likely why estimate emails fail.');
    console.log('   Add email to existing clients or create new ones with email.');
    return null;
  }
  
  console.log(`✅ Found ${clients.length} clients with email:`);
  clients.forEach(client => {
    console.log(`   - ${client.name}: ${client.email} (${client.phone || 'no phone'})`);
  });
  
  return clients[0];
}

// Check estimate data
async function checkEstimateData() {
  console.log('\n📋 Checking Estimate Data...');
  
  // Get recent estimates
  const { data: estimates, error } = await supabase
    .from('estimates')
    .select(`
      id, 
      estimate_number,
      client_id,
      clients (
        id,
        name,
        email,
        phone
      )
    `)
    .order('created_at', { ascending: false })
    .limit(5);
    
  if (error) {
    console.error('❌ Error fetching estimates:', error);
    return null;
  }
  
  if (!estimates || estimates.length === 0) {
    console.log('❌ No estimates found');
    return null;
  }
  
  console.log(`✅ Found ${estimates.length} recent estimates:`);
  estimates.forEach(est => {
    const hasEmail = est.clients?.email ? '✅' : '❌';
    console.log(`   - #${est.estimate_number}: ${est.clients?.name} ${hasEmail} email: ${est.clients?.email || 'NO EMAIL'}`);
  });
  
  // Find estimate with client email
  const estimateWithEmail = estimates.find(est => est.clients?.email);
  if (!estimateWithEmail) {
    console.error('❌ No estimates have clients with email addresses!');
    console.log('   This is why email sending fails.');
  }
  
  return estimateWithEmail;
}

// Test Mailgun email
async function testMailgunEmail(toEmail, userId) {
  console.log('\n📧 Testing Mailgun Email...');
  console.log(`   Sending test email to: ${toEmail}`);
  
  try {
    // Try different function names
    const functionNames = ['send-email', 'mailgun-email', 'notifications'];
    
    for (const funcName of functionNames) {
      console.log(`   Trying function: ${funcName}`);
      
      const response = await supabase.functions.invoke(funcName, {
        body: {
          to: toEmail,
          subject: 'Test Email from Fixlify',
          html: '<h1>Test Email</h1><p>This is a test email to verify Mailgun integration.</p>',
          text: 'Test Email - This is a test email to verify Mailgun integration.',
          userId: userId,
          // For notifications function
          type: 'custom',
          data: {
            message: 'Test email from Fixlify'
          }
        }
      });
      
      if (response.error) {
        console.log(`   ❌ ${funcName} error:`, response.error.message);
        continue;
      }
      
      console.log(`   ✅ ${funcName} response:`, response.data);
      return true;
    }
    
    console.error('❌ No email function worked successfully');
    return false;
  } catch (error) {
    console.error('❌ Email test error:', error);
    return false;
  }
}

// Test Telnyx SMS
async function testTelnyxSMS(toPhone, userId) {
  console.log('\n📱 Testing Telnyx SMS...');
  console.log(`   Sending test SMS to: ${toPhone}`);
  
  try {
    const response = await supabase.functions.invoke('notifications', {
      body: {
        type: 'custom',
        phoneNumber: toPhone,
        data: {
          message: 'Test SMS from Fixlify - Your system is working!'
        },
        isTest: true,
        message: 'Test SMS from Fixlify - Your system is working!',
        userId: userId
      }
    });
    
    if (response.error) {
      console.error('❌ SMS error:', response.error.message);
      return false;
    }
    
    console.log('✅ SMS response:', response.data);
    return true;
  } catch (error) {
    console.error('❌ SMS test error:', error);
    return false;
  }
}

// Check communication logs
async function checkCommunicationLogs(userId) {
  console.log('\n📝 Checking Communication Logs...');
  
  const { data: logs, error } = await supabase
    .from('communication_logs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(10);
    
  if (error) {
    console.error('❌ Error fetching logs:', error);
    return;
  }
  
  if (!logs || logs.length === 0) {
    console.log('❌ No communication logs found');
    return;
  }
  
  console.log(`✅ Found ${logs.length} recent communication logs:`);
  logs.forEach(log => {
    const status = log.status === 'sent' ? '✅' : '❌';
    console.log(`   ${status} ${log.type} to ${log.recipient} - ${log.subject || log.message?.substring(0, 30)}`);
    if (log.error) console.log(`      Error: ${log.error}`);
  });
}

// Main test function
async function runAllTests() {
  console.log('Starting comprehensive email & SMS tests...\n');
  
  // Get current user
  const user = await getCurrentUser();
  if (!user) return;
  
  // Check edge functions
  await checkEdgeFunctions();
  
  // Check client data
  const client = await checkClientData();
  
  // Check estimate data
  const estimate = await checkEstimateData();
  
  // Test email if we have a client with email
  if (client && client.email) {
    await testMailgunEmail(client.email, user.id);
  } else {
    console.log('\n❌ Cannot test email - no clients with email addresses');
  }
  
  // Test SMS if we have a client with phone
  if (client && client.phone) {
    await testTelnyxSMS(client.phone, user.id);
  } else {
    console.log('\n❌ Cannot test SMS - no clients with phone numbers');
  }
  
  // Check communication logs
  await checkCommunicationLogs(user.id);
  
  console.log('\n=== Test Complete ===');
  console.log('\nNext steps:');
  console.log('1. If "Client email not found" - add emails to your clients');
  console.log('2. If edge functions not found - deploy them via Supabase CLI');
  console.log('3. If Mailgun fails - check API keys and domain in Supabase secrets');
  console.log('4. If Telnyx fails - check API keys in Supabase secrets');
}

// Run the tests
runAllTests().catch(console.error);

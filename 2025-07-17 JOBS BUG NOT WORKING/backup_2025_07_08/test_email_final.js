// Final Email Fix and Test Script
console.log('=== Email System Fix & Test ===\n');
console.log('✅ Edge functions deployed:');
console.log('   - mailgun-email (v42)');
console.log('   - send-estimate (v8)');
console.log('\nNow running comprehensive tests...\n');

const supabase = window.supabase;

// Step 1: Verify Authentication
async function verifyAuth() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    console.error('❌ Authentication failed:', error);
    return null;
  }
  console.log('✅ Authenticated as:', user.email);
  return user;
}

// Step 2: Check and Fix Client Emails
async function ensureClientsHaveEmails(userId) {
  console.log('\n📧 Checking client emails...');
  
  const { data: clientsNoEmail, error } = await supabase
    .from('clients')
    .select('id, name, phone')
    .is('email', null)
    .eq('user_id', userId);

  if (error) {
    console.error('❌ Error fetching clients:', error);
    return;
  }

  if (!clientsNoEmail || clientsNoEmail.length === 0) {
    console.log('✅ All clients have email addresses!');
    return;
  }

  console.log(`⚠️  Found ${clientsNoEmail.length} clients without email`);
  
  // Add demo emails
  for (const client of clientsNoEmail.slice(0, 5)) {
    const email = `${client.name.toLowerCase().replace(/\s+/g, '.')}@example.com`;
    console.log(`   Adding email to ${client.name}: ${email}`);
    
    await supabase
      .from('clients')
      .update({ email })
      .eq('id', client.id);
  }
  
  console.log('✅ Demo emails added to clients');
}

// Step 3: Test Direct Email Send
async function testDirectEmail(userId) {
  console.log('\n📨 Testing direct email send...');
  
  try {
    const { data, error } = await supabase.functions.invoke('mailgun-email', {
      body: {
        to: 'test@example.com',
        subject: 'Fixlify Email Test',
        html: '<h1>Test Successful!</h1><p>If you see this, email is working.</p>',
        text: 'Test Successful! If you see this, email is working.',
        userId: userId
      }
    });

    if (error) {
      console.error('❌ Direct email test failed:', error);
      console.log('\n⚠️  Possible issues:');
      console.log('1. Check Mailgun secrets in Supabase dashboard');
      console.log('2. Verify MAILGUN_API_KEY and MAILGUN_DOMAIN are set');
      console.log('3. Ensure Mailgun domain is verified');
      return false;
    }

    console.log('✅ Direct email test passed:', data);
    return true;
  } catch (err) {
    console.error('❌ Email test error:', err);
    return false;
  }
}

// Step 4: Test Estimate Send
async function testEstimateSend(userId) {
  console.log('\n📋 Testing estimate send...');
  
  // Get an estimate with client email
  const { data: estimate, error } = await supabase
    .from('estimates')
    .select(`
      id,
      estimate_number,
      total,
      clients!inner(
        id,
        name,
        email
      )
    `)
    .not('clients.email', 'is', null)
    .eq('user_id', userId)
    .limit(1)
    .single();

  if (error || !estimate) {
    console.log('❌ No estimate with client email found');
    return;
  }

  console.log(`✅ Found estimate #${estimate.estimate_number} for ${estimate.clients.name}`);
  console.log(`   Client email: ${estimate.clients.email}`);
  
  try {
    const { data, error } = await supabase.functions.invoke('send-estimate', {
      body: {
        estimateId: estimate.id,
        sendToClient: true,
        customMessage: 'This is a test estimate email from the fix script.'
      }
    });

    if (error) {
      console.error('❌ Estimate send failed:', error);
      return;
    }

    console.log('✅ Estimate sent successfully!');
    console.log('   Portal URL:', data.portalUrl);
    console.log('   Recipient:', data.recipient);
  } catch (err) {
    console.error('❌ Estimate send error:', err);
  }
}

// Step 5: Check Communication Logs
async function checkLogs(userId) {
  console.log('\n📝 Checking recent communication logs...');
  
  const { data: logs, error } = await supabase
    .from('communication_logs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(5);

  if (error) {
    console.error('❌ Error fetching logs:', error);
    return;
  }

  if (!logs || logs.length === 0) {
    console.log('❌ No communication logs found');
    return;
  }

  console.log(`✅ Found ${logs.length} recent logs:`);
  logs.forEach(log => {
    const status = log.status === 'sent' ? '✅' : '❌';
    const time = new Date(log.created_at).toLocaleString();
    console.log(`   ${status} ${log.type} to ${log.recipient} at ${time}`);
    if (log.error) console.log(`      Error: ${log.error}`);
  });
}

// Step 6: Show Next Steps
function showNextSteps(emailWorking) {
  console.log('\n=== Summary ===');
  
  if (emailWorking) {
    console.log('✅ Email system is working!');
    console.log('\nTo send estimates:');
    console.log('1. Ensure clients have email addresses');
    console.log('2. Click "Send" on any estimate');
    console.log('3. Choose email as the send method');
    console.log('4. Add optional custom message');
    console.log('5. Click Send');
  } else {
    console.log('❌ Email system needs configuration');
    console.log('\nRequired Supabase Secrets:');
    console.log('1. Go to: https://supabase.com/dashboard/project/mqppvcrlvsgrsqelglod/functions/secrets');
    console.log('2. Add these secrets:');
    console.log('   - MAILGUN_API_KEY: Your Mailgun API key');
    console.log('   - MAILGUN_DOMAIN: Your verified domain (e.g., mg.yourdomain.com)');
    console.log('   - MAILGUN_FROM_EMAIL: Default sender (optional)');
    console.log('\n3. After adding secrets, refresh and run this test again');
  }
}

// Main execution
async function runFullTest() {
  console.log('Starting comprehensive email system test...\n');
  
  // Step 1: Verify auth
  const user = await verifyAuth();
  if (!user) return;
  
  // Step 2: Ensure clients have emails
  await ensureClientsHaveEmails(user.id);
  
  // Step 3: Test direct email
  const emailWorking = await testDirectEmail(user.id);
  
  // Step 4: Test estimate send (only if email works)
  if (emailWorking) {
    await testEstimateSend(user.id);
  }
  
  // Step 5: Check logs
  await checkLogs(user.id);
  
  // Step 6: Show next steps
  showNextSteps(emailWorking);
}

// Run the test
runFullTest().catch(console.error);

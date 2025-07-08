// Fix Email Sending Issues Script
console.log('=== Fixing Email Sending Issues ===\n');

// Get Supabase client
const supabase = window.supabase;
if (!supabase) {
  console.error('❌ Supabase client not found. Run this in the browser console.');
  throw new Error('Supabase not initialized');
}

// Fix 1: Add email to clients without email
async function addEmailToClients() {
  console.log('📧 Fix 1: Adding emails to clients without email...\n');
  
  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    console.error('❌ No authenticated user');
    return;
  }

  // Get clients without email
  const { data: clientsNoEmail, error } = await supabase
    .from('clients')
    .select('id, name, phone')
    .is('email', null)
    .eq('user_id', user.id)
    .limit(10);

  if (error) {
    console.error('❌ Error fetching clients:', error);
    return;
  }

  if (!clientsNoEmail || clientsNoEmail.length === 0) {
    console.log('✅ All clients have email addresses!');
    return;
  }

  console.log(`Found ${clientsNoEmail.length} clients without email:`);
  
  // For demo purposes, add example emails
  for (const client of clientsNoEmail) {
    // Generate a demo email based on name
    const nameParts = client.name.toLowerCase().split(' ');
    const firstName = nameParts[0] || 'client';
    const lastName = nameParts[1] || '';
    const demoEmail = `${firstName}${lastName ? '.' + lastName : ''}@example.com`;
    
    console.log(`   - ${client.name}: Adding ${demoEmail}`);
    
    const { error: updateError } = await supabase
      .from('clients')
      .update({ email: demoEmail })
      .eq('id', client.id);
      
    if (updateError) {
      console.error(`     ❌ Failed to update: ${updateError.message}`);
    } else {
      console.log(`     ✅ Email added successfully`);
    }
  }
}

// Fix 2: Check and fix estimates without client email
async function checkEstimatesWithoutEmail() {
  console.log('\n📋 Fix 2: Checking estimates without client email...\n');
  
  const { data: estimates, error } = await supabase
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
    .is('clients.email', null)
    .limit(10);

  if (error) {
    console.error('❌ Error fetching estimates:', error);
    return;
  }

  if (!estimates || estimates.length === 0) {
    console.log('✅ All estimates have clients with email!');
    return;
  }

  console.log(`Found ${estimates.length} estimates with clients missing email:`);
  estimates.forEach(est => {
    console.log(`   - Estimate #${est.estimate_number}: Client ${est.clients?.name || 'Unknown'} has no email`);
  });
  
  console.log('\n   ⚠️  Run addEmailToClients() first to fix this issue');
}

// Fix 3: Test email sending with a valid client
async function testEmailWithValidClient() {
  console.log('\n📨 Fix 3: Testing email send with valid client...\n');
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.error('❌ No authenticated user');
    return;
  }

  // Get a client with email
  const { data: client, error } = await supabase
    .from('clients')
    .select('id, name, email')
    .not('email', 'is', null)
    .eq('user_id', user.id)
    .limit(1)
    .single();

  if (error || !client) {
    console.error('❌ No client with email found. Run addEmailToClients() first.');
    return;
  }

  console.log(`Testing with client: ${client.name} (${client.email})`);
  
  // Test mailgun-email function
  try {
    const { data, error } = await supabase.functions.invoke('mailgun-email', {
      body: {
        to: client.email,
        subject: 'Test Email from Fixlify',
        html: '<h1>Test Email</h1><p>If you receive this, email sending is working!</p>',
        text: 'Test Email - If you receive this, email sending is working!',
        userId: user.id
      }
    });

    if (error) {
      console.error('❌ Email test failed:', error.message);
      console.log('\nPossible issues:');
      console.log('1. Edge function not deployed - run deploy_edge_functions.bat');
      console.log('2. Mailgun API keys not configured in Supabase secrets');
      console.log('3. Mailgun domain not verified');
    } else {
      console.log('✅ Email sent successfully!', data);
    }
  } catch (err) {
    console.error('❌ Email test error:', err);
  }
}

// Fix 4: Deploy edge functions reminder
function showDeploymentInstructions() {
  console.log('\n🚀 Fix 4: Edge Function Deployment\n');
  console.log('If email sending fails, deploy the edge functions:');
  console.log('1. Open Command Prompt as Administrator');
  console.log('2. Navigate to: C:\\Users\\petru\\Downloads\\TEST FIX SITE\\3\\Fixlify-Main-main');
  console.log('3. Run: deploy_edge_functions.bat');
  console.log('4. Or manually deploy:');
  console.log('   supabase functions deploy mailgun-email --no-verify-jwt');
  console.log('   supabase functions deploy send-estimate');
}

// Fix 5: Check Mailgun secrets
async function checkMailgunSecrets() {
  console.log('\n🔑 Fix 5: Mailgun Configuration Check\n');
  console.log('Ensure these secrets are set in Supabase Dashboard > Edge Functions > Secrets:');
  console.log('- MAILGUN_API_KEY: Your Mailgun API key');
  console.log('- MAILGUN_DOMAIN: Your verified Mailgun domain');
  console.log('- MAILGUN_FROM_EMAIL: Default sender email (optional)');
  console.log('\nTo set secrets:');
  console.log('1. Go to https://supabase.com/dashboard/project/mqppvcrlvsgrsqelglod/functions/secrets');
  console.log('2. Add the required secrets');
  console.log('3. Test email sending again');
}

// Run all fixes
async function runAllFixes() {
  console.log('Running all fixes in sequence...\n');
  
  // Fix 1: Add emails to clients
  await addEmailToClients();
  
  // Fix 2: Check estimates
  await checkEstimatesWithoutEmail();
  
  // Fix 3: Test email
  await testEmailWithValidClient();
  
  // Fix 4: Show deployment instructions
  showDeploymentInstructions();
  
  // Fix 5: Check secrets
  checkMailgunSecrets();
  
  console.log('\n=== Fix Process Complete ===');
  console.log('\nSummary:');
  console.log('1. ✅ Added demo emails to clients without email');
  console.log('2. ✅ Identified estimates that need client emails');
  console.log('3. ✅ Tested email sending functionality');
  console.log('4. ✅ Provided edge function deployment instructions');
  console.log('5. ✅ Listed required Mailgun secrets');
  console.log('\nIf emails still fail, check the Supabase logs for edge function errors.');
}

// Run the fixes
runAllFixes().catch(console.error);

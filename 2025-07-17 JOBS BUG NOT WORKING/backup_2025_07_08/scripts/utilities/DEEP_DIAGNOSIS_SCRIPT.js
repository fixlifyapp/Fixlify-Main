// DEEP DIAGNOSIS AND FIX SCRIPT
// Copy and paste this entire script

(async function() {
  console.clear();
  console.log('🔍 DEEP SYSTEM DIAGNOSIS');
  console.log('========================\n');

  // 1. Check RLS Policies
  console.log('1️⃣ Checking Database Permissions (RLS)...');
  
  const tables = [
    'telnyx_phone_numbers',
    'estimate_communications', 
    'invoice_communications',
    'communication_logs',
    'mailgun_domains'
  ];
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase.from(table).select('*').limit(1);
      if (error) {
        console.error(`❌ ${table}: ${error.message}`);
        if (error.message.includes('denied')) {
          console.log(`   → RLS policy issue on ${table}`);
        }
      } else {
        console.log(`✅ ${table}: Accessible`);
      }
    } catch (e) {}
  }

  // 2. Check Service Role vs Anon Key
  console.log('\n2️⃣ Edge Function Authentication Issue...');
  console.log('The edge functions might be using anon key instead of service role key.');
  console.log('This would cause permission issues when trying to insert logs.');
  
  // 3. Test Direct Database Insert
  console.log('\n3️⃣ Testing Direct Database Access...');
  
  try {
    const testLog = {
      communication_type: 'email',
      status: 'test',
      recipient: 'test@test.com',
      subject: 'Debug Test',
      content: 'Testing database access'
    };
    
    const { error } = await supabase
      .from('communication_logs')
      .insert(testLog);
    
    if (error) {
      console.error('❌ Cannot insert to communication_logs:', error.message);
      console.log('   → This is likely why edge functions fail!');
    } else {
      console.log('✅ Can insert to communication_logs');
    }
  } catch (e) {
    console.error('❌ Exception:', e);
  }

  // 4. Check if edge functions need redeployment
  console.log('\n4️⃣ Edge Functions Status...');
  console.log('Your edge functions might be using old code or configuration.');
  console.log('They were last deployed:');
  console.log('- mailgun-email: 2025-07-07 10:05:51');
  console.log('- send-invoice: 2025-07-07 11:23:22');
  console.log('- send-estimate: 2025-07-07 11:23:31');
  
  // 5. Test with service role (if available)
  console.log('\n5️⃣ Potential Fixes:');
  console.log(`
1. REDEPLOY ALL EMAIL/SMS FUNCTIONS:
   supabase functions deploy mailgun-email
   supabase functions deploy send-invoice
   supabase functions deploy send-estimate
   supabase functions deploy telnyx-sms
   supabase functions deploy send-invoice-sms
   supabase functions deploy send-estimate-sms

2. CHECK RLS POLICIES:
   Go to Supabase Dashboard > Database > Tables
   Check RLS policies for:
   - estimate_communications
   - invoice_communications
   - communication_logs
   
3. VERIFY MAILGUN DOMAIN:
   The API key might be valid but for wrong domain.
   Check if key is for: mg.fixlify.com
   
4. CHECK EDGE FUNCTION LOGS:
   supabase functions logs mailgun-email --tail
   supabase functions logs send-invoice --tail
  `);

  // 6. Test simplified email
  console.log('\n6️⃣ Testing Simplified Email Call...');
  
  try {
    const { data, error } = await supabase.functions.invoke('mailgun-email', {
      body: {
        to: 'test@example.com',
        subject: 'Test',
        text: 'Test message'
      }
    });
    
    console.log('Response:', error || data);
    
    if (error?.message?.includes('non-2xx')) {
      console.log('\n🔴 The edge function is returning an error.');
      console.log('This means the function code is executing but failing.');
      console.log('Likely causes:');
      console.log('- Wrong Mailgun domain in the function');
      console.log('- Database write permissions');
      console.log('- Missing required fields');
    }
  } catch (e) {}

  // 7. Quick deployment script
  console.log('\n7️⃣ QUICK FIX - Run these commands:');
  console.log('```bash');
  console.log('# Redeploy all communication functions');
  console.log('cd "C:\\Users\\petru\\Downloads\\TEST FIX SITE\\3\\Fixlify-Main-main"');
  console.log('supabase functions deploy mailgun-email');
  console.log('supabase functions deploy send-invoice');
  console.log('supabase functions deploy send-estimate');
  console.log('supabase functions deploy telnyx-sms');
  console.log('```');

})();

// Create a batch file for redeployment
window.createRedeployScript = function() {
  const script = `@echo off
echo Redeploying Communication Edge Functions...
cd /d "C:\\Users\\petru\\Downloads\\TEST FIX SITE\\3\\Fixlify-Main-main"

echo.
echo Deploying mailgun-email...
supabase functions deploy mailgun-email

echo.
echo Deploying send-invoice...
supabase functions deploy send-invoice

echo.
echo Deploying send-estimate...
supabase functions deploy send-estimate

echo.
echo Deploying telnyx-sms...
supabase functions deploy telnyx-sms

echo.
echo Deploying send-invoice-sms...
supabase functions deploy send-invoice-sms

echo.
echo Deploying send-estimate-sms...
supabase functions deploy send-estimate-sms

echo.
echo All functions redeployed!
pause`;

  console.log('\n📄 Batch file content for redeployment:');
  console.log(script);
  console.log('\nSave this as redeploy_comm_functions.bat and run it');
};

// Check Supabase dashboard
window.openSupabaseTables = function() {
  window.open('https://supabase.com/dashboard/project/mqppvcrlvsgrsqelglod/database/tables', '_blank');
};

window.openSupabaseLogs = function() {
  window.open('https://supabase.com/dashboard/project/mqppvcrlvsgrsqelglod/functions', '_blank');
};

console.log('\n🔧 Quick Actions:');
console.log('- createRedeployScript() - Get redeployment script');
console.log('- openSupabaseTables() - Check RLS policies');
console.log('- openSupabaseLogs() - View function logs');

// COMPREHENSIVE SECRETS AND EDGE FUNCTION CHECK
// Copy and paste this entire script

(async function() {
  console.clear();
  console.log('🔍 INVESTIGATING SECRETS AND EDGE FUNCTION ISSUES');
  console.log('=================================================\n');

  // 1. Check current environment
  console.log('1️⃣ Environment Check:');
  console.log('   App URL:', window.location.origin);
  console.log('   Supabase URL:', supabase.supabaseUrl);
  console.log('   Anon Key:', supabase.supabaseKey?.substring(0, 20) + '...');

  // 2. Check how send dialogs work
  console.log('\n2️⃣ Checking Send Dialog Integration:');
  
  // Look for UniversalSendDialog usage
  const dialogTest = `
  The send estimate/invoice dialogs use these components:
  - UniversalSendDialog (UI component)
  - useDocumentSending hook (calls edge functions)
  - Edge functions: send-invoice, send-estimate, send-invoice-sms, send-estimate-sms
  `;
  console.log(dialogTest);

  // 3. Test edge function calls with different methods
  console.log('\n3️⃣ Testing Edge Function Calls:');
  
  // Test 1: Direct minimal call
  console.log('\n📌 Test 1: Minimal call to mailgun-email...');
  try {
    const { data, error } = await supabase.functions.invoke('mailgun-email', {
      body: { test: true }
    });
    console.log('Response:', error ? `❌ ${error.message}` : '✅ Success', data);
  } catch (e) {
    console.error('Exception:', e.message);
  }

  // Test 2: Call with auth header
  console.log('\n📌 Test 2: Call with explicit auth...');
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const { data, error } = await supabase.functions.invoke('mailgun-email', {
      body: { test: true },
      headers: {
        Authorization: `Bearer ${session?.access_token}`
      }
    });
    console.log('Response:', error ? `❌ ${error.message}` : '✅ Success', data);
  } catch (e) {
    console.error('Exception:', e.message);
  }

  // 4. Check secrets configuration
  console.log('\n4️⃣ Secrets Configuration in Supabase:');
  console.log(`
  Secrets might not be accessible because:
  
  1. They weren't set with the correct command:
     ❌ WRONG: supabase secrets set TELNYX_API_KEY=your_key
     ✅ RIGHT: supabase secrets set TELNYX_API_KEY=your_key --project-ref mqppvcrlvsgrsqelglod
  
  2. They were set but not deployed:
     - After setting secrets, functions might need redeployment
     - Or wait a few minutes for propagation
  
  3. Wrong environment (local vs production):
     - Secrets set locally don't affect production
     - Need to set them for the specific project
  `);

  // 5. Check actual function response details
  console.log('\n5️⃣ Detailed Function Response Check:');
  
  // Test send-invoice function
  console.log('\n📌 Testing send-invoice edge function...');
  try {
    const { data, error } = await supabase.functions.invoke('send-invoice', {
      body: { 
        test: true,
        invoiceId: 'test-id'
      }
    });
    
    if (error) {
      console.error('❌ send-invoice error:', error);
      // Check if it's a 500 error (server error) vs 401 (auth error)
      if (error.message.includes('500')) {
        console.log('   This is a server error - likely missing API keys');
      } else if (error.message.includes('401')) {
        console.log('   This is an auth error - API key is invalid');
      }
    } else {
      console.log('✅ send-invoice response:', data);
    }
  } catch (e) {
    console.error('Exception:', e);
  }

  // 6. Check dialog connection
  console.log('\n6️⃣ Send Dialog Connection:');
  console.log('Checking if UniversalSendDialog is properly connected...');
  
  // Check if the dialog component exists
  if (window.React && window.React.version) {
    console.log('✅ React is loaded, version:', window.React.version);
  }
  
  // Look for the send dialog in the DOM
  const dialogElements = document.querySelectorAll('[role="dialog"]');
  console.log('Dialog elements found:', dialogElements.length);

  // 7. Direct API key test
  console.log('\n7️⃣ Testing if we can see environment info:');
  try {
    // Try to get function details
    const functionsUrl = `${supabase.supabaseUrl}/functions/v1/mailgun-email`;
    console.log('Function URL:', functionsUrl);
    
    // The actual secrets are not accessible from frontend
    console.log('Note: Secrets are only accessible inside edge functions, not from browser');
  } catch (e) {}

  // 8. Provide solution steps
  console.log('\n✅ SOLUTION STEPS:');
  console.log('===================');
  console.log(`
1. First, check secrets are set correctly:
   In your terminal, run:
   supabase secrets list --project-ref mqppvcrlvsgrsqelglod

2. If not listed, set them:
   supabase secrets set TELNYX_API_KEY="YOUR_KEY" --project-ref mqppvcrlvsgrsqelglod
   supabase secrets set MAILGUN_API_KEY="YOUR_KEY" --project-ref mqppvcrlvsgrsqelglod

3. If already set, try unset and reset:
   supabase secrets unset TELNYX_API_KEY --project-ref mqppvcrlvsgrsqelglod
   supabase secrets set TELNYX_API_KEY="YOUR_KEY" --project-ref mqppvcrlvsgrsqelglod

4. Check in Supabase Dashboard:
   Go to: https://supabase.com/dashboard/project/mqppvcrlvsgrsqelglod/settings/vault
   You should see your secrets listed there

5. Redeploy the affected functions:
   supabase functions deploy mailgun-email --project-ref mqppvcrlvsgrsqelglod
   supabase functions deploy telnyx-sms --project-ref mqppvcrlvsgrsqelglod
  `);

  // 9. Test the actual send dialog flow
  console.log('\n9️⃣ Testing Send Dialog Flow:');
  
  // Check if we can find the useDocumentSending hook
  console.log('The send flow goes: UniversalSendDialog → useDocumentSending → Edge Function');
  console.log('The error "non-2xx status code" means the edge function is returning an error');
  console.log('This is usually because the API keys are not accessible to the function');

})();

// Helper to check Supabase dashboard
window.openSupabaseSecrets = function() {
  console.log('\n🔗 Opening Supabase Secrets page...');
  window.open('https://supabase.com/dashboard/project/mqppvcrlvsgrsqelglod/settings/vault', '_blank');
};

// Helper to test with real document
window.testRealInvoice = async function() {
  console.log('\n📄 Testing with real invoice...');
  
  try {
    // Get a real invoice
    const { data: invoices, error } = await supabase
      .from('invoices')
      .select('*')
      .limit(1)
      .single();
    
    if (error || !invoices) {
      console.error('❌ No invoice found');
      return;
    }
    
    console.log('Found invoice:', invoices.invoice_number);
    
    // Try to send it
    const { data, error: sendError } = await supabase.functions.invoke('send-invoice', {
      body: {
        invoiceId: invoices.id,
        sendToClient: true
      }
    });
    
    if (sendError) {
      console.error('❌ Send failed:', sendError);
      
      // Parse error details
      if (sendError.message.includes('MAILGUN_API_KEY')) {
        console.log('→ Mailgun API key is not configured in edge function');
      } else if (sendError.message.includes('500')) {
        console.log('→ Server error - check edge function logs');
      }
    } else {
      console.log('✅ Send successful:', data);
    }
  } catch (e) {
    console.error('Exception:', e);
  }
};

console.log('\n💡 Quick Actions:');
console.log('- openSupabaseSecrets() - Open Supabase vault in browser');
console.log('- testRealInvoice() - Test sending a real invoice');

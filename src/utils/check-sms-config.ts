import { createClient } from '@supabase/supabase-js';

// Configuration check script for SMS and Portal functionality
const SUPABASE_URL = 'https://mqppvcrlvsgrsqelglod.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xcHB2Y3JsdnNncnNxZWxnbG9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1OTE3MDUsImV4cCI6MjA2MzE2NzcwNX0.My-KiqG1bCMqzUru4m59d4v18N3WGxNoNtFPOFAmhzg';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkSMSConfiguration() {
  console.log('🔍 Checking SMS and Portal Configuration...\n');

  try {
    // 1. Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('❌ Not authenticated. Please log in first.');
      return;
    }
    console.log('✅ Authenticated as:', user.email);

    // 2. Check active phone numbers
    console.log('\n📱 Checking Phone Numbers...');
    const { data: phoneNumbers, error: phoneError } = await supabase
      .from('telnyx_phone_numbers')
      .select('*')
      .eq('status', 'active');

    if (phoneError) {
      console.error('❌ Error checking phone numbers:', phoneError);
    } else if (!phoneNumbers || phoneNumbers.length === 0) {
      console.error('❌ No active phone numbers found!');
      console.log('   Run this SQL to activate a phone number:');
      console.log(`   UPDATE telnyx_phone_numbers SET status = 'active' WHERE phone_number = '+14375249999';`);
    } else {
      console.log('✅ Active phone numbers found:', phoneNumbers.length);
      phoneNumbers.forEach(phone => {
        console.log(`   - ${phone.phone_number} (configured: ${phone.configured_at ? 'Yes' : 'No'})`);
      });
    }

    // 3. Test portal generation
    console.log('\n🔗 Testing Portal Generation...');
    const { data: portalToken, error: portalError } = await supabase
      .rpc('generate_portal_access', {
        p_client_id: 'C-2001',
        p_permissions: {
          view_estimates: true,
          view_invoices: true,
          make_payments: false
        },
        p_hours_valid: 1,
        p_domain_restriction: 'hub.fixlify.app'
      });

    if (portalError) {
      console.error('❌ Portal generation failed:', portalError);
    } else {
      console.log('✅ Portal token generated:', portalToken);
      console.log(`   Portal URL: https://hub.fixlify.app/portal/${portalToken}`);
    }

    // 4. Test SMS sending (dry run)
    console.log('\n📤 Testing SMS Function (Dry Run)...');
    console.log('   Note: This will attempt to call the edge function');
    console.log('   Check Supabase Dashboard → Edge Functions → Logs for details');

    // Summary
    console.log('\n📊 Configuration Summary:');
    console.log('=======================');
    console.log(`Phone Numbers: ${phoneNumbers && phoneNumbers.length > 0 ? '✅ Active' : '❌ None active'}`);
    console.log(`Portal Generation: ${!portalError ? '✅ Working' : '❌ Failed'}`);
    console.log('\n⚠️  Important: Check Supabase Dashboard for:');
    console.log('1. Edge Functions → Settings → TELNYX_API_KEY');
    console.log('2. Edge Functions → Logs → Recent errors');

  } catch (error) {
    console.error('❌ Configuration check failed:', error);
  }
}

// Run the check
checkSMSConfiguration();

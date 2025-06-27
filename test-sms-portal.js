// Test script to verify SMS and portal functionality
const { createClient } = require('@supabase/supabase-js');

// Replace these with your actual values
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
const SUPABASE_SERVICE_KEY = 'YOUR_SUPABASE_SERVICE_KEY';

async function testPortalAndSMS() {
  console.log('🧪 Testing Portal and SMS functionality...\n');

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  try {
    // 1. Check Telnyx phone numbers
    console.log('1️⃣ Checking Telnyx phone numbers...');
    const { data: phoneNumbers, error: phoneError } = await supabase
      .from('telnyx_phone_numbers')
      .select('*')
      .eq('status', 'active');

    if (phoneError) {
      console.error('❌ Error checking phone numbers:', phoneError);
    } else {
      console.log('✅ Active phone numbers:', phoneNumbers?.length || 0);
      if (phoneNumbers?.length > 0) {
        console.log('   Phone:', phoneNumbers[0].phone_number);
      }
    }

    // 2. Test portal access generation
    console.log('\n2️⃣ Testing portal access generation...');
    const { data: portalToken, error: portalError } = await supabase
      .rpc('generate_portal_access', {
        p_client_id: 'C-2001',
        p_permissions: {
          view_estimates: true,
          view_invoices: true,
          make_payments: false
        },
        p_hours_valid: 72,
        p_domain_restriction: 'hub.fixlify.app'
      });

    if (portalError) {
      console.error('❌ Error generating portal token:', portalError);
    } else {
      console.log('✅ Portal token generated:', portalToken);
      console.log('   Portal URL: https://hub.fixlify.app/portal/' + portalToken);
    }

    // 3. Check recent portal access tokens
    console.log('\n3️⃣ Checking recent portal access tokens...');
    const { data: recentTokens, error: tokenError } = await supabase
      .from('client_portal_access')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (tokenError) {
      console.error('❌ Error checking tokens:', tokenError);
    } else {
      console.log('✅ Recent tokens found:', recentTokens?.length || 0);
      recentTokens?.forEach(token => {
        console.log(`   Token: ${token.access_token.substring(0, 10)}... for client ${token.client_id}`);
      });
    }

    // 4. Check if Telnyx API key is configured
    console.log('\n4️⃣ Checking Telnyx configuration...');
    // This would need to check environment variables on the server
    console.log('⚠️  Telnyx API key needs to be checked in Supabase edge function environment');

    // 5. Check recent messages
    console.log('\n5️⃣ Checking recent messages...');
    const { data: messages, error: msgError } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (msgError) {
      console.error('❌ Error checking messages:', msgError);
    } else {
      console.log('✅ Recent messages found:', messages?.length || 0);
    }

    // 6. Check estimate communications
    console.log('\n6️⃣ Checking estimate communications...');
    const { data: comms, error: commError } = await supabase
      .from('estimate_communications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (commError) {
      console.error('❌ Error checking communications:', commError);
    } else {
      console.log('✅ Recent communications found:', comms?.length || 0);
    }

    console.log('\n📊 Summary:');
    console.log('- Active phone numbers:', phoneNumbers?.length > 0 ? '✅' : '❌');
    console.log('- Portal token generation:', !portalError ? '✅' : '❌');
    console.log('- Portal tokens created:', recentTokens?.length > 0 ? '✅' : '⚠️');
    console.log('- Messages stored:', messages?.length > 0 ? '✅' : '⚠️');

    console.log('\n💡 Next steps:');
    console.log('1. Ensure TELNYX_API_KEY is set in Supabase edge function environment');
    console.log('2. Verify the portal domain (hub.fixlify.app) is correctly configured');
    console.log('3. Test sending an actual SMS through the UI');
    console.log('4. Check Supabase edge function logs for any errors');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testPortalAndSMS();

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mqppvcrlvsgrsqelglod.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xcHB2Y3JsdnNncnNxZWxnbG9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1OTE3MDUsImV4cCI6MjA2MzE2NzcwNX0.My-KiqG1bCMqzUru4m59d4v18N3WGxNoNtFPOFAmhzg';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkTelnyxNumbers() {
  console.log('🔍 Checking Telnyx Phone Numbers...\n');

  try {
    // First, check database records
    const { data: dbNumbers, error: dbError } = await supabase
      .from('telnyx_phone_numbers')
      .select('*')
      .order('purchased_at', { ascending: false });

    if (dbError) {
      console.error('❌ Error fetching from database:', dbError);
      return;
    }

    console.log(`📊 Database Records: ${dbNumbers?.length || 0} numbers found\n`);
    
    if (dbNumbers && dbNumbers.length > 0) {
      console.log('📱 Phone Numbers in Database:');
      console.log('━'.repeat(80));
      
      dbNumbers.forEach((number, index) => {
        console.log(`\n${index + 1}. ${number.phone_number}`);
        console.log(`   Status: ${number.status || 'Unknown'}`);
        console.log(`   Area Code: ${number.area_code || 'N/A'}`);
        console.log(`   Monthly Cost: $${number.monthly_cost || '0.00'}`);
        console.log(`   AI Dispatcher: ${number.ai_dispatcher_enabled ? 'Enabled' : 'Disabled'}`);
        console.log(`   Purchased: ${number.purchased_at || 'Unknown'}`);
        console.log(`   Configured: ${number.configured_at || 'Not configured'}`);
      });
    }

    console.log('\n' + '━'.repeat(80));
    
    // Now try to verify with Telnyx API
    console.log('\n🔄 Attempting to verify with Telnyx API...\n');
    
    const { data: authData, error: authError } = await supabase.auth.getSession();
    
    if (authError || !authData.session) {
      console.log('⚠️  No active session. Please log in to verify Telnyx numbers.');
      return;
    }

    // Try to call the Telnyx verification function
    const { data: telnyxData, error: telnyxError } = await supabase.functions.invoke('test-telnyx-connection', {
      headers: {
        Authorization: `Bearer ${authData.session.access_token}`
      }
    });

    if (telnyxError) {
      console.log('⚠️  Could not verify with Telnyx API:', telnyxError.message);
      console.log('    This might mean:');
      console.log('    - Telnyx API credentials are not configured');
      console.log('    - Network connectivity issues');
      console.log('    - API rate limiting');
    } else if (telnyxData) {
      console.log('✅ Telnyx API Connection Status:');
      console.log(JSON.stringify(telnyxData, null, 2));
    }

    // Summary
    console.log('\n' + '═'.repeat(80));
    console.log('📊 SUMMARY:');
    console.log('═'.repeat(80));
    
    const activeNumbers = dbNumbers?.filter(n => n.status === 'active') || [];
    const availableNumbers = dbNumbers?.filter(n => n.status === 'available') || [];
    const configuredNumbers = dbNumbers?.filter(n => n.configured_at) || [];
    
    console.log(`\n✅ Total Numbers: ${dbNumbers?.length || 0}`);
    console.log(`✅ Active Numbers: ${activeNumbers.length}`);
    console.log(`✅ Available Numbers: ${availableNumbers.length}`);
    console.log(`✅ Configured Numbers: ${configuredNumbers.length}`);
    
    console.log('\n📱 Active Phone Numbers:');
    activeNumbers.forEach(n => {
      console.log(`   - ${n.phone_number} (Area: ${n.area_code}, Cost: $${n.monthly_cost}/mo)`);
    });
    
    console.log('\n💡 Notes:');
    console.log('   - These are the numbers stored in your Supabase database');
    console.log('   - To verify they are real Telnyx numbers, API credentials must be configured');
    console.log('   - Numbers with "active" status should be working and ready to use');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the check
checkTelnyxNumbers();

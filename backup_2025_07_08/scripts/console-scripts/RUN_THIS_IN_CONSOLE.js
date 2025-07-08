// Copy this to browser console while on http://localhost:8083

(async function() {
  console.clear();
  console.log('🔍 RUNNING DEEP SYSTEM DIAGNOSIS');
  console.log('================================\n');

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
        console.log(`✅ ${table}: Accessible (${data ? data.length : 0} records)`);
      }
    } catch (e) {
      console.error(`❌ ${table}: Exception - ${e.message}`);
    }
  }

  // 2. Test Direct Database Insert
  console.log('\n2️⃣ Testing Direct Database Write Access...');
  
  const testTables = [
    {
      table: 'communication_logs',
      data: {
        communication_type: 'email',
        status: 'test',
        recipient: 'test@test.com',
        subject: 'Debug Test',
        content: 'Testing database access'
      }
    },
    {
      table: 'estimate_communications',
      data: {
        estimate_id: '00000000-0000-0000-0000-000000000000',
        communication_type: 'email',
        status: 'test',
        recipient: 'test@test.com'
      }
    }
  ];
  
  for (const test of testTables) {
    try {
      const { error } = await supabase.from(test.table).insert(test.data);
      
      if (error) {
        console.error(`❌ Cannot INSERT to ${test.table}:`, error.message);
        console.log(`   → ${error.code}: ${error.details || 'No details'}`);
      } else {
        console.log(`✅ Can INSERT to ${test.table}`);
        // Clean up test data
        await supabase.from(test.table).delete().eq('recipient', 'test@test.com');
      }
    } catch (e) {
      console.error(`❌ ${test.table} Exception:`, e.message);
    }
  }

  console.log('\n✅ Diagnosis Complete!');
  console.log('If you see RLS errors above, that\'s the issue!');
})();
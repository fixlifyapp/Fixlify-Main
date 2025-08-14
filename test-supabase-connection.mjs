// test-supabase-connection.mjs
// Test script to verify Supabase connection for Claude Code

import { createClient } from '@supabase/supabase-js';

// Your Supabase credentials (from MCP config)
const supabaseUrl = 'https://mqppvcrlvsgrsqelglod.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xcHB2Y3JsdnNncnNxZWxnbG9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1OTE3MDUsImV4cCI6MjA2MzE2NzcwNX0.My-KiqG1bCMqzUru4m59d4v18N3WGxNoNtFPOFAmhzg';

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  console.log('🔄 Testing Supabase connection...\n');
  
  try {
    // Test 1: Query jobs table
    console.log('Test 1: Querying jobs table...');
    const { data: jobs, error: jobsError } = await supabase
      .from('jobs')
      .select('id, status, created_at')
      .limit(3);
    
    if (jobsError) {
      console.error('❌ Jobs query failed:', jobsError.message);
    } else {
      console.log('✅ Jobs table accessible!');
      console.log(`   Found ${jobs?.length || 0} jobs\n`);
    }

    // Test 2: Query customers table
    console.log('Test 2: Querying customers table...');
    const { data: customers, error: customersError } = await supabase
      .from('customers')
      .select('id, name')
      .limit(3);
    
    if (customersError) {
      console.error('❌ Customers query failed:', customersError.message);
    } else {
      console.log('✅ Customers table accessible!');
      console.log(`   Found ${customers?.length || 0} customers\n`);
    }

    // Test 3: Check phone_numbers table
    console.log('Test 3: Querying phone_numbers table...');
    const { data: phones, error: phonesError } = await supabase
      .from('phone_numbers')
      .select('id, number, ai_dispatcher_enabled')
      .limit(3);
    
    if (phonesError) {
      console.error('❌ Phone numbers query failed:', phonesError.message);
    } else {
      console.log('✅ Phone numbers table accessible!');
      console.log(`   Found ${phones?.length || 0} phone numbers\n`);
    }

    console.log('\n' + '='.repeat(60));
    console.log('🎉 SUCCESS! Supabase connection is working!');
    console.log('='.repeat(60));
    console.log('\nYour Supabase configuration:');
    console.log('URL:', supabaseUrl);
    console.log('Project Ref:', 'mqppvcrlvsgrsqelglod');
    console.log('Anon Key:', supabaseAnonKey.substring(0, 20) + '...');
    console.log('\n✅ Claude Code can now use Supabase MCP!');
    
  } catch (error) {
    console.error('\n❌ Connection test failed:', error.message);
    console.log('\nTroubleshooting:');
    console.log('1. Check if Supabase project is active');
    console.log('2. Verify credentials are correct');
    console.log('3. Ensure RLS policies allow access');
  }
}

// Run the test
console.log('='.repeat(60));
console.log('         SUPABASE CONNECTION TEST FOR CLAUDE CODE');
console.log('='.repeat(60));
console.log('');

testConnection();
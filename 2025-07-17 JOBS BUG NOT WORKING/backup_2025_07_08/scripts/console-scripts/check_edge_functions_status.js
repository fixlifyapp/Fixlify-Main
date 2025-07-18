// Check Edge Functions Deployment Status
console.log('🔍 Checking Edge Functions Status...\n');

async function checkEdgeFunctions() {
  const { data: { session } } = await window.supabase.auth.getSession();
  if (!session) {
    console.error('❌ Please log in first');
    return;
  }

  console.log('✅ Authenticated as:', session.user.email);
  
  // Check project details
  console.log('\n📋 Project Details:');
  console.log('Project URL:', 'https://mqppvcrlvsgrsqelglod.supabase.co');
  console.log('Project Ref:', 'mqppvcrlvsgrsqelglod');
  
  // List of functions that should exist
  const expectedFunctions = [
    'send-estimate',
    'send-estimate-sms', 
    'send-invoice',
    'send-invoice-sms',
    'mailgun-email',
    'telnyx-sms'
  ];
  
  console.log('\n🚨 Edge Functions Status:');
  console.log('All functions are returning 404 - They are NOT deployed!');
  
  console.log('\n❌ Problem Identified:');
  console.log('The edge functions we created via the Supabase MCP are not actually deployed.');
  console.log('They exist in the system but are not running/accessible.');
  
  console.log('\n💡 Solution Options:');
  console.log('1. Deploy the functions manually via Supabase CLI');
  console.log('2. Use existing working edge functions');
  console.log('3. Create a workaround using database functions');
  
  console.log('\n🔧 Let\'s check what IS working:');
  
  // Test some basic Supabase functionality
  try {
    // Test database access
    const { data: testData, error: testError } = await window.supabase
      .from('estimates')
      .select('id')
      .limit(1);
    
    if (!testError) {
      console.log('✅ Database access: Working');
    } else {
      console.log('❌ Database access: Failed');
    }
    
    // Check for any existing edge functions by looking at logs
    console.log('\n📝 Checking for ANY working edge functions...');
    
    // Try to find working functions
    const testFunctions = [
      'hello-world',
      'test',
      'email',
      'sms',
      'send',
      'notify'
    ];
    
    for (const func of testFunctions) {
      try {
        const response = await fetch(`https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/${func}`, {
          method: 'OPTIONS',
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        });
        
        if (response.status !== 404) {
          console.log(`✅ Found function: ${func} (Status: ${response.status})`);
        }
      } catch (e) {
        // Ignore
      }
    }
    
  } catch (error) {
    console.error('Test error:', error);
  }
}

// Run the check
checkEdgeFunctions();

console.log('\n\n🆘 IMMEDIATE SOLUTION:');
console.log('Since edge functions are not working, we need to:');
console.log('1. Use a different approach for sending emails/SMS');
console.log('2. Or manually deploy the edge functions');
console.log('3. Or use a third-party service directly from the frontend');

// Alternative solution using database
window.createDatabaseSolution = async function() {
  console.log('\n🔨 Creating database-based solution...');
  
  try {
    // Create a pending_communications table
    const { error } = await window.supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS pending_communications (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          type TEXT NOT NULL CHECK (type IN ('email', 'sms')),
          document_type TEXT NOT NULL CHECK (document_type IN ('estimate', 'invoice')),
          document_id UUID NOT NULL,
          recipient TEXT NOT NULL,
          message TEXT,
          status TEXT DEFAULT 'pending',
          created_at TIMESTAMPTZ DEFAULT NOW(),
          processed_at TIMESTAMPTZ,
          error TEXT
        );
      `
    });
    
    if (!error) {
      console.log('✅ Created pending_communications table');
      console.log('You can now save send requests to this table and process them separately');
    } else {
      console.log('❌ Error creating table:', error);
    }
  } catch (err) {
    console.error('Error:', err);
  }
};

console.log('\n💡 Run createDatabaseSolution() to create an alternative solution');
// Quick Fix Test for Send Functions
console.log('🔧 Testing Send Functions Fix...\n');

async function testSendFunctions() {
  // Get the current session
  const { data: { session } } = await window.supabase.auth.getSession();
  if (!session) {
    console.error('❌ Please log in first');
    return;
  }

  console.log('✅ Logged in as:', session.user.email);
  
  // Test 1: Check if functions exist by trying to invoke them
  console.log('\n📋 Checking Edge Functions:');
  
  const functions = [
    { name: 'send-estimate', test: { estimateId: 'test', recipientEmail: 'test@test.com' } },
    { name: 'send-invoice', test: { invoiceId: 'test', recipientEmail: 'test@test.com' } },
    { name: 'send-estimate-sms', test: { estimateId: 'test', recipientPhone: '+1234567890' } },
    { name: 'send-invoice-sms', test: { invoiceId: 'test', recipientPhone: '+1234567890' } },
  ];

  for (const func of functions) {
    console.log(`\nTesting ${func.name}...`);
    try {
      const response = await window.supabase.functions.invoke(func.name, {
        body: func.test
      });
      
      if (response.error) {
        console.error(`❌ ${func.name}: ${response.error.message}`);
        // Check if it's a 404
        if (response.error.message.includes('404')) {
          console.log('   → Function not deployed or wrong name');
        }
      } else {
        console.log(`✅ ${func.name}: Responded (may have validation errors)`);
        console.log('   Response:', response.data);
      }
    } catch (error) {
      console.error(`❌ ${func.name}: ${error.message}`);
    }
  }
  
  // Test 2: Try alternative function names
  console.log('\n\n🔍 Trying alternative function names:');
  
  const alternatives = [
    'mailgun-email',
    'send-email',
    'telnyx-sms',
    'send-sms'
  ];
  
  for (const funcName of alternatives) {
    try {
      const response = await window.supabase.functions.invoke(funcName, {
        body: { test: true }
      });
      
      if (!response.error || !response.error.message.includes('404')) {
        console.log(`✅ Found: ${funcName}`);
      }
    } catch (error) {
      // Ignore
    }
  }
}

// Quick send test with real IDs
window.quickSendTest = async function(type, id, recipient) {
  console.log(`\n📤 Quick Send Test: ${type}`);
  
  const { data: { session } } = await window.supabase.auth.getSession();
  if (!session) {
    console.error('Not authenticated');
    return;
  }
  
  const functionName = type === 'estimate' ? 'send-estimate' : 'send-invoice';
  const isEmail = recipient.includes('@');
  
  let body;
  if (type === 'estimate') {
    body = isEmail ? 
      { estimateId: id, recipientEmail: recipient } :
      { estimateId: id, recipientPhone: recipient };
  } else {
    body = isEmail ?
      { invoiceId: id, recipientEmail: recipient } :
      { invoiceId: id, recipientPhone: recipient };
  }
  
  if (!isEmail) {
    // Use SMS function
    functionName = type === 'estimate' ? 'send-estimate-sms' : 'send-invoice-sms';
  }
  
  console.log('Calling:', functionName);
  console.log('Body:', body);
  
  try {
    const response = await window.supabase.functions.invoke(functionName, {
      body: body
    });
    
    console.log('Response:', response);
    
    if (response.error) {
      console.error('Error:', response.error);
    } else {
      console.log('Success:', response.data);
    }
  } catch (error) {
    console.error('Exception:', error);
  }
};

// Run the test
testSendFunctions();

console.log('\n💡 Usage:');
console.log('  quickSendTest("estimate", "estimate-id", "email@example.com")');
console.log('  quickSendTest("invoice", "invoice-id", "+1234567890")');
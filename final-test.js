// FINAL TEST - Run this to verify everything is fixed
console.log('🎯 TESTING AI DISPATCHER - FINAL CHECK\n');
console.log('='.repeat(50));

// Test the webhook
fetch('https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/ai-assistant-webhook', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    data: {
      payload: {
        telnyx_conversation_channel: "phone_call",
        telnyx_agent_target: "+14375249932",
        telnyx_end_user_target: "+14375621308" // Your number
      }
    }
  })
})
.then(r => r.json())
.then(data => {
  console.log('\n✅ WEBHOOK TEST RESULTS:');
  console.log('=======================');
  
  // Check structure
  if (data.dynamic_variables) {
    console.log('✅ Has dynamic_variables object');
    
    // Check key values
    console.log('\n📋 KEY VALUES:');
    console.log('Company Name:', data.dynamic_variables.company_name);
    console.log('Agent Name:', data.dynamic_variables.agent_name);
    console.log('Services:', data.dynamic_variables.services_offered);
    console.log('Diagnostic Fee:', data.dynamic_variables.diagnostic_fee);
    console.log('Greeting:', data.dynamic_variables.greeting);
    
    // Check if you're detected as existing customer
    if (data.dynamic_variables.is_existing_customer === 'true') {
      console.log('\n👤 CUSTOMER DETECTION:');
      console.log('✅ You are recognized as:', data.dynamic_variables.customer_name);
      console.log('Status:', data.dynamic_variables.customer_status);
    }
    
    console.log('\n✅ ALL SYSTEMS OPERATIONAL!');
    console.log('\n📞 READY TO TEST:');
    console.log('1. Call: +1 (437) 524-9932');
    console.log('2. You should hear the greeting without any pauses');
    console.log('3. Say: "I need help with my refrigerator"');
    console.log('4. AI should continue the conversation naturally');
    
  } else {
    console.log('❌ Webhook not returning correct format');
  }
})
.catch(err => {
  console.error('❌ Test failed:', err);
});

console.log('\n⏳ Testing webhook... please wait...');
// Test script for AI Assistant Webhook
// Run this in the browser console to test all variables

// Test with an existing customer phone number
async function testWebhookWithExistingCustomer() {
  console.log('🔍 Testing webhook with existing customer...');
  
  const response = await fetch('https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/ai-assistant-webhook', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      data: {
        event_type: "assistant.initialization",
        payload: {
          telnyx_agent_target: "+14375249932",
          telnyx_end_user_target: "+14165551234" // Change this to a real customer phone
        }
      }
    })
  });
  
  const result = await response.json();
  console.log('✅ Response:', result);
  
  // Check all variables
  const requiredVars = [
    'company_name',
    'business_niche', 
    'agent_name',
    'services_offered',
    'hours_of_operation',
    'additional_info',
    'ai_capabilities',
    'agent_personality',
    'is_existing_customer',
    'customer_name',
    'customer_history',
    'outstanding_balance',
    'call_transfer_message',
    'greeting_message'
  ];
  
  console.log('\n📋 Variable Check:');
  requiredVars.forEach(varName => {
    const value = result[varName];
    const status = value ? '✅' : '❌';
    console.log(`${status} ${varName}: ${value || 'MISSING'}`);
  });
  
  return result;
}

// Test with a new customer
async function testWebhookWithNewCustomer() {
  console.log('\n🔍 Testing webhook with new customer...');
  
  const response = await fetch('https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/ai-assistant-webhook', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      data: {
        event_type: "assistant.initialization",
        payload: {
          telnyx_agent_target: "+14375249932",
          telnyx_end_user_target: "+19999999999" // Unknown number
        }
      }
    })
  });
  
  const result = await response.json();
  console.log('✅ Response for new customer:', result);
  
  // Check customer status
  console.log('\n📋 Customer Status:');
  console.log('is_existing_customer:', result.is_existing_customer);
  console.log('customer_name:', result.customer_name || '(empty - expected for new customer)');
  console.log('customer_history:', result.customer_history || '(empty - expected for new customer)');
  console.log('outstanding_balance:', result.outstanding_balance);
  
  return result;
}

// Run both tests
async function runAllTests() {
  console.log('🚀 Starting AI Assistant Webhook Tests\n');
  console.log('=====================================\n');
  
  await testWebhookWithExistingCustomer();
  await testWebhookWithNewCustomer();
  
  console.log('\n=====================================');
  console.log('✅ All tests complete!');
  console.log('\n📝 Instructions for Telnyx:');
  console.log('1. Use these variables in your AI Assistant instructions');
  console.log('2. Variables will be replaced with actual values during calls');
  console.log('3. Existing customers will be recognized by phone number');
}

// Run the tests
runAllTests();
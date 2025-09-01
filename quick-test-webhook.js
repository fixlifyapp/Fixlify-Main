// QUICK TEST - Run this in browser console to check if webhook is working

console.log('Testing AI Assistant Webhook...');

fetch('https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/ai-assistant-webhook', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    data: {
      payload: {
        telnyx_conversation_channel: "phone_call",
        telnyx_agent_target: "+14375249932",
        telnyx_end_user_target: "+16475551234"
      }
    }
  })
})
.then(r => r.json())
.then(data => {
  if (data.dynamic_variables) {
    console.log('✅ Webhook is working! Variables returned:');
    console.log('Company:', data.dynamic_variables.company_name);
    console.log('Agent:', data.dynamic_variables.agent_name);
    console.log('Services:', data.dynamic_variables.services_offered);
    console.log('\nFull response:', data);
  } else {
    console.log('❌ Webhook not returning correct format');
    console.log('Response:', data);
  }
})
.catch(err => {
  console.error('❌ Webhook error:', err);
});
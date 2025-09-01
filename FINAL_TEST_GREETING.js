// FINAL TEST - Run this NOW in browser console (F12) to verify everything works!

console.clear();
console.log('%c=== FINAL GREETING TEST ===', 'color: #00ff00; font-size: 20px; font-weight: bold');
console.log('Testing your Telnyx webhook...\n');

// This is the webhook Telnyx is using
const WEBHOOK_URL = 'https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/telnyx-dynamic-variables';

// Test the webhook
fetch(WEBHOOK_URL, {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    data: {
      event_type: "assistant.initialization",
      payload: {
        telnyx_agent_target: "+14375249932",
        telnyx_end_user_target: "+14165551234"
      }
    }
  })
})
.then(response => response.json())
.then(data => {
  const vars = data.dynamic_variables;
  
  if (!vars) {
    console.error('❌ ERROR: No variables returned!');
    return;
  }
  
  // THE MOST IMPORTANT CHECK
  if (vars.greeting_message) {
    console.log('%c✅ SUCCESS! greeting_message EXISTS!', 'color: #00ff00; font-size: 16px; font-weight: bold');
    console.log('');
    
    // Show the raw greeting
    console.log('%cRAW GREETING (with variables):', 'color: #ffaa00; font-weight: bold');
    console.log(vars.greeting_message);
    console.log('');
    
    // Process the greeting
    let final = vars.greeting_message;
    final = final.replace(/{{company_name}}/g, vars.company_name);
    final = final.replace(/{{agent_name}}/g, vars.agent_name);
    
    console.log('%cFINAL GREETING (what callers hear):', 'color: #00ff00; font-weight: bold');
    console.log('%c' + final, 'color: #00ff00; font-size: 14px');
    console.log('');
    
    // Success message
    console.log('%c=== ✅ EVERYTHING IS WORKING! ===', 'color: #00ff00; font-size: 18px; font-weight: bold');
    console.log('');
    console.log('📞 IN TELNYX, make sure you have:');
    console.log('   Webhook URL:', WEBHOOK_URL);
    console.log('   Greeting: {{greeting_message}}');
    console.log('');
    console.log('🎉 When someone calls +1 (437) 524-9932, they will hear:');
    console.log('   "' + final + '"');
    console.log('');
    console.log('✏️ To change the greeting, update it in Supabase:');
    console.log('   Table: ai_dispatcher_configs');
    console.log('   Column: greeting_message');
    console.log('   Where: company_name = "Nicks appliance repair"');
    
  } else {
    console.error('%c❌ PROBLEM: greeting_message is MISSING!', 'color: #ff0000; font-size: 16px; font-weight: bold');
    console.error('Variables returned:', Object.keys(vars));
    console.error('This should not happen - the webhook was just updated!');
  }
})
.catch(error => {
  console.error('%c❌ ERROR calling webhook:', 'color: #ff0000; font-weight: bold');
  console.error(error.message);
  console.error('The webhook might be down or there might be a network issue');
});
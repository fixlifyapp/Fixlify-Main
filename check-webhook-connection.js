// CHECK IF WEBHOOK IS RESPONDING
console.log('🚨 TESTING WEBHOOK DIRECTLY\n')

// Test the webhook endpoint
fetch('https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/ai-assistant-webhook', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    data: {
      event_type: 'test',
      payload: {
        telnyx_agent_target: '+14375249932',
        telnyx_end_user_target: '+14375621308'
      }
    }
  })
})
.then(r => {
  console.log('Response Status:', r.status)
  if (r.ok) {
    console.log('✅ Webhook is RESPONDING')
    return r.json()
  } else {
    console.log('❌ Webhook returned error:', r.status)
    throw new Error('Webhook error')
  }
})
.then(data => {
  console.log('\n✅ WEBHOOK IS WORKING!')
  console.log('Returned variables:', Object.keys(data.dynamic_variables).length)
  console.log('Company:', data.dynamic_variables.company_name)
  
  console.log('\n🚨 BUT TELNYX IS NOT CALLING IT!')
  console.log('\n📋 CHECK IN TELNYX:')
  console.log('1. Go to your AI Assistant settings')
  console.log('2. Find "Dynamic Variables Webhook URL" field')
  console.log('3. Make sure it says EXACTLY:')
  console.log('   https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/ai-assistant-webhook')
  console.log('4. No trailing slash, no typos')
  console.log('5. SAVE the settings')
  
  console.log('\n⚠️ COMMON ISSUES:')
  console.log('• Wrong URL in Telnyx')
  console.log('• URL has typo or extra characters')
  console.log('• Webhook field is empty')
  console.log('• Settings not saved')
})
.catch(err => {
  console.error('❌ WEBHOOK IS DOWN!', err)
  console.log('The webhook itself is not responding')
})
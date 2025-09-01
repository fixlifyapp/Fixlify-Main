// FORCE A TEST CALL TO SEE IF LOGS WORK
console.log('🧪 FORCING TEST WEBHOOK CALL...\n')

const testCall = async () => {
  try {
    const response = await fetch('https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/ai-assistant-webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: {
          event_type: 'MANUAL_TEST_FROM_BROWSER',
          payload: {
            telnyx_agent_target: '+14375249932',
            telnyx_end_user_target: '+1234567890',
            test_timestamp: new Date().toISOString()
          }
        }
      })
    })
    
    if (response.ok) {
      const data = await response.json()
      console.log('✅ WEBHOOK RESPONDED!')
      console.log('Company:', data.dynamic_variables?.company_name)
      console.log('\n🔍 NOW CHECK:')
      console.log('1. Go to Supabase Dashboard')
      console.log('2. Edge Functions > ai-assistant-webhook > Logs')
      console.log('3. You should see "MANUAL_TEST_FROM_BROWSER"')
      console.log('\nIf you see it in logs, the webhook works!')
      console.log('If NOT, there might be a logging issue.')
      
      console.log('\n⚠️ MAIN PROBLEM:')
      console.log('Telnyx is NOT configured to call this webhook.')
      console.log('You MUST add the webhook URL in Telnyx settings!')
    } else {
      console.log('❌ Webhook error:', response.status)
    }
  } catch (err) {
    console.log('❌ Failed:', err)
  }
}

testCall()

console.log('\n📍 WEBHOOK URL TO ADD IN TELNYX:')
console.log('https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/ai-assistant-webhook')
console.log('\n⚠️ Without this URL in Telnyx, the AI will only say greeting!')
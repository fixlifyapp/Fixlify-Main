// MONITOR WEBHOOK CALLS IN REAL-TIME
console.log('📊 MONITORING WEBHOOK CALLS...\n')
console.log('1. First, make sure you added the webhook URL to Telnyx')
console.log('2. Then call your AI number: +14375249932')
console.log('3. Watch the logs below:\n')

// Check current logs
async function checkLogs() {
  const response = await fetch('https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/ai-assistant-webhook', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      data: {
        event_type: 'test',
        payload: {
          telnyx_agent_target: '+14375249932',
          telnyx_end_user_target: 'test'
        }
      }
    })
  })
  
  if (response.ok) {
    console.log(`✅ [${new Date().toLocaleTimeString()}] Webhook is responding`)
    console.log('Now make a call and you should see it in the Edge Function logs')
    console.log('URL to paste in Telnyx:')
    console.log('https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/ai-assistant-webhook')
  } else {
    console.log('❌ Webhook error')
  }
}

checkLogs()

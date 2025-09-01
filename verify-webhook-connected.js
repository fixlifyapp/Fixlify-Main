// VERIFY WEBHOOK IS NOW CONNECTED
console.log('✅ WEBHOOK URL IS IN TELNYX!\n')
console.log('URL: https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/ai-assistant-webhook\n')

console.log('🧪 TESTING STEPS:\n')
console.log('1. First, let\'s verify the webhook is responding:')

fetch('https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/ai-assistant-webhook', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    data: {
      event_type: 'assistant.initialization',
      payload: {
        telnyx_agent_target: '+14375249932',
        telnyx_end_user_target: '+14375621308'
      }
    }
  })
})
.then(r => r.json())
.then(data => {
  console.log('✅ Webhook is responding!')
  console.log('Returns company:', data.dynamic_variables?.company_name)
  console.log('Returns agent:', data.dynamic_variables?.agent_name)
  console.log('Returns greeting:', data.dynamic_variables?.greeting?.substring(0, 50) + '...')
  
  console.log('\n📞 NOW TEST BY CALLING:')
  console.log('1. Call +14375249932')
  console.log('2. You should hear:')
  console.log('   "Thank you for calling Nicks appliance repair..."')
  console.log('3. Say "Hello"')
  console.log('4. AI should respond (not go silent)')
  
  console.log('\n🔍 CHECK EDGE FUNCTION LOGS:')
  console.log('1. Go to Supabase Dashboard')
  console.log('2. Edge Functions > ai-assistant-webhook > Logs')
  console.log('3. After calling, you should see new logs')
  console.log('4. Look for "Request from Telnyx"')
  
  console.log('\n⚠️ IF STILL SILENT:')
  console.log('• Make sure you SAVED in Telnyx after adding URL')
  console.log('• Check if URL has any typos or extra spaces')
  console.log('• Try removing and re-adding the URL')
  console.log('• The assistant might need a minute to update')
})
.catch(err => console.error('Error:', err))
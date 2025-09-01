// Check what the webhook is actually returning
console.log('🔍 Checking Webhook Response Size and Content\n')

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
  const vars = data.dynamic_variables
  
  console.log('✅ WEBHOOK RESPONSE RECEIVED\n')
  
  // Check instructions length
  const instructionsLength = vars.instructions ? vars.instructions.length : 0
  console.log(`📏 Instructions Length: ${instructionsLength} characters`)
  
  if (instructionsLength > 4000) {
    console.log('⚠️ WARNING: Instructions might be too long for Telnyx!')
    console.log('   Telnyx might have a character limit')
  }
  
  // Check if instructions have the critical parts
  const hasNeverSilent = vars.instructions?.includes('NEVER BE SILENT')
  const hasBusinessNiche = vars.instructions?.includes(vars.business_niche)
  
  console.log('\n🔍 CRITICAL CHECKS:')
  console.log('Has NEVER BE SILENT:', hasNeverSilent ? '✅ YES' : '❌ NO')
  console.log('Uses correct business:', hasBusinessNiche ? '✅ YES' : '❌ NO')
  
  console.log('\n📝 VARIABLES RETURNED:')
  console.log('company_name:', vars.company_name)
  console.log('agent_name:', vars.agent_name)
  console.log('business_niche:', vars.business_niche)
  console.log('greeting:', vars.greeting?.substring(0, 100) + '...')
  
  console.log('\n⚠️ POSSIBLE ISSUES:')
  console.log('1. Instructions might be ignored by Telnyx')
  console.log('2. Instructions in Telnyx UI might override webhook')
  console.log('3. Webhook response might be too large')
  
  console.log('\n✅ SOLUTION:')
  console.log('1. Use SHORTER instructions in Telnyx UI')
  console.log('2. Focus on key behaviors')
  console.log('3. Remove the instructions field from webhook')
})
.catch(err => console.error('Error:', err))

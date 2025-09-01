// CRITICAL: Test if webhook was actually updated
console.log('🚨 CHECKING WEBHOOK STATUS\n')

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
  const instructions = data.dynamic_variables.instructions || ''
  
  console.log('🔍 CHECKING FOR CRITICAL FIXES:\n')
  
  // Check for the problems
  const hasGarageDoor = instructions.includes('Garage Door')
  const hasNeverSilent = instructions.includes('NEVER BE SILENT')
  const hasFallbacks = instructions.includes('FALLBACK RESPONSES')
  const hasUniversal = instructions.includes('{{business_niche}}')
  
  if (hasGarageDoor) {
    console.log('❌ PROBLEM: Still has "Garage Door" hardcoded!')
    console.log('   This is why AI gets confused - wrong business type')
  }
  
  if (!hasNeverSilent) {
    console.log('❌ PROBLEM: Missing "NEVER BE SILENT" rules!')
    console.log('   This is why AI goes quiet after greeting')
  }
  
  if (!hasFallbacks) {
    console.log('❌ PROBLEM: Missing fallback responses!')
    console.log('   AI doesn\'t know what to say when confused')
  }
  
  if (!hasUniversal) {
    console.log('❌ PROBLEM: Not using {{business_niche}} variable!')
    console.log('   Instructions are hardcoded, not dynamic')
  }
  
  console.log('\n📊 STATUS:')
  if (hasGarageDoor || !hasNeverSilent) {
    console.log('⚠️ WEBHOOK IS STILL USING OLD VERSION')
    console.log('The edge function might need to rebuild')
    console.log('\n🔧 SOLUTION: Need to force redeploy the webhook')
  } else {
    console.log('✅ Webhook is updated and should work!')
  }
  
  // Show what needs to be in instructions
  console.log('\n✅ INSTRUCTIONS SHOULD INCLUDE:')
  console.log('1. "NEVER BE SILENT" rules')
  console.log('2. Fallback responses when confused')
  console.log('3. Use {{business_niche}} not "Garage Door"')
  console.log('4. Specific responses for common phrases')
})

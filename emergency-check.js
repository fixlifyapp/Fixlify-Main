// EMERGENCY FIX: Test what webhook is sending RIGHT NOW
console.log('🚨 EMERGENCY CHECK - Why AI Goes Silent\n')

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
  
  console.log('📞 GREETING SENT:')
  console.log(vars.greeting)
  
  console.log('\n⚠️ CHECKING INSTRUCTIONS:')
  
  if (!vars.instructions) {
    console.log('❌ NO INSTRUCTIONS FIELD!')
    console.log('This is why AI goes silent - no instructions!')
  } else {
    console.log('✅ Instructions field exists')
    console.log('Length:', vars.instructions.length, 'characters')
    
    // Check if instructions are in Telnyx format
    const hasNeverSilent = vars.instructions.includes('NEVER BE SILENT')
    const hasResponses = vars.instructions.includes('When customer says')
    
    console.log('Has NEVER BE SILENT:', hasNeverSilent ? 'YES' : 'NO')
    console.log('Has response mappings:', hasResponses ? 'YES' : 'NO')
  }
  
  console.log('\n🔍 POSSIBLE ISSUES:')
  console.log('1. Telnyx might need instructions in the AI Assistant settings, not webhook')
  console.log('2. Instructions field might be ignored by Telnyx')
  console.log('3. Instructions might be too long (over 4000 chars)')
  
  console.log('\n💡 SOLUTION:')
  console.log('You may need to copy the instructions DIRECTLY into Telnyx AI Assistant settings')
  console.log('The webhook can provide variables, but core instructions might need to be in Telnyx')
  
  // Show all variables being sent
  console.log('\n📊 ALL VARIABLES SENT:')
  Object.keys(vars).forEach(key => {
    if (key !== 'instructions') {
      const value = String(vars[key]).substring(0, 50)
      console.log(`${key}: "${value}${vars[key].length > 50 ? '...' : ''}"`)
    }
  })
})

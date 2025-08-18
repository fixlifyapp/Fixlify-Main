// diagnose-ai-tools.js
// Диагностика почему AI не использует tools

async function diagnoseTools() {
  console.log('🔍 DIAGNOSING AI DISPATCHER TOOLS\n')
  
  // 1. Test webhook response time
  console.log('1. Testing Webhook Speed...')
  const webhookUrl = 'https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/ai-assistant-webhook'
  const start = Date.now()
  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      data: {
        event_type: 'assistant.initialization',
        payload: { telnyx_agent_target: '+14375249932' }
      }
    })
  })
  const time = Date.now() - start
  console.log(`   ✓ Webhook responds in ${time}ms ${time < 2000 ? '✅' : '⚠️ TOO SLOW'}`)
  
  // 2. Test appointment handler
  console.log('\n2. Testing Appointment Handler...')
  const handlerUrl = 'https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/ai-appointment-handler'
  
  // Check availability
  const checkRes = await fetch(handlerUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'check_availability',
      date: new Date().toISOString().split('T')[0]
    })
  })
  const availability = await checkRes.json()
  console.log(`   ✓ Availability check: ${availability.available_slots ? '✅ Working' : '❌ Failed'}`)
  
  // 3. Check recent calls
  console.log('\n3. Checking Recent AI Calls...')
  console.log('   Run this SQL in Supabase:')
  console.log(`   
   SELECT 
     created_at,
     request_body,
     response_body
   FROM webhook_logs 
   WHERE webhook_name = 'ai-assistant-webhook'
   ORDER BY created_at DESC 
   LIMIT 5;
  `)
  
  // 4. Tool configuration checklist
  console.log('\n4. TELNYX CONFIGURATION CHECKLIST:')
  console.log('   □ Tools added to AI Assistant')
  console.log('   □ Tool URLs are EXACTLY:')
  console.log('     - https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/ai-appointment-handler')
  console.log('   □ Method: POST')
  console.log('   □ No authentication headers')
  console.log('   □ Body parameters use variables:')
  console.log('     - {{date}} not hardcoded dates')
  console.log('     - {{time}} not hardcoded times')
  console.log('     - {{telnyx_end_user_target}} for phone')
  
  console.log('\n5. AI INSTRUCTIONS CHECKLIST:')
  console.log('   □ Instructions explicitly say "USE TOOL"')
  console.log('   □ Keywords trigger tools:')
  console.log('     - "appointment", "schedule" → check_availability')
  console.log('     - Time selection → book_appointment')
  console.log('   □ One question at a time rule')
  
  console.log('\n6. COMMON ISSUES:')
  console.log('   ❌ Tool URL wrong (check for typos)')
  console.log('   ❌ Parameters not mapped to variables')
  console.log('   ❌ AI instructions don\'t mention tools')
  console.log('   ❌ Tools disabled in Telnyx')
  console.log('   ❌ Authentication blocking requests')
  
  console.log('\n7. TEST SCRIPT TO SAY:')
  console.log('   "I need to schedule a repair appointment for tomorrow"')
  console.log('   Expected: AI should use check_availability tool')
  console.log('   If not: Tools not configured properly in Telnyx')
}

diagnoseTools()
// Diagnose why AI is silent after greeting
async function diagnoseAISilence() {
  console.log('🔍 DIAGNOSING AI SILENCE ISSUE\n')
  
  // 1. Test if webhook is responding
  console.log('1️⃣ Testing AI Assistant Webhook...')
  const webhookRes = await fetch('https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/ai-assistant-webhook', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      data: {
        event_type: 'test',
        payload: { telnyx_agent_target: '+14375249932' }
      }
    })
  })
  const webhookData = await webhookRes.json()
  console.log('✅ Webhook response time:', webhookData.dynamic_variables ? 'OK' : 'FAILED')
  
  // 2. Test MCP server
  console.log('\n2️⃣ Testing MCP Server...')
  const mcpRes = await fetch('https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/mcp-appointment-server', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tool: 'check_availability', date: '2025-08-19' })
  })
  const mcpData = await mcpRes.json()
  console.log('✅ MCP response:', mcpData.success ? 'Working' : 'Failed')
  
  // 3. Check instructions
  console.log('\n3️⃣ Required AI Instructions:')
  console.log(`
CRITICAL INSTRUCTIONS FOR TELNYX AI ASSISTANT:

## CONVERSATION RULES
1. ALWAYS RESPOND - Never go silent
2. If confused, say "Let me help you with that"
3. Keep responses under 2 sentences

## WHEN CUSTOMER MENTIONS SCHEDULING
IMMEDIATELY say: "Let me check our availability for you."
THEN use tool: check_availability

## TOOL USAGE
When using tools:
- Don't wait for permission
- Execute immediately
- Announce what you're doing

## ERROR HANDLING
If tools fail:
- Say: "I'm having technical issues. Let me transfer you to a human."
- Never go silent

## KEY PHRASES TO RESPOND TO:
- "appointment" → "Let me check availability"
- "schedule" → "I'll find available times"
- "hello" → "Hi! How can I help you today?"
- silence → "Are you still there? How can I help?"
  `)
  
  console.log('\n4️⃣ Common Issues:')
  console.log('❌ AI goes silent = Instructions not clear')
  console.log('❌ Tools not used = Tool configuration wrong')
  console.log('❌ Hangs up = No fallback response configured')
  
  console.log('\n5️⃣ Quick Fix:')
  console.log('Add this EXACT instruction to your AI:')
  console.log(`
"NEVER BE SILENT. If you don't understand, say 'I can help schedule an appointment or answer questions about our services. What would you like?'"
  `)
}

diagnoseAISilence()

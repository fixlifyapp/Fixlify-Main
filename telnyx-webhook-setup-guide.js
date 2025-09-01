// STEP-BY-STEP TELNYX WEBHOOK SETUP

console.log('🔍 TELNYX WEBHOOK CONFIGURATION GUIDE\n')
console.log('================================\n')

console.log('📍 WHERE TO ADD THE WEBHOOK URL:\n')

console.log('Option 1: In AI Assistant Settings')
console.log('1. Go to Telnyx Portal')
console.log('2. Navigate to AI > AI Assistants')
console.log('3. Click on your assistant')
console.log('4. Look for ONE of these fields:')
console.log('   - "Dynamic Variables Webhook URL"')
console.log('   - "Webhook URL"')
console.log('   - "Variables Webhook"')
console.log('   - "External Webhook"')
console.log('5. Paste: https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/ai-assistant-webhook')
console.log('6. SAVE\n')

console.log('Option 2: In the GREETING field (if no webhook field exists)')
console.log('Some Telnyx versions put webhook in the Greeting settings:')
console.log('1. Click on "Greeting" settings')
console.log('2. Look for "Add Dynamic Variables" or similar')
console.log('3. Add the webhook URL there\n')

console.log('Option 3: In Phone Number Settings')
console.log('1. Go to Phone Numbers')
console.log('2. Find +14375249932')
console.log('3. Check for AI Configuration')
console.log('4. Add webhook URL there\n')

console.log('⚠️ IMPORTANT CHECKS:')
console.log('• NO trailing slash at the end')
console.log('• NO spaces before or after')
console.log('• Must be HTTPS not HTTP')
console.log('• Exact URL: https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/ai-assistant-webhook')

console.log('\n🧪 TEST THE WEBHOOK:')
console.log('Run this to make sure webhook is up:')

fetch('https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/ai-assistant-webhook', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    data: { event_type: 'test', payload: {} }
  })
})
.then(r => r.ok ? console.log('✅ Webhook is UP and responding!') : console.log('❌ Webhook error'))
.catch(() => console.log('❌ Cannot reach webhook'))
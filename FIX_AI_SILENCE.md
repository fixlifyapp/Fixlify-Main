# FIX: AI Dispatcher Goes Silent After Greeting

## 🔴 Problem
AI says greeting then goes completely silent (тишина)

## 🟢 Solution

### 1. Update Webhook URL in Telnyx
Go to your AI Assistant settings and change the webhook URL to:
```
https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/ai-assistant-webhook-fixed
```

### 2. Add These EXACT Instructions to Your AI Assistant

Copy and paste this into your AI Assistant's instructions field:

```
## NEVER BE SILENT - CRITICAL RULES

1. ALWAYS RESPOND within 2 seconds
2. If confused, say "I can help schedule an appointment. What day works for you?"
3. Never just listen - always talk

## KEYWORDS AND RESPONSES

When customer says ANY of these words, RESPOND IMMEDIATELY:

"hello" → "Hi! I can help schedule a repair appointment. What appliance needs service?"
"appointment" → "Let me check our availability. What day works best?"
"schedule" → "I'll find available times for you. Is this for today or tomorrow?"
"book" → "I can book that appointment. What's the issue you're experiencing?"
"repair" → "I'll help with that repair. When would you like a technician to come?"
"tomorrow" → "Let me check tomorrow's availability." [USE check_availability tool]
"today" → "I'll check today's openings." [USE check_availability tool]
[SILENCE] → "Are you there? I can help schedule your appointment."
[UNCLEAR] → "I can help schedule a repair appointment. What appliance needs service?"

## TOOL USAGE

When you hear scheduling keywords:
1. SAY: "Let me check availability"
2. USE: check_availability tool
3. NEVER just say you'll check without using the tool

## DEFAULT RESPONSES (use if confused)

Rotate through these:
- "I can schedule a repair appointment for you. What day works best?"
- "Which appliance needs service today?"
- "Our diagnostic fee is $75. Should I schedule a technician?"
- "We have appointments available this week. When works for you?"

## EXAMPLE CONVERSATION

Customer: "Hi"
You: "Hi! I can help schedule a repair appointment. What appliance needs service?"

Customer: "My fridge"
You: "I'll help with your refrigerator repair. What day works best for you?"

Customer: "Tomorrow"
You: "Let me check tomorrow's availability." [USE TOOL]
You: "I have openings at 9am, 11am, and 2pm. Which works?"

Customer: "11am"
You: "Perfect! I'll book 11am tomorrow for your refrigerator repair." [USE TOOL]

REMEMBER: NEVER BE SILENT. ALWAYS RESPOND.
```

### 3. Configure MCP Tools Properly

Make sure you have at least these 2 tools configured:

**Tool 1: check_availability**
- URL: `https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/mcp-appointment-server`
- Method: POST
- Body: `{"tool": "check_availability", "date": "{{date}}"}`

**Tool 2: book_appointment**
- URL: `https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/mcp-appointment-server`
- Method: POST
- Body: `{"tool": "book_appointment", "customer_phone": "{{telnyx_end_user_target}}", "date": "{{date}}", "time": "{{time}}", "service_type": "{{service_type}}"}`

### 4. Test Script for Browser Console

```javascript
// Test the fixed webhook
fetch('https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/ai-assistant-webhook-fixed', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    data: {
      event_type: 'test',
      payload: {
        telnyx_agent_target: '+14375249932',
        telnyx_end_user_target: '+14164567890'
      }
    }
  })
}).then(r => r.json()).then(data => {
  console.log('Instructions preview:')
  console.log(data.dynamic_variables.instructions)
})
```

## 🎯 Why AI Goes Silent - Common Causes

1. **No fallback responses** - AI doesn't know what to say
2. **Tools not configured** - Can't execute actions
3. **Instructions too vague** - AI gets confused
4. **No error handling** - Fails silently

## ✅ This Fix Provides

1. **Always-respond rules** - Never silent
2. **Keyword mapping** - Clear responses for everything
3. **Default responses** - Fallbacks when confused
4. **Tool reminders** - When to use MCP tools
5. **Error recovery** - What to say when things fail

## 🧪 Test After Setup

1. Call your AI number
2. Say "Hello" - Should get immediate response
3. Say "I need an appointment" - Should check availability
4. Stay silent for 5 seconds - Should ask if you're there
5. Say something unclear like "ummm" - Should offer help

## 📊 Monitor Success

Check in Supabase:
```sql
SELECT * FROM webhook_logs 
WHERE webhook_name = 'ai-assistant-webhook-fixed'
ORDER BY created_at DESC;
```

## 🚨 If Still Silent

1. Check Telnyx logs for errors
2. Verify webhook URL is exactly: `https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/ai-assistant-webhook-fixed`
3. Make sure instructions include "NEVER BE SILENT"
4. Test tools are working in browser console

The key is giving the AI specific responses for EVERY situation so it never has to "think" in silence!

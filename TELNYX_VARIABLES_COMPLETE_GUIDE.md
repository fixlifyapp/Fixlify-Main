# 🔍 TELNYX DYNAMIC VARIABLES - COMPLETE TROUBLESHOOTING GUIDE

## WHY NO LOGS TODAY (08-20)?
**Answer**: The webhook only fires when someone CALLS your number. No calls = no logs.

## HOW DYNAMIC VARIABLES ACTUALLY WORK:

### 1. Call Starts
- Someone calls +1 (437) 524-9932
- Telnyx sends `assistant.initialization` event to webhook
- Webhook returns variables (company_name, agent_name, etc.)

### 2. Variables Get Replaced EVERYWHERE
```
INSTRUCTION: "Thank you for calling {{company_name}}"
BECOMES: "Thank you for calling Nicks appliance repair"

INSTRUCTION: "I'm {{agent_name}} from {{company_name}}"  
BECOMES: "I'm Sarah from Nicks appliance repair"
```

### 3. Variables Work Throughout Entire Call
NOT just greeting! Every {{variable}} in instructions gets replaced.

## 📍 WHERE TO SET WEBHOOK URL IN TELNYX:

### Option 1: Portal UI
Look for field called:
- "Dynamic Variables Webhook URL"
- "Variables Webhook"
- "Webhook URL" (in main settings, NOT Tools)

### Option 2: API
```json
{
  "assistant": {
    "dynamic_variables_webhook_url": "https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/ai-assistant-webhook"
  }
}
```

### Option 3: As a Tool (Your Workaround)
If you can't find the field, create as tool:
- Name: `get_company_info`
- URL: `https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/ai-assistant-webhook`
- Add to instructions: "Call get_company_info tool at start of every conversation"

## 🧪 TEST WITHOUT MAKING A CALL:

```javascript
// Test webhook directly
fetch('https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/ai-assistant-webhook', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    data: {
      event_type: "assistant.initialization",
      payload: {
        telnyx_conversation_channel: "phone_call",
        telnyx_agent_target: "+14375249932",
        telnyx_end_user_target: "+14165551234"
      }
    }
  })
}).then(r => r.json()).then(console.log);
```

## ✅ WHAT YOU SHOULD GET BACK:
```json
{
  "dynamic_variables": {
    "company_name": "Nicks appliance repair",
    "agent_name": "Sarah",
    "business_type": "Appliance Repair",
    "services_offered": "Refrigerator, Washer, Dryer, Dishwasher, Oven repair",
    "diagnostic_fee": "75",
    "emergency_surcharge": "50",
    "hours_of_operation": "Monday-Friday 9am-6pm",
    "service_area": "Greater Toronto Area"
  }
}
```

## 📝 CORRECT INSTRUCTIONS FORMAT:
```
You are {{agent_name}} for {{company_name}}.
When someone asks about pricing, say "Our diagnostic fee is ${{diagnostic_fee}}."
NOT: "Our diagnostic fee is $75"
```

## 🚨 COMMON MISTAKES:
1. ❌ Hardcoding values: "I'm Sarah from Nicks"
   ✅ Use variables: "I'm {{agent_name}} from {{company_name}}"

2. ❌ Only using in greeting
   ✅ Use throughout all instructions

3. ❌ Setting webhook as Tool instead of Dynamic Variables URL
   ✅ Find the right field or use API

## 🔧 IF STILL NOT WORKING:

### Check 1: Webhook Response Time
Must respond in < 1 second or Telnyx uses defaults

### Check 2: Correct Event Type
Webhook only called on `assistant.initialization`

### Check 3: Instructions Format
Variables must be exactly {{variable_name}} with double curly braces

### Check 4: Make a Test Call
No other way to trigger the webhook - must actually call the number

## 💡 THE TOOL WORKAROUND:
If you REALLY can't find the Dynamic Variables field, configure as a tool:
1. Add as webhook tool (like you started)
2. In instructions: "IMMEDIATELY call get_company_info tool when conversation starts"
3. Tool returns the variables
4. Assistant uses them for rest of call

But this is less elegant than proper Dynamic Variables.
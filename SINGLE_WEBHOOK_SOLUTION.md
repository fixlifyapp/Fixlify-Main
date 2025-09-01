# ✅ SINGLE WEBHOOK SOLUTION - SIMPLIFIED

## THE ONE AND ONLY WEBHOOK:
```
https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/ai-assistant-webhook
```

## WHAT IT DOES:
- Returns all Telnyx variables including `greeting_message`
- Reads from your database configuration
- Handles customer context if they're existing clients
- Falls back to defaults if database is unavailable

## VARIABLES RETURNED:
```json
{
  "dynamic_variables": {
    "company_name": "Nicks appliance repair",
    "agent_name": "Sarah",
    "business_niche": "Appliance Repair",
    "services_offered": "Refrigerator, Washer, Dryer, Dishwasher, Oven",
    "hours_of_operation": "Monday-Friday 9am-6pm",
    "additional_info": "Service call $89 • Emergency +$50 • 90-day warranty • Senior discount 10% • Same-day service available",
    "greeting_message": "Thank you for calling {{company_name}}. I'm {{agent_name}}. Which appliance needs our attention today?",
    "agent_personality": "Be helpful with troubleshooting...",
    "ai_capabilities": "1. Diagnose appliance issues...",
    "customer_name": "",
    "is_existing_customer": "false",
    "customer_history": "",
    "outstanding_balance": "0",
    "caller_phone": "+14165551234",
    "business_phone": "+14375249932"
  }
}
```

## IN TELNYX - SET THIS UP:

### 1. Webhook URL:
```
https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/ai-assistant-webhook
```

### 2. Greeting:
```
{{greeting_message}}
```

### 3. Instructions:
```
You are {{agent_name}} from {{company_name}}, a {{business_niche}} specialist.

## Services We Offer:
{{services_offered}}

## Business Hours:
{{hours_of_operation}}

## Pricing & Policies:
{{additional_info}}

## Your Personality:
{{agent_personality}}

## Your Capabilities:
{{ai_capabilities}}

## Customer Context:
- Is existing customer: {{is_existing_customer}}
- Customer name: {{customer_name}}
- History: {{customer_history}}
- Balance: {{outstanding_balance}}
```

## TEST IT NOW:
```javascript
// Copy and run this in browser console
fetch('https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/ai-assistant-webhook', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    data: {
      event_type: "assistant.initialization",
      payload: {
        telnyx_agent_target: "+14375249932",
        telnyx_end_user_target: "+14165551234"
      }
    }
  })
})
.then(r => r.json())
.then(data => {
  console.log('✅ WEBHOOK WORKING!');
  console.log('Company:', data.dynamic_variables.company_name);
  console.log('Agent:', data.dynamic_variables.agent_name);
  console.log('Greeting:', data.dynamic_variables.greeting_message);
})
.catch(err => console.error('❌ Error:', err));
```

## NO OTHER WEBHOOKS NEEDED!
- Deleted: telnyx-variables-v2 (not needed)
- Deleted: telnyx-dynamic-variables (old, broken)
- ONLY USE: ai-assistant-webhook

## THAT'S IT! 🎉
One webhook, all variables, simple and clean.
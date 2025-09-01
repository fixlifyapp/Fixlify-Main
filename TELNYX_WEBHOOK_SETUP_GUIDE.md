# 🔧 TELNYX AI DISPATCHER WEBHOOK SETUP

## ✅ YOUR WEBHOOK URL:
```
https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/ai-assistant-webhook
```

## 📍 WHERE TO SET IT IN TELNYX:

### Option 1: Dynamic Variables Webhook (CORRECT)
1. Go to your AI Assistant in Telnyx
2. Look for **"Dynamic Variables"** section (NOT in Tools!)
3. Find the field labeled:
   - **"Dynamic Variables Webhook URL"** 
   - OR **"Variables Webhook"**
   - OR **"Webhook URL"** (in main settings)
4. Enter the URL above
5. Save

### Option 2: If using AI Assistant API
In your assistant configuration JSON:
```json
{
  "assistant": {
    "dynamic_variables_webhook_url": "https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/ai-assistant-webhook"
  }
}
```

## 🧪 TEST THE WEBHOOK:

Run this in F12 console to test:
```javascript
// Test webhook with sample Telnyx payload
fetch('https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/ai-assistant-webhook', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_SUPABASE_ANON_KEY' // Get from Supabase dashboard
  },
  body: JSON.stringify({
    data: {
      payload: {
        telnyx_conversation_channel: "phone_call",
        telnyx_agent_target: "+14375249932",  // Your Telnyx number
        telnyx_end_user_target: "+14165551234", // Test caller
        assistant_id: "test-assistant"
      }
    }
  })
})
.then(r => r.json())
.then(data => {
  console.log('✅ Webhook Response:', data);
  if (data.dynamic_variables) {
    console.log('Company:', data.dynamic_variables.company_name);
    console.log('Agent:', data.dynamic_variables.agent_name);
    console.log('Services:', data.dynamic_variables.services_offered);
  }
})
.catch(err => console.error('❌ Error:', err));
```

## 🔑 GET YOUR ANON KEY:
1. Go to: https://supabase.com/dashboard/project/mqppvcrlvsgrsqelglod/settings/api
2. Copy the "anon public" key
3. Use it in the Authorization header

## 📝 WHAT THE WEBHOOK DOES:

When someone calls your Telnyx number:
1. Telnyx sends caller info to webhook
2. Webhook looks up the phone number owner
3. Gets their company settings (name, services, pricing)
4. Returns personalized variables
5. AI uses these to answer: "Thank you for calling [COMPANY NAME]..."

## ⚠️ IMPORTANT NOTES:

1. **NOT in Tools Section**: The webhook URL goes in the MAIN assistant settings, not in the Tools section
2. **Authentication**: The webhook needs the Supabase anon key in Authorization header
3. **Response Time**: Must respond within 1 second or Telnyx uses defaults

## 🚨 TROUBLESHOOTING:

### If variables aren't working:
1. Check webhook logs in Supabase
2. Verify phone number exists in database
3. Ensure AI dispatcher config is set up
4. Test with the console script above

### Common Issues:
- **Wrong location**: Setting URL in Tools instead of Dynamic Variables
- **Missing auth**: Not including Authorization header
- **Phone not found**: Phone number not in database
- **Config missing**: No AI dispatcher config for the phone
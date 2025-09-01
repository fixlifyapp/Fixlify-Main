# TELNYX AI ASSISTANT CONFIGURATION CHECKLIST

## 1. WEBHOOK CONFIGURATION
In Telnyx AI Assistant settings, you need to add a **Dynamic Variables Webhook**:

### Webhook Settings:
- **URL**: `https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/ai-assistant-webhook`
- **Method**: POST
- **Trigger**: On Call Start / Assistant Initialization
- **Authentication**: Add header `Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xcHB2Y3JsdnNncnNxZWxnbG9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1OTE3MDUsImV4cCI6MjA2MzE2NzcwNX0.My-KiqG1bCMqzUru4m59d4v18N3WGxNoNtFPOFAmhzg`

## 2. GREETING FIELD
In the Greeting field, use exactly:
```
{{greeting}}
```

## 3. TESTING THE WEBHOOK
Test the webhook is working:
```bash
curl -X POST https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/ai-assistant-webhook \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xcHB2Y3JsdnNncnNxZWxnbG9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1OTE3MDUsImV4cCI6MjA2MzE2NzcwNX0.My-KiqG1bCMqzUru4m59d4v18N3WGxNoNtFPOFAmhzg" \
  -d '{"data":{"event_type":"assistant.initialization","payload":{"telnyx_agent_target":"+14375249932","telnyx_end_user_target":"+14165551234"}}}'
```

Should return:
```json
{
  "greeting": "Thank you for calling Nicks appliance repair. I'm Sarah. How can I help you today?",
  ...
}
```

## 4. COMMON ISSUES

### Issue: AI says "greeting" literally
**Solution**: Make sure the webhook is configured in Telnyx under "Dynamic Variables" or "Webhooks" section

### Issue: Variables not working
**Solution**: 
1. Check webhook is added to the AI Assistant
2. Verify the webhook URL is exactly: `https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/ai-assistant-webhook`
3. Make sure Authorization header is included

### Issue: Webhook not called
**Solution**: 
1. In Telnyx, find the "Webhooks" or "Dynamic Variables" section
2. Add the webhook URL
3. Set trigger to "On Call Start" or "Assistant Initialization"

## 5. WHERE TO ADD WEBHOOK IN TELNYX

Look for one of these sections in Telnyx AI Assistant:
- **Webhooks** tab
- **Dynamic Variables** section
- **Tools** section with "Add Webhook" option
- **Advanced Settings** with webhook configuration

The webhook must be configured to run BEFORE the greeting is spoken!

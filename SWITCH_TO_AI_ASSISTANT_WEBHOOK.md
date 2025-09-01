# ✅ USE THIS WEBHOOK IN TELNYX

## THE WEBHOOK YOU SHOULD USE:
```
https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/ai-assistant-webhook
```

## HOW TO UPDATE TELNYX:

### Step 1: Go to Telnyx Dashboard
1. Log into Telnyx
2. Go to your AI Dispatcher settings
3. Find the webhook URL field

### Step 2: Update the Webhook URL
Change FROM:
```
https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/telnyx-dynamic-variables
```

Change TO:
```
https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/ai-assistant-webhook
```

### Step 3: Keep Greeting As Is
Keep your greeting as:
```
{{greeting_message}}
```

### Step 4: Save and Test
1. Save the changes
2. Make a test call to +1 (437) 524-9932
3. You should hear: "Thank you for calling Nicks appliance repair. I'm Sarah. Which appliance needs our attention today?"

## BOTH WEBHOOKS WORK:
- `telnyx-dynamic-variables` - The old one (currently being used)
- `ai-assistant-webhook` - The new one (you want to switch to)

Both return the same variables including `greeting_message`.

## TEST BEFORE SWITCHING:
Run the test script `test-ai-assistant-webhook.js` in your browser console to verify it's working before you update Telnyx.

## VARIABLES RETURNED:
Both webhooks return:
- `{{greeting_message}}` - The full greeting with variables
- `{{company_name}}` - Nicks appliance repair
- `{{agent_name}}` - Sarah
- `{{services_offered}}` - Refrigerator, Washer, Dryer, Dishwasher, Oven
- `{{additional_info}}` - Service call $89 • Emergency +$50 • 90-day warranty...
- Plus all other variables

## STATUS:
✅ Both webhooks are deployed and working
✅ Both return greeting_message
✅ You can switch to ai-assistant-webhook anytime
# Fix Telnyx Webhook Configuration

## The Problem
- Test messages (sent via our test script) are working ✅
- Real SMS from Petrus are NOT appearing in the app ❌

## The Solution - Configure Webhook in Telnyx Portal

1. **Log into Telnyx Portal**: https://portal.telnyx.com

2. **Navigate to Messaging**:
   - Click "Messaging" in the left sidebar
   - Click "Messaging Profiles"

3. **Edit Your Messaging Profile**:
   - Find your active messaging profile
   - Click the edit icon (✏️)

4. **Set Webhook URL**:
   - In the "Webhooks" section
   - Set "Send a webhook to this URL" to:
   ```
   https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/sms-webhook
   ```
   - Make sure it's EXACTLY this URL (no trailing slash)

5. **Save the Profile**:
   - Click "Save" at the bottom

6. **Test Again**:
   - Ask Petrus to send another SMS
   - It should now appear in your Connect page

## Why This Is Happening
- Our test messages work because we send them directly to the webhook
- Real SMS from phones need Telnyx to forward them to your webhook
- Telnyx only forwards if the webhook URL is configured in the messaging profile

## Current Status
- ✅ Webhook is deployed and working
- ✅ Test messages are processed correctly
- ❌ Telnyx isn't forwarding real SMS to the webhook
- 🔧 Need to configure webhook URL in Telnyx Portal

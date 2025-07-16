# Telnyx Functions Manual Update Guide

Since the edge functions are already deployed and we don't have the source code locally, you need to update the API key through the Supabase Dashboard.

## Option 1: Update Secrets via Dashboard (Recommended)

1. Go to: https://supabase.com/dashboard/project/mqppvcrlvsgrsqelglod/settings/vault
2. Look for `TELNYX_API_KEY` in the secrets
3. Update it with your new API key
4. The change will take effect immediately for all edge functions

## Option 2: Update via CLI (If you have the API key)

```bash
supabase secrets set TELNYX_API_KEY=your_new_api_key_here
```

## Option 3: Redeploy Functions (Requires Source Code)

If you need to modify the functions themselves, you would need to:
1. Create the function directories locally
2. Write the function code
3. Deploy with `supabase functions deploy <function-name>`

## Current Telnyx Functions Using the API Key:

1. **telnyx-sms** - Core SMS sending
2. **send-invoice-sms** - Invoice SMS notifications
3. **send-estimate-sms** - Estimate SMS notifications
4. **telnyx-webhook** - Incoming SMS handler
5. **telnyx-voice-webhook** - Voice call handler
6. **telnyx-phone-numbers** - Phone number management
7. **manage-phone-numbers** - Phone inventory
8. **setup-telnyx-number** - Number configuration
9. **sync-telnyx-numbers** - Sync with Telnyx
10. **telnyx-phone-manager** - Phone management
11. **telnyx-webhook-handler** - Webhook processor
12. **telnyx-webhook-router** - Webhook routing
13. **telnyx-make-call** - Outbound calls
14. **telnyx-messaging-profile** - SMS profiles

## Webhook Configuration

After updating the API key, make sure these webhooks are configured in your Telnyx dashboard:

### For SMS (Messaging Profile):
- **Webhook URL**: `https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/telnyx-webhook`
- **Webhook Failover URL**: (optional, same URL)
- **Webhook API Version**: 2

### For Voice (TeXML Application):
- **Voice Webhook URL**: `https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/telnyx-voice-webhook`
- **Status Callback URL**: Same as above
- **Webhook API Version**: 2

## Testing After Update

1. **Test SMS Sending**:
   - Try sending an invoice or estimate via SMS
   - Check function logs in Supabase Dashboard

2. **Test SMS Receiving**:
   - Send an SMS to your Telnyx number
   - Check if it appears in the communication logs

3. **Check Logs**:
   - Go to: https://supabase.com/dashboard/project/mqppvcrlvsgrsqelglod/functions
   - Click on any function to see its logs

# SMS Webhook Deployment Guide

## Overview
This guide explains how to deploy and configure the SMS webhook for production use with Telnyx.

## 1. Deploy the Webhook Function

Deploy the webhook with JWT verification disabled (required for external webhooks):

```bash
npx supabase functions deploy sms-webhook --no-verify-jwt
```

## 2. Set the Webhook Secret

### Option A: Using the Supabase Dashboard
1. Go to: https://supabase.com/dashboard/project/mqppvcrlvsgrsqelglod/functions/secrets
2. Add a new secret:
   - Key: `TELNYX_WEBHOOK_SECRET`
   - Value: Generate a secure random string (at least 32 characters)
3. Click Save

### Option B: Using the CLI
```bash
# Generate a secure secret (run this in terminal)
openssl rand -hex 32

# Set the secret
npx supabase secrets set TELNYX_WEBHOOK_SECRET=your_generated_secret_here
```

## 3. Configure Telnyx Webhook

1. Log into your Telnyx account
2. Navigate to Messaging > Webhooks
3. Add a new webhook:
   - URL: `https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/sms-webhook`
   - Events: Select "Inbound Message"
   - Secret: Use the same secret you set in Supabase
4. Save the webhook configuration

## 4. Verify Webhook is Working

### Check Function Logs
1. Go to: https://supabase.com/dashboard/project/mqppvcrlvsgrsqelglod/functions/sms-webhook/logs
2. Send a test SMS to your Telnyx number
3. You should see logs showing:
   - "Webhook received"
   - Message processing details
   - "Message stored successfully"

### Check Database
1. Go to Table Editor in Supabase Dashboard
2. Check these tables:
   - `sms_messages` - Should have new inbound messages
   - `sms_conversations` - Should have conversation records
   - `clients` - Should have auto-created clients for unknown numbers

## 5. Security Checklist

✅ JWT verification disabled (required for webhooks)
✅ TELNYX_WEBHOOK_SECRET set in edge function secrets
✅ Webhook URL uses HTTPS (enforced by Supabase)
✅ Signature verification implemented in webhook code
✅ Request validation for Telnyx message format
✅ Error handling prevents data leaks

## 6. Troubleshooting

### Webhook Not Receiving Messages
- Verify webhook URL is correct in Telnyx
- Check function is deployed: https://supabase.com/dashboard/project/mqppvcrlvsgrsqelglod/functions
- Ensure Telnyx number is configured to use webhooks

### Database Errors
- Check RLS policies on sms_messages and sms_conversations tables
- Verify service_role key is being used in webhook
- Check foreign key relationships are correct

### Signature Verification Failed
- Ensure TELNYX_WEBHOOK_SECRET matches in both Telnyx and Supabase
- Verify the secret doesn't have extra spaces or newlines
- Check Telnyx is sending the signature headers

## Production Considerations

1. **Monitoring**: Set up alerts for webhook failures
2. **Rate Limiting**: Telnyx handles rate limiting on their side
3. **Retry Logic**: Telnyx will retry failed webhooks automatically
4. **Scaling**: Edge functions scale automatically with load
5. **Backup**: Consider logging raw webhook payloads for debugging

## Next Steps

1. Test with real SMS messages
2. Monitor logs for any errors
3. Set up alerting for webhook failures
4. Consider implementing webhook event deduplication if needed

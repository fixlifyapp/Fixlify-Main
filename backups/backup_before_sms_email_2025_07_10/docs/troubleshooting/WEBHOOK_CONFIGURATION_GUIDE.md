# Webhook Configuration Guide for Fixlify

## 🔍 Current Webhook Status

### Edge Functions Handling Webhooks:
1. **telnyx-webhook** - Handles incoming SMS messages
2. **telnyx-voice-webhook** - Handles voice calls
3. **mailgun-webhook** - Handles email delivery status

### Webhook URLs for Your Project:
```
SMS Webhook: https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/telnyx-webhook
Voice Webhook: https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/telnyx-voice-webhook
Email Webhook: https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/mailgun-webhook
```

## 📱 Telnyx Webhook Configuration

### Step 1: Configure Messaging Profile
1. Log in to Telnyx Portal: https://portal.telnyx.com
2. Go to **Messaging** → **Messaging Profiles**
3. Select your messaging profile (or create one)
4. In the **Webhooks** section, set:
   - **Webhook URL**: `https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/telnyx-webhook`
   - **Webhook Failover URL**: (optional, same URL)
   - **Webhook API Version**: `2`
   - **Webhook HTTP Method**: `POST`

### Step 2: Configure Voice Application (TeXML)
1. Go to **Voice** → **TeXML Applications**
2. Select your application (or create one)
3. Set the webhooks:
   - **Voice URL**: `https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/telnyx-voice-webhook`
   - **Voice Method**: `POST`
   - **Status Callback URL**: Same as Voice URL
   - **Status Callback Method**: `POST`

### Step 3: Link Phone Numbers
1. Go to **Numbers** → **My Numbers**
2. For each phone number:
   - Click on the number
   - Under **Messaging Settings**, select your messaging profile
   - Under **Voice Settings**, select your TeXML application
   - Save changes

## 📧 Mailgun Webhook Configuration

### Step 1: Configure Webhooks
1. Log in to Mailgun: https://app.mailgun.com
2. Select your domain (mg.fixlify.com)
3. Go to **Webhooks** (under Sending)
4. Add webhooks for:
   - **Delivered Messages**: `https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/mailgun-webhook`
   - **Permanent Failure**: Same URL
   - **Temporary Failure**: Same URL
   - **Opened Messages**: Same URL (if tracking enabled)
   - **Clicked Messages**: Same URL (if tracking enabled)

## 🧪 Testing Webhooks

### Test Telnyx SMS Webhook:
1. Send an SMS to your Telnyx phone number
2. Check the logs:
   ```bash
   # In your project directory
   supabase functions logs telnyx-webhook --tail
   ```
3. Check database for incoming messages

### Test Mailgun Webhook:
1. Send a test email through the app
2. Check the logs:
   ```bash
   supabase functions logs mailgun-webhook --tail
   ```
3. Check email status updates in database

### Test Voice Webhook:
1. Call your Telnyx phone number
2. Check the logs:
   ```bash
   supabase functions logs telnyx-voice-webhook --tail
   ```

## 🔐 Webhook Security

### Telnyx Webhook Verification:
- Telnyx signs webhooks with a signature
- The edge function should verify this signature
- Check for `telnyx-signature-ed25519` header

### Mailgun Webhook Verification:
- Mailgun provides webhook signing keys
- Verify the signature in the edge function
- Check for `signature` in the webhook payload

## 📊 Monitoring Webhooks

### Database Queries to Check Webhook Activity:
```sql
-- Check communication logs
SELECT * FROM communication_logs 
WHERE created_at > NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC;

-- Check SMS communications
SELECT * FROM estimate_communications 
WHERE communication_type = 'sms'
AND created_at > NOW() - INTERVAL '1 hour';

-- Check email status updates
SELECT * FROM invoice_communications 
WHERE communication_type = 'email'
AND created_at > NOW() - INTERVAL '1 hour';
```

## 🚨 Common Issues

### Webhook Not Receiving Data:
1. Verify the URL is correct (no typos)
2. Check if edge function is deployed and active
3. Ensure API keys are set in Supabase secrets
4. Check Telnyx/Mailgun logs for delivery attempts

### Webhook Returns Errors:
1. Check edge function logs for error details
2. Verify database permissions
3. Check for missing environment variables
4. Ensure proper data format handling

### Two-Way SMS Not Working:
1. Verify messaging profile has webhook URL
2. Check phone number is linked to profile
3. Ensure edge function processes incoming messages
4. Check database for message storage

## 📝 Verification Checklist

- [ ] Telnyx messaging profile has webhook URL configured
- [ ] Telnyx voice application has webhook URL configured
- [ ] Phone numbers are linked to correct profiles
- [ ] Mailgun domain has webhooks configured
- [ ] Edge functions are deployed and active
- [ ] API keys are set in Supabase secrets
- [ ] Database tables exist for logging
- [ ] Test messages are being received
- [ ] Webhook signatures are being verified

# Telnyx Webhook Test Results

## Summary
The Telnyx webhook function has been successfully deployed and configured to accept webhooks from Telnyx without requiring authentication.

## Webhook URL
```
https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/telnyx-webhook
```

## Configuration
- JWT verification has been disabled for this function using `config.toml`
- The function accepts both Telnyx webhook signatures and regular authenticated requests
- Returns 200 OK even for errors to prevent Telnyx retry storms

## Test Results

### 1. Health Check (GET Request)
```bash
curl https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/telnyx-webhook
```
**Response:** `OK`

### 2. Telnyx Webhook Test (No Auth Required)
```bash
curl -X POST https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/telnyx-webhook \
  -H "Content-Type: application/json" \
  -H "telnyx-signature-ed25519-signature: test_signature" \
  -H "telnyx-signature-ed25519-timestamp: 1234567890" \
  -H "user-agent: Telnyx-Webhooks/1.0" \
  -d '{
    "data": {
      "record_type": "message",
      "id": "test_msg_123",
      "payload": {
        "from": {"phone_number": "+15551234567"},
        "to": [{"phone_number": "+19876543210"}],
        "text": "Test message",
        "direction": "inbound"
      }
    }
  }'
```
**Response:**
```json
{
  "success": true,
  "message": "Webhook acknowledged (phone number not registered)",
  "warning": "Phone number not found in system"
}
```

## Features Implemented

1. **No Authentication Required for Telnyx**
   - Detects Telnyx webhooks by headers (signature, timestamp, user-agent)
   - Bypasses JWT verification for Telnyx requests

2. **Graceful Error Handling**
   - Returns 200 OK even when phone number not found
   - Prevents Telnyx retry storms
   - Logs errors but acknowledges receipt

3. **Message Processing**
   - Stores inbound SMS messages in database
   - Creates notifications for users
   - Updates message status for delivery events

4. **Security**
   - Supports Telnyx signature verification (placeholder for Ed25519)
   - Service role key used for database operations
   - CORS headers properly configured

## Next Steps

1. **Configure in Telnyx Dashboard**
   - Log in to your Telnyx account
   - Navigate to Messaging > Webhooks
   - Add webhook URL: `https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/telnyx-webhook`
   - Select events to receive (message.received, message.sent, message.finalized, etc.)

2. **Add Telnyx Public Key**
   - Get your Telnyx public key from dashboard
   - Add to Supabase secrets: `TELNYX_PUBLIC_KEY`
   - Implement proper Ed25519 signature verification

3. **Test with Real Messages**
   - Send an SMS to your Telnyx number
   - Check Supabase logs for webhook activity
   - Verify messages are stored in `sms_messages` table

## Troubleshooting

If webhooks are not being received:
1. Check Supabase function logs in dashboard
2. Verify webhook URL is correctly configured in Telnyx
3. Ensure your Telnyx number is active and configured for messaging
4. Check that the phone number exists in your `phone_numbers` table

## Sample CURL Commands

### Test Inbound SMS
```bash
curl -X POST https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/telnyx-webhook \
  -H "Content-Type: application/json" \
  -H "telnyx-signature-ed25519-signature: test" \
  -H "telnyx-signature-ed25519-timestamp: $(date +%s)" \
  -d '{"data":{"payload":{"from":{"phone_number":"+1234567890"},"to":[{"phone_number":"+0987654321"}],"text":"Hello","direction":"inbound"}}}'
```

### Test Delivery Status
```bash
curl -X POST https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/telnyx-webhook \
  -H "Content-Type: application/json" \
  -H "telnyx-signature-ed25519-signature: test" \
  -d '{"data":{"record_type":"event","event_type":"message.finalized","id":"msg_123","payload":{"id":"msg_123"}}}'
```
# Telnyx Webhook Test CURL Commands

## Quick Test - Single Command

### Inbound SMS Test (Copy and paste this into your terminal)

```bash
curl -X POST https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/telnyx-webhook \
  -H "Content-Type: application/json" \
  -H "telnyx-signature-ed25519-signature: test_signature" \
  -H "telnyx-signature-ed25519-timestamp: 1234567890" \
  -H "user-agent: Telnyx-Webhooks/1.0" \
  -d '{"data":{"record_type":"message","id":"test123","event_type":"message.received","payload":{"from":{"phone_number":"+15551234567","carrier":"Verizon","line_type":"Wireless"},"to":[{"phone_number":"+19876543210","status":"delivered"}],"text":"Test message from Telnyx","direction":"inbound","received_at":"2025-01-10T12:00:00.000Z"}}}'
```

### Windows PowerShell Version

```powershell
$headers = @{
    "Content-Type" = "application/json"
    "telnyx-signature-ed25519-signature" = "test_signature"
    "telnyx-signature-ed25519-timestamp" = [string](Get-Date -UFormat %s)
    "user-agent" = "Telnyx-Webhooks/1.0"
}

$body = @{
    data = @{
        record_type = "message"
        id = "test_$(Get-Random)"
        event_type = "message.received"
        payload = @{
            from = @{
                phone_number = "+15551234567"
                carrier = "Verizon"
                line_type = "Wireless"
            }
            to = @(
                @{
                    phone_number = "+19876543210"
                    status = "delivered"
                }
            )
            text = "Test message from Telnyx"
            direction = "inbound"
            received_at = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.000Z")
        }
    }
} | ConvertTo-Json -Depth 10

Invoke-RestMethod -Uri "https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/telnyx-webhook" -Method Post -Headers $headers -Body $body
```

## Full Test Suite Commands

### 1. Test Inbound SMS
```bash
curl -X POST https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/telnyx-webhook \
  -H "Content-Type: application/json" \
  -H "telnyx-signature-ed25519-signature: test_sig_123" \
  -H "telnyx-signature-ed25519-timestamp: $(date +%s)" \
  -H "user-agent: Telnyx-Webhooks/1.0" \
  -d '{
    "data": {
      "record_type": "message",
      "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "event_type": "message.received",
      "created_at": "'$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")'",
      "payload": {
        "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        "type": "SMS",
        "from": {
          "phone_number": "+15551234567",
          "carrier": "Verizon",
          "line_type": "Wireless"
        },
        "to": [
          {
            "phone_number": "+19876543210",
            "status": "delivered"
          }
        ],
        "text": "Hello, this is a test message!",
        "direction": "inbound",
        "media": [],
        "webhook_url": "https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/telnyx-webhook",
        "encoding": "GSM-7",
        "parts": 1,
        "cost": null,
        "received_at": "'$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")'",
        "errors": []
      }
    },
    "meta": {
      "attempt": 1,
      "delivered_to": "https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/telnyx-webhook"
    }
  }'
```

### 2. Test Outbound SMS Sent
```bash
curl -X POST https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/telnyx-webhook \
  -H "Content-Type: application/json" \
  -H "telnyx-signature-ed25519-signature: test_sig_456" \
  -H "telnyx-signature-ed25519-timestamp: $(date +%s)" \
  -H "user-agent: Telnyx-Webhooks/1.0" \
  -d '{
    "data": {
      "record_type": "event",
      "event_type": "message.sent",
      "payload": {
        "id": "msg_out_123",
        "type": "SMS",
        "from": {
          "phone_number": "+19876543210"
        },
        "to": [
          {
            "phone_number": "+15551234567",
            "status": "sent"
          }
        ],
        "text": "Your appointment is confirmed",
        "direction": "outbound",
        "cost": {
          "amount": "0.004",
          "currency": "USD"
        },
        "sent_at": "'$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")'"
      }
    }
  }'
```

### 3. Test Message Delivered
```bash
curl -X POST https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/telnyx-webhook \
  -H "Content-Type: application/json" \
  -H "telnyx-signature-ed25519-signature: test_sig_789" \
  -H "telnyx-signature-ed25519-timestamp: $(date +%s)" \
  -H "user-agent: Telnyx-Webhooks/1.0" \
  -d '{
    "data": {
      "record_type": "event",
      "event_type": "message.finalized",
      "payload": {
        "id": "msg_out_123",
        "to": [
          {
            "phone_number": "+15551234567",
            "status": "delivered"
          }
        ],
        "completed_at": "'$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")'"
      }
    }
  }'
```

### 4. Test MMS with Media
```bash
curl -X POST https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/telnyx-webhook \
  -H "Content-Type: application/json" \
  -H "telnyx-signature-ed25519-signature: test_sig_mms" \
  -H "telnyx-signature-ed25519-timestamp: $(date +%s)" \
  -H "user-agent: Telnyx-Webhooks/1.0" \
  -d '{
    "data": {
      "record_type": "message",
      "event_type": "message.received",
      "payload": {
        "type": "MMS",
        "from": {
          "phone_number": "+15551234567"
        },
        "to": [{
          "phone_number": "+19876543210"
        }],
        "text": "Check out this photo!",
        "direction": "inbound",
        "media": [{
          "url": "https://example.com/image.jpg",
          "content_type": "image/jpeg"
        }]
      }
    }
  }'
```

### 5. Test Failed Message
```bash
curl -X POST https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/telnyx-webhook \
  -H "Content-Type: application/json" \
  -H "telnyx-signature-ed25519-signature: test_sig_fail" \
  -H "telnyx-signature-ed25519-timestamp: $(date +%s)" \
  -H "user-agent: Telnyx-Webhooks/1.0" \
  -d '{
    "data": {
      "record_type": "event",
      "event_type": "message.failed",
      "payload": {
        "id": "msg_fail_123",
        "to": [{
          "phone_number": "+15551234567",
          "status": "failed"
        }],
        "errors": [{
          "code": "40003",
          "title": "Destination Unreachable"
        }]
      }
    }
  }'
```

## Expected Responses

### Successful Response (Phone number not in system):
```json
{
  "success": true,
  "message": "Webhook acknowledged (phone number not registered)",
  "warning": "Phone number not found in system"
}
```

### Successful Response (Phone number exists):
```json
{
  "success": true,
  "message": "Webhook processed successfully",
  "messageId": "test123"
}
```

## Testing Tips

1. **Use `-v` flag for verbose output:**
   ```bash
   curl -v -X POST https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/telnyx-webhook ...
   ```

2. **Pretty print JSON response:**
   ```bash
   curl ... | jq .
   ```

3. **Save response to file:**
   ```bash
   curl ... > response.json
   ```

4. **Test with your actual phone numbers:**
   - Replace `+15551234567` with your actual Telnyx phone number
   - Replace `+19876543210` with a destination number

5. **Check Supabase logs:**
   - Go to: https://supabase.com/dashboard/project/mqppvcrlvsgrsqelglod/functions
   - Click on `telnyx-webhook`
   - View logs to see detailed processing information
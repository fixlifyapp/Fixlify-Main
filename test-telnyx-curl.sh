#!/bin/bash
# Test Telnyx webhook with curl

echo "Testing Telnyx webhook with curl..."

# Create timestamp
TIMESTAMP=$(date +%s)

# Create the JSON payload
PAYLOAD=$(cat <<EOF
{
  "data": {
    "record_type": "message",
    "id": "test_msg_123",
    "event_type": "message.received",
    "payload": {
      "from": {
        "phone_number": "+15551234567",
        "carrier": "Test Carrier",
        "line_type": "Wireless"
      },
      "to": [{
        "phone_number": "+19876543210",
        "status": "queued"
      }],
      "text": "Test message from curl",
      "direction": "inbound",
      "received_at": "$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")"
    }
  }
}
EOF
)

# Send the request with Telnyx headers
curl -X POST https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/telnyx-webhook \
  -H "Content-Type: application/json" \
  -H "telnyx-signature-ed25519-signature: test_signature" \
  -H "telnyx-signature-ed25519-timestamp: $TIMESTAMP" \
  -H "user-agent: Telnyx-Webhooks/1.0" \
  -d "$PAYLOAD" \
  -v
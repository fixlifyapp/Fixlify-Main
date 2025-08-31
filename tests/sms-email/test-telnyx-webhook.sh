#!/bin/bash
# Telnyx Webhook Test Commands
# Test the webhook from Telnyx to Supabase

WEBHOOK_URL="https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/telnyx-webhook"
TIMESTAMP=$(date +%s)

echo "=========================================="
echo "Telnyx Webhook Test Commands"
echo "Webhook URL: $WEBHOOK_URL"
echo "=========================================="
echo ""

# 1. Basic Inbound SMS Test
echo "1. Testing Inbound SMS Message"
echo "------------------------------"
curl -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -H "telnyx-signature-ed25519-signature: test_signature_123" \
  -H "telnyx-signature-ed25519-timestamp: $TIMESTAMP" \
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
        "text": "Hello, this is a test message from Telnyx!",
        "direction": "inbound",
        "media": [],
        "webhook_url": "'$WEBHOOK_URL'",
        "webhook_failover_url": "",
        "encoding": "GSM-7",
        "parts": 1,
        "tags": [],
        "cost": null,
        "received_at": "'$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")'",
        "sent_at": null,
        "completed_at": null,
        "valid_until": null,
        "errors": []
      }
    },
    "meta": {
      "attempt": 1,
      "delivered_to": "'$WEBHOOK_URL'"
    }
  }' \
  -w "\n\nHTTP Status: %{http_code}\n" \
  -s | jq .

echo ""
echo "=========================================="
echo ""

# 2. Outbound SMS Sent Status
echo "2. Testing Outbound SMS Sent Status"
echo "------------------------------------"
curl -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -H "telnyx-signature-ed25519-signature: test_signature_456" \
  -H "telnyx-signature-ed25519-timestamp: $TIMESTAMP" \
  -H "user-agent: Telnyx-Webhooks/1.0" \
  -d '{
    "data": {
      "record_type": "event",
      "id": "ev_123456",
      "event_type": "message.sent",
      "created_at": "'$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")'",
      "payload": {
        "id": "msg_outbound_123",
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
        "text": "Your appointment is confirmed for tomorrow at 2 PM",
        "direction": "outbound",
        "webhook_url": "'$WEBHOOK_URL'",
        "encoding": "GSM-7",
        "parts": 1,
        "cost": {
          "amount": "0.004",
          "currency": "USD"
        },
        "sent_at": "'$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")'",
        "completed_at": null,
        "valid_until": null,
        "errors": []
      }
    }
  }' \
  -w "\n\nHTTP Status: %{http_code}\n" \
  -s | jq .

echo ""
echo "=========================================="
echo ""

# 3. Message Delivered Status
echo "3. Testing Message Delivered Status"
echo "-----------------------------------"
curl -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -H "telnyx-signature-ed25519-signature: test_signature_789" \
  -H "telnyx-signature-ed25519-timestamp: $TIMESTAMP" \
  -H "user-agent: Telnyx-Webhooks/1.0" \
  -d '{
    "data": {
      "record_type": "event",
      "id": "ev_789012",
      "event_type": "message.finalized",
      "created_at": "'$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")'",
      "payload": {
        "id": "msg_outbound_123",
        "to": [
          {
            "phone_number": "+15551234567",
            "status": "delivered"
          }
        ],
        "type": "SMS",
        "completed_at": "'$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")'"
      }
    }
  }' \
  -w "\n\nHTTP Status: %{http_code}\n" \
  -s | jq .

echo ""
echo "=========================================="
echo ""

# 4. MMS Message with Media
echo "4. Testing MMS Message with Media"
echo "---------------------------------"
curl -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -H "telnyx-signature-ed25519-signature: test_signature_mms" \
  -H "telnyx-signature-ed25519-timestamp: $TIMESTAMP" \
  -H "user-agent: Telnyx-Webhooks/1.0" \
  -d '{
    "data": {
      "record_type": "message",
      "id": "mms_123456",
      "event_type": "message.received",
      "created_at": "'$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")'",
      "payload": {
        "id": "mms_123456",
        "type": "MMS",
        "from": {
          "phone_number": "+15551234567",
          "carrier": "AT&T",
          "line_type": "Wireless"
        },
        "to": [
          {
            "phone_number": "+19876543210",
            "status": "delivered"
          }
        ],
        "text": "Check out this photo!",
        "direction": "inbound",
        "media": [
          {
            "url": "https://example.com/image.jpg",
            "content_type": "image/jpeg",
            "size": 102400
          }
        ],
        "webhook_url": "'$WEBHOOK_URL'",
        "encoding": "GSM-7",
        "parts": 1,
        "received_at": "'$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")'"
      }
    }
  }' \
  -w "\n\nHTTP Status: %{http_code}\n" \
  -s | jq .

echo ""
echo "=========================================="
echo ""

# 5. Message Failed Status
echo "5. Testing Message Failed Status"
echo "--------------------------------"
curl -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -H "telnyx-signature-ed25519-signature: test_signature_fail" \
  -H "telnyx-signature-ed25519-timestamp: $TIMESTAMP" \
  -H "user-agent: Telnyx-Webhooks/1.0" \
  -d '{
    "data": {
      "record_type": "event",
      "id": "ev_failed_123",
      "event_type": "message.failed",
      "created_at": "'$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")'",
      "payload": {
        "id": "msg_failed_123",
        "to": [
          {
            "phone_number": "+15551234567",
            "status": "failed"
          }
        ],
        "type": "SMS",
        "errors": [
          {
            "code": "40003",
            "title": "Destination Unreachable",
            "detail": "The destination number is not reachable"
          }
        ],
        "failed_at": "'$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")'"
      }
    }
  }' \
  -w "\n\nHTTP Status: %{http_code}\n" \
  -s | jq .
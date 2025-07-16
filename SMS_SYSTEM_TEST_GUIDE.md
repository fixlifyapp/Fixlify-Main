# SMS System Test Guide - Complete

## Overview
The SMS system has been updated to handle incoming messages from unknown numbers. This guide provides comprehensive testing instructions.

## System Features

### ✅ Already Implemented
1. **Two-way SMS conversations** via Telnyx
2. **Automatic phone number formatting** to E.164 format
3. **Unknown number handling** - auto-creates client records
4. **Real-time updates** using Supabase subscriptions
5. **Message status tracking** (sent, delivered, failed)
6. **Unread message counts**
7. **Conversation management** in Connect Center

### 🔧 How It Works

#### Sending SMS
1. User sends message via UI
2. `send-sms` edge function formats phone numbers
3. Message sent via Telnyx API
4. Response logged in database
5. UI updates in real-time

#### Receiving SMS
1. Telnyx sends webhook to `sms-webhook`
2. Function checks if sender is existing client
3. If unknown, creates new client automatically
4. Creates/updates conversation
5. Logs message and notifies user

## Testing Instructions

### 1. Test SMS Page (`/sms-test`)
```
1. Navigate to: https://app.fixlify.com/sms-test
2. Enter phone number (any format works):
   - +14165551234
   - 416-555-1234
   - (416) 555-1234
   - 4165551234
3. Enter test message
4. Click "Send Test SMS"
5. Check response details
```

### 2. Connect Center (`/communications`)
```
1. Navigate to: https://app.fixlify.com/communications
2. View all SMS conversations
3. Click on a conversation to view messages
4. Send a reply
5. Watch for real-time updates
```

### 3. Test Unknown Number Handling

#### Option A: Real SMS Test
```
1. Send an SMS from a phone not in your client list to your Telnyx number
2. Check Connect Center - new conversation should appear
3. Check Clients page - new client should be created as "Unknown (+1XXXXXXXXXX)"
```

#### Option B: Script Test
```bash
# Run the test script
node test-incoming-sms.js
```

This script will:
- Simulate incoming SMS from unknown number
- Create new client automatically
- Create conversation
- Log all results

### 4. Test Scenarios

#### Basic Send Test
```javascript
// Test data
Phone: +14165551234
Message: "Test message from Fixlify"
Expected: Success, message delivered
```

#### Unknown Number Test
```javascript
// Incoming from unknown
From: +19999999999
To: Your Telnyx number
Message: "I need service"
Expected: 
- New client created: "Unknown (+19999999999)"
- New conversation created
- Message appears in Connect Center
```

#### Format Conversion Test
```javascript
// Various formats
Input: "416-555-1234"
Output: "+14165551234"

Input: "(416) 555-1234"
Output: "+14165551234"

Input: "4165551234"
Output: "+14165551234"

Input: "+14165551234"
Output: "+14165551234" (unchanged)
```

## Troubleshooting

### Common Issues

1. **"User does not have a primary phone number"**
   - Solution: Add phone number in database and set is_primary = true

2. **"Invalid phone number format"**
   - Solution: Check that number is 10 digits (US/Canada)
   - Edge function handles formatting automatically

3. **Messages not appearing**
   - Check webhook configuration in Telnyx
   - Verify edge functions are deployed
   - Check Supabase logs

### Debug Checklist
- [ ] TELNYX_API_KEY set in Supabase secrets
- [ ] User has primary phone number
- [ ] Webhook URL configured in Telnyx
- [ ] Edge functions deployed (send-sms, sms-webhook)
- [ ] RLS policies enabled on tables

## Database Verification

### Check Phone Numbers
```sql
SELECT * FROM phone_numbers WHERE user_id = 'YOUR_USER_ID';
```

### Check Recent Messages
```sql
SELECT * FROM sms_messages 
ORDER BY created_at DESC 
LIMIT 10;
```

### Check Unknown Clients
```sql
SELECT * FROM clients 
WHERE name LIKE 'Unknown%'
ORDER BY created_at DESC;
```

### Check Conversations
```sql
SELECT 
  sc.*,
  c.name as client_name
FROM sms_conversations sc
LEFT JOIN clients c ON c.id = sc.client_id
ORDER BY sc.last_message_at DESC;
```

## API Testing

### Send SMS via API
```bash
curl -X POST https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/send-sms \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "+14165551234",
    "message": "Test from API",
    "userId": "YOUR_USER_ID"
  }'
```

### Simulate Incoming SMS
```bash
curl -X POST https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/sms-webhook \
  -H "Authorization: Bearer YOUR_SERVICE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "event_type": "message.received",
      "payload": {
        "id": "test-123",
        "from": {"phone_number": "+19999999999"},
        "to": [{"phone_number": "+14377476737"}],
        "text": "Test incoming message"
      }
    }
  }'
```

## Verification Steps

### After Sending SMS
1. Check `communication_logs` table for outbound entry
2. Check `sms_messages` for message record
3. Verify conversation updated with last_message_at
4. Confirm Telnyx dashboard shows sent message

### After Receiving SMS
1. Check new client created (if unknown number)
2. Verify conversation exists/created
3. Check message in `sms_messages`
4. Confirm unread_count incremented
5. Verify notification created
6. Check Connect Center shows new message

## Integration Points

### Estimates
- SMS option available when sending estimates
- Uses same `send-sms` function
- Logs show estimate context

### Invoices
- SMS sending for invoice delivery
- Payment reminder SMS
- Status update messages

### Automations
- SMS steps in workflows
- Triggered by job status changes
- Template-based messaging

## Best Practices

1. **Always use primary phone number** for sending
2. **Store numbers in E.164 format** in database
3. **Handle errors gracefully** in UI
4. **Test with real phones** periodically
5. **Monitor webhook failures** in Telnyx
6. **Keep message logs** for compliance

## Summary

The SMS system is fully functional with:
- ✅ Two-way messaging
- ✅ Unknown number handling
- ✅ Automatic formatting
- ✅ Real-time updates
- ✅ Complete logging

Test using:
1. SMS Test Page for basic sending
2. Connect Center for conversations
3. Test script for unknown numbers
4. Real phone tests for end-to-end

All functionality is ready for production use!
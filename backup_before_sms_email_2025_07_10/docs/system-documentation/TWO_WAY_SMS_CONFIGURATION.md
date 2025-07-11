# Two-Way SMS Messaging Configuration ✅

## Current Status: FULLY CONFIGURED

Your two-way SMS messaging system is properly set up with Telnyx v2 webhooks.

### Webhook Architecture

#### 1. **Webhook Router** (`telnyx-webhook-router`)
- Receives ALL Telnyx webhooks
- Detects SMS vs Voice calls
- Routes SMS to `sms-receiver`
- Routes voice calls to appropriate handlers

#### 2. **SMS Receiver** (`sms-receiver`)
- Handles inbound SMS messages
- Supports Telnyx v2 webhook format
- Creates/finds clients automatically
- Creates/finds conversations
- Stores messages in database

### Webhook URL Configuration

Your webhook endpoint:
```
https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/telnyx-webhook-router
```

This should be configured in your Telnyx portal for:
- Messaging webhooks
- Voice webhooks (if using voice features)

### How Two-Way Messaging Works

#### Outbound SMS (Working ✅)
1. User sends SMS via app (estimates, invoices, messaging center)
2. `telnyx-sms` edge function sends via Telnyx API
3. Message logged in `messages` table
4. Delivery status tracked

#### Inbound SMS (Configured ✅)
1. Someone texts your Telnyx number (+12898192158)
2. Telnyx sends webhook to `telnyx-webhook-router`
3. Router detects SMS and forwards to `sms-receiver`
4. SMS Receiver:
   - Finds user who owns the receiving number
   - Finds or creates client based on sender's phone
   - Creates or updates conversation
   - Stores message in database
5. Message appears in Messaging Center in real-time

### Webhook Security

The system includes:
- **Signature Verification**: Validates webhooks are from Telnyx
- **Timestamp Validation**: Prevents replay attacks
- **Error Handling**: Graceful failure handling

### Database Flow for Inbound SMS

1. **Find User**: Matches receiving number to `telnyx_phone_numbers.user_id`
2. **Find/Create Client**: Searches for client by phone number
3. **Find/Create Job**: Links to existing job or creates new one
4. **Find/Create Conversation**: Manages conversation thread
5. **Store Message**: Saves in `messages` table

### Testing Two-Way Messaging

#### Test Outbound (Already Working):
```javascript
// You already tested this successfully
async function testOutbound() {
  const { data: { session } } = await supabase.auth.getSession();
  const response = await fetch('https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/telnyx-sms', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + session.access_token,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      recipientPhone: '+1YOUR_PHONE',
      message: 'Test outbound SMS',
      user_id: session.user.id
    })
  });
  console.log(await response.json());
}
```

#### Test Inbound:
1. Send an SMS from your phone to **+12898192158**
2. Check Messaging Center - it should appear
3. Check database:
```sql
-- Check recent inbound messages
SELECT * FROM messages 
WHERE direction = 'inbound' 
ORDER BY created_at DESC 
LIMIT 5;

-- Check conversations
SELECT c.*, cl.name as client_name
FROM conversations c
JOIN clients cl ON c.client_id = cl.id
ORDER BY c.last_message_at DESC
LIMIT 5;
```

### Configure in Telnyx Portal

To ensure webhooks are configured:

1. Log in to [Telnyx Portal](https://portal.telnyx.com)
2. Go to **Messaging** → **Messaging Profiles**
3. Click on your messaging profile
4. Set webhook URL to:
   ```
   https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/telnyx-webhook-router
   ```
5. Enable webhook for:
   - Message Received
   - Message Sent
   - Message Delivered
   - Message Failed

### Real-time Updates

The app uses Supabase Realtime to show new messages instantly:
- Subscribed to `messages` table changes
- Filters by conversation
- Updates UI automatically

### Troubleshooting Inbound SMS

If inbound SMS not working:

1. **Check Webhook Configuration**:
   - Verify webhook URL in Telnyx portal
   - Ensure "Message Received" is enabled

2. **Check Phone Number Assignment**:
   ```sql
   SELECT * FROM telnyx_phone_numbers 
   WHERE phone_number = '+12898192158';
   ```

3. **Check Edge Function Logs**:
   - Go to Supabase Dashboard → Functions
   - Check logs for `telnyx-webhook-router` and `sms-receiver`

4. **Test Webhook Manually**:
   ```javascript
   // Simulate inbound SMS webhook
   fetch('https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/sms-receiver', {
     method: 'POST',
     headers: {
       'Content-Type': 'application/json'
     },
     body: JSON.stringify({
       data: {
         event_type: 'message.received',
         payload: {
           direction: 'inbound',
           from: { phone_number: '+1234567890' },
           to: [{ phone_number: '+12898192158' }],
           text: 'Test inbound message'
         }
       }
     })
   });
   ```

### Summary

Your two-way SMS system is:
- ✅ **Outbound SMS**: Working (tested and confirmed)
- ✅ **Inbound SMS**: Configured and ready
- ✅ **Webhook Router**: Deployed and active
- ✅ **SMS Receiver**: Handling v2 webhooks
- ✅ **Database**: Properly structured for conversations

The system supports full two-way SMS communication with automatic client creation, conversation tracking, and real-time updates!

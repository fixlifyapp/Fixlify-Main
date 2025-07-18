# SMS Two-Way Communication Testing Guide

## Overview
The SMS two-way communication system has been successfully implemented in the Connect Center. This guide will help you test the functionality.

## Testing Steps

### 1. Access the Application
1. Open your browser and navigate to `http://localhost:8082` (or whichever port is shown in your terminal)
2. Log in with your credentials

### 2. Navigate to Connect Center
1. Click on "Connect Center" in the sidebar or navigate to `/communications`
2. You should see the new SMS tab as the default view

### 3. Run the Test Setup Script
1. Open the browser developer console (F12)
2. Copy and paste the contents of `test-sms-system.js` into the console
3. Press Enter to run it
4. This script will:
   - Create a test phone number for your user
   - Create a test client with a phone number
   - Display diagnostic information

### 4. Test Creating a Conversation
1. In the Connect Center SMS tab, click the "+" button in the conversations list
2. Search for the test client by name or phone
3. Click on the client to create a conversation
4. The conversation should appear in the left panel

### 5. Test Sending a Message
1. Click on the conversation to select it
2. Type a message in the input field at the bottom
3. Click Send or press Enter
4. The message should appear in the conversation with a blue background (outbound)

### 6. Test Receiving a Message
1. Open the browser console again
2. Copy and paste the contents of `simulate-incoming-sms.js`
3. Press Enter to run it
4. This will simulate an incoming SMS from the client
5. You should see the message appear in the conversation with a gray background (inbound)
6. The conversation should update with an unread count if not currently selected

## Features to Test

### Conversation Management
- ✅ Create new conversations by selecting clients
- ✅ View list of active conversations
- ✅ Search conversations by client name or phone
- ✅ See last message preview in conversation list
- ✅ Unread message counts
- ✅ Timestamp showing when last message was sent

### Messaging
- ✅ Send SMS messages
- ✅ Receive SMS messages (via webhook)
- ✅ Real-time updates when messages are received
- ✅ Message status tracking (pending, sent, delivered, failed)
- ✅ Chronological message display
- ✅ Visual distinction between inbound/outbound messages

### Database Verification
Run these queries in Supabase SQL Editor to verify data:

```sql
-- Check conversations
SELECT * FROM sms_conversations 
ORDER BY updated_at DESC;

-- Check messages
SELECT * FROM sms_messages 
ORDER BY created_at DESC;

-- Check communication logs
SELECT * FROM communication_logs 
WHERE type = 'sms' 
ORDER BY created_at DESC;
```

## Webhook Configuration

For production use with real Telnyx numbers:

1. Log into your Telnyx account
2. Navigate to Messaging > Messaging Profiles
3. Select your messaging profile
4. Add webhook URL: `https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/sms-webhook`
5. Enable webhooks for:
   - Inbound Message
   - Message Sent
   - Message Finalized

## Troubleshooting

### No conversations showing
- Ensure you have run the test setup script
- Check that you have a primary phone number configured
- Verify clients have phone numbers

### Messages not sending
- Check Supabase logs: `/edge-functions` in dashboard
- Verify TELNYX_API_KEY is set in edge function secrets
- Check browser console for errors

### Incoming messages not appearing
- Verify webhook URL is correctly configured in Telnyx
- Check edge function logs for webhook calls
- Ensure the phone numbers match exactly

## Next Steps

Once testing is complete:
1. Configure real Telnyx phone numbers
2. Update webhook URL in Telnyx portal
3. Test with real SMS messages
4. Integrate SMS sending into estimates and invoices
5. Set up SMS templates for common messages
# Fix Inbound SMS Setup Guide

## Issues Found:
1. ✅ Outbound SMS is working
2. ❌ Inbound SMS not receiving 
3. ❌ Webhook not configured in Telnyx
4. ❌ Public key needs to be added to Supabase

## Step 1: Add Telnyx Public Key to Supabase

Your Telnyx public key: `e5jeBd2E62zcfqhmsfbYrlIgfP06y1KjlgRg2cGRg84=`

1. Go to [Supabase Edge Function Secrets](https://supabase.com/dashboard/project/mqppvcrlvsgrsqelglod/functions/secrets)
2. Add a new secret:
   ```
   TELNYX_PUBLIC_KEY = e5jeBd2E62zcfqhmsfbYrlIgfP06y1KjlgRg2cGRg84=
   ```
3. Click Save

## Step 2: Configure Webhook in Telnyx Portal

1. Go to [Telnyx Portal](https://portal.telnyx.com)
2. Navigate to **Messaging** → **Messaging Profiles**
3. Click on your messaging profile
4. In the **Webhooks** section, set:
   - **Webhook URL**: 
     ```
     https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/telnyx-webhook-router
     ```
   - **API Version**: v2 (important!)
   - Enable these webhook types:
     - ✅ Message Received
     - ✅ Message Sent  
     - ✅ Message Delivered
     - ✅ Message Failed

5. Click **Save**

## Step 3: Fix Real-time Connection (Optional)

The CHANNEL_ERROR in console is a separate issue with real-time subscriptions. To fix:

```javascript
// Run this in console to reset real-time
localStorage.removeItem('supabase.auth.token');
location.reload();
```

## Step 4: Test Inbound SMS

After configuring the webhook:

1. Send an SMS from your phone to: **+12898192158**
2. Wait 5-10 seconds
3. Check in console:
```javascript
// Check for new inbound messages
async function checkInbound() {
  const { data: messages } = await window.supabase
    .from('messages')
    .select('*')
    .eq('direction', 'inbound')
    .order('created_at', { ascending: false })
    .limit(5);
  
  console.log('Inbound messages:', messages);
}
checkInbound();
```

## Step 5: Verify Webhook is Working

You can check Edge Function logs:
1. Go to [Supabase Functions](https://supabase.com/dashboard/project/mqppvcrlvsgrsqelglod/functions)
2. Click on `telnyx-webhook-router`
3. View logs to see if webhooks are arriving

## Troubleshooting

If still not working after webhook configuration:

### Test Webhook Manually:
```javascript
// This simulates an inbound SMS
async function testWebhook() {
  const response = await fetch('https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/sms-receiver', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      data: {
        event_type: 'message.received',
        id: 'test-' + Date.now(),
        occurred_at: new Date().toISOString(),
        payload: {
          id: 'msg-test-' + Date.now(),
          direction: 'inbound',
          from: {
            phone_number: '+16474242323' // Your phone
          },
          to: [{
            phone_number: '+12898192158' // Your Telnyx number
          }],
          text: 'Test inbound message from webhook',
          received_at: new Date().toISOString()
        }
      }
    })
  });
  
  console.log('Webhook test result:', await response.json());
}
testWebhook();
```

### Check Phone Number Ownership:
```javascript
// Verify phone number is assigned correctly
async function checkPhoneOwnership() {
  const { data } = await window.supabase
    .from('telnyx_phone_numbers')
    .select('*')
    .eq('phone_number', '+12898192158');
  
  console.log('Phone number details:', data);
}
checkPhoneOwnership();
```

## Summary

The main issue is that **Telnyx doesn't know where to send inbound SMS webhooks**. Once you:
1. ✅ Add the public key to Supabase
2. ✅ Configure the webhook URL in Telnyx
3. ✅ Save the changes

Inbound SMS will start working immediately!

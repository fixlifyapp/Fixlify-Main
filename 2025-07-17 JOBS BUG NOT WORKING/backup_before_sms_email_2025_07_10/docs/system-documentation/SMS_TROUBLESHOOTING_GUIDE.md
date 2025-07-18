# SMS System Troubleshooting Guide

## Current Status ✅
Your SMS system is properly configured:
- ✅ **TELNYX_API_KEY** is set in Supabase secrets
- ✅ **TELNYX_MESSAGING_PROFILE_ID** is set
- ✅ **Phone Number**: +12898192158 is assigned to petrusenkocorp@gmail.com
- ✅ **Status**: Active
- ✅ **Messaging Profile ID**: Updated and linked

## Test the SMS System

### Method 1: Browser Console Test
1. Open your browser console (F12)
2. Copy and paste the contents of `test-sms-system.js`
3. Follow the prompts to send a test SMS

### Method 2: Test from UI
1. **From Estimates:**
   - Go to Jobs > Select any job > Estimates tab
   - Click on an estimate > Actions > Send SMS
   
2. **From Invoices:**
   - Go to Jobs > Select any job > Invoices tab
   - Click on an invoice > Actions > Send SMS

3. **From Messaging Center:**
   - Go to Connect > Messaging
   - Click "Compose" > Select SMS
   - Enter a phone number and message

## Common Issues & Solutions

### 1. "No active phone number available" Error
This should be fixed now, but if it occurs:
```sql
-- Check phone assignment
SELECT * FROM telnyx_phone_numbers 
WHERE user_id = '6dfbdcae-c484-45aa-9327-763500213f24';
```

### 2. SMS Not Sending (No Error)
Check Edge Function logs:
1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/mqppvcrlvsgrsqelglod/functions)
2. Click on `telnyx-sms` function
3. View recent invocations and logs

### 3. Authentication Errors
If you get authentication errors:
1. Log out of the application
2. Clear browser cache/cookies
3. Log back in with petrusenkocorp@gmail.com

### 4. Telnyx API Errors
Common Telnyx issues:
- **Insufficient balance**: Check your Telnyx account balance
- **Invalid phone number**: Ensure format is +1XXXXXXXXXX
- **Rate limiting**: Wait a few minutes and try again

## Verify Telnyx Configuration

Run this in Telnyx portal to verify:
1. Go to [Telnyx Portal](https://portal.telnyx.com)
2. Check:
   - Phone number +12898192158 is active
   - Messaging is enabled on the number
   - Messaging Profile ID matches: 5ddd8f6113a7fa8ce2d5a22f21d5b245b8a03f04b1dc4231af30a68e9ea60dc2
   - Account has credit/balance

## Quick Debug Script

```javascript
// Run in browser console
async function debugSMS() {
  const { data: { session } } = await supabase.auth.getSession();
  
  // Test basic SMS
  const response = await fetch('https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/telnyx-sms', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + session.access_token,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      recipientPhone: '+16474242323', // Change to your test number
      message: 'Debug test from Fixlify',
      user_id: session.user.id
    })
  });
  
  const result = await response.json();
  console.log('Debug result:', result);
  
  if (!result.success) {
    console.error('Error details:', result.error);
    
    // Get more info
    const { data: phones } = await supabase
      .from('telnyx_phone_numbers')
      .select('*')
      .eq('user_id', session.user.id);
    
    console.log('Your phone numbers:', phones);
  }
}

debugSMS();
```

## Check Recent SMS Logs

```sql
-- Check estimate SMS logs
SELECT * FROM estimate_communications 
WHERE communication_type = 'sms' 
ORDER BY created_at DESC 
LIMIT 10;

-- Check invoice SMS logs  
SELECT * FROM invoice_communications
WHERE communication_type = 'sms'
ORDER BY created_at DESC
LIMIT 10;

-- Check general messages
SELECT * FROM messages
WHERE direction = 'outbound'
ORDER BY created_at DESC
LIMIT 10;
```

## If Still Not Working

1. **Restart Edge Functions**
   - Sometimes it takes a few minutes for new secrets to propagate
   - Try again in 5 minutes

2. **Check Telnyx Webhook**
   - In Telnyx portal, check if webhooks are configured
   - Status webhook URL should be: https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/telnyx-status-webhook

3. **Test with Different Number**
   - Try sending to a different phone number
   - Ensure the number includes country code (+1 for US/Canada)

4. **Contact Support**
   - If all else fails, check with Telnyx support
   - Verify your API key has the correct permissions
   - Ensure your account is in good standing

## Success Indicators
When SMS is working correctly:
- You'll see "SMS sent successfully" message
- A message ID will be returned
- The SMS will be logged in the database
- The recipient will receive the SMS within seconds

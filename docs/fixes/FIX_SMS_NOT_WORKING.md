# SMS System Not Working - Fix Guide

## Problem Summary
The SMS system (estimates, invoices, and messaging center) is not sending messages because:
1. **No Telnyx API Key configured** in Supabase Edge Function secrets
2. **Phone numbers not properly assigned** to users in the database
3. **Missing optional configuration** like messaging profile ID

## Quick Fix Steps

### Step 1: Configure Telnyx API Key

1. **Get your Telnyx API Key:**
   - Go to [Telnyx Portal](https://portal.telnyx.com)
   - Log in to your account
   - Navigate to **API Keys** section
   - Create a new API key or copy an existing one

2. **Add to Supabase Secrets:**
   - Go to [Supabase Edge Function Secrets](https://supabase.com/dashboard/project/mqppvcrlvsgrsqelglod/functions/secrets)
   - Add these secrets:
     ```
     TELNYX_API_KEY = your_telnyx_api_key_here
     TELNYX_MESSAGING_PROFILE_ID = (optional)
     TELNYX_PHONE_NUMBER = +14375290279 (or your preferred number)
     ```
   - Click **Save**

### Step 2: Assign Phone Numbers to Users

Run this SQL in [Supabase SQL Editor](https://supabase.com/dashboard/project/mqppvcrlvsgrsqelglod/sql/new):

```sql
-- First, find your user ID
SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';

-- Then assign an available phone number to your user
-- Replace 'your-user-id' with the ID from above
UPDATE telnyx_phone_numbers 
SET 
  user_id = 'your-user-id',
  status = 'active',
  updated_at = now()
WHERE phone_number IN ('+14375290279', '+14375248832')
AND user_id IS NULL
LIMIT 1
RETURNING *;
```

### Step 3: Test the System

After configuration, test SMS in your browser console (F12):

```javascript
// Quick SMS test
async function testSMS() {
  const supabase = window.supabase;
  const session = await supabase.auth.getSession();
  
  const response = await fetch('https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/telnyx-sms', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + session.data.session?.access_token,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      recipientPhone: '+1234567890', // Replace with your test number
      message: 'Test SMS from Fixlify',
      client_id: null,
      job_id: null
    })
  });
  
  const result = await response.json();
  console.log('SMS Test Result:', result);
}

testSMS();
```

## Current System Status

### Phone Numbers in Database:
1. **+14375290279** - Available (not assigned)
2. **+14375248832** - Available (not assigned)  
3. **+12898192158** - Active (assigned to user: 6dfbdcae-c484-45aa-9327-763500213f24)

### Edge Functions Deployed:
- ✅ `telnyx-sms` - Main SMS sending function
- ✅ `send-estimate-sms` - Estimate SMS with portal links
- ✅ `send-invoice-sms` - Invoice SMS with portal links
- ✅ `notifications` - General notification handler

## Alternative: Test Mode

If you don't have a Telnyx account yet:
- The system will operate in "simulation mode"
- Messages will be logged but not actually sent
- You'll see success messages in the UI
- All SMS activity is recorded in the database

## Getting a Telnyx Account

1. Visit [telnyx.com](https://telnyx.com)
2. Sign up for a free account
3. Purchase a phone number (starting at $1/month)
4. Enable SMS capabilities on the number
5. Create an API key and follow the steps above

## Troubleshooting

### Common Issues:

1. **"No active phone number available" error**
   - Run the SQL query in Step 2 to assign a number to your user

2. **"Authentication failed" error**
   - Ensure you're logged in to the application
   - Try refreshing your browser and logging in again

3. **SMS not sending but no error**
   - Check if TELNYX_API_KEY is set in Supabase secrets
   - Verify your Telnyx account has SMS credit
   - Check that your phone number has SMS capabilities enabled

### Check Configuration:

```javascript
// Check if Telnyx is configured
fetch('https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/check-telnyx-key', {
  headers: {
    'Authorization': 'Bearer ' + (await supabase.auth.getSession()).data.session?.access_token
  }
}).then(r => r.json()).then(console.log);
```

### View Edge Function Logs:

Go to [Supabase Edge Function Logs](https://supabase.com/dashboard/project/mqppvcrlvsgrsqelglod/functions) to see any errors.

## Need Help?

If you're still having issues after following these steps:
1. Check that your Telnyx account is active and has credit
2. Verify the phone number format includes country code (+1 for US/Canada)
3. Ensure the Edge Functions have restarted after adding secrets (may take 2-3 minutes)
4. Contact support with the error message from the logs

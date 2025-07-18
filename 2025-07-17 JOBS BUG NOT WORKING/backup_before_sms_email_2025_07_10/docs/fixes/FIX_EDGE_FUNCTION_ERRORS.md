# Fixing Edge Function Errors - Telnyx SMS & Document Sending

## Problem
The Supabase logs show 400 errors for the telnyx-sms edge function and missing edge functions for send-estimate-sms and send-invoice-sms.

## Root Causes
1. Missing edge functions: `send-estimate-sms` and `send-invoice-sms` were not created
2. Telnyx SMS configuration issues:
   - No active phone numbers in the `telnyx_phone_numbers` table
   - Missing TELNYX_API_KEY environment variable
   - Edge functions not deployed to Supabase

## Solution

### 1. Deploy Edge Functions
Run the deployment script to deploy all edge functions:

```bash
# Windows PowerShell
.\deploy-edge-functions.ps1

# Linux/Mac
./deploy-edge-functions.sh
```

Or deploy individually:
```bash
supabase functions deploy telnyx-sms
supabase functions deploy send-estimate-sms
supabase functions deploy send-invoice-sms
```

### 2. Configure Environment Variables
In Supabase Dashboard:
1. Go to Edge Functions > Secrets
2. Add these environment variables:
   - `TELNYX_API_KEY`: Your Telnyx API key
   - `MAILGUN_API_KEY`: Your Mailgun API key
   - `TELNYX_MESSAGING_PROFILE_ID`: (Optional) Your Telnyx messaging profile ID
### 3. Add Phone Numbers
You need at least one active phone number in the `telnyx_phone_numbers` table:

```sql
-- Add a phone number for SMS sending
INSERT INTO telnyx_phone_numbers (
  phone_number,
  user_id,
  status,
  capabilities
) VALUES (
  '+1234567890', -- Your Telnyx phone number
  'your-user-id', -- Your user ID
  'active',
  '{"sms": true, "voice": true}'::jsonb
);
```

### 4. Debug the Configuration
Run the debug script in your browser console:
1. Open your Fixlify app
2. Open browser console (F12)
3. Copy and paste the contents of `debug-telnyx-sms.js`
4. Review the output for any issues

### 5. Test SMS Sending
After configuration, test SMS sending:
1. Go to Settings > Configuration > Telnyx
2. Enter a test phone number
3. Click "Test SMS"

## Files Created/Updated
- `/supabase/functions/send-estimate-sms/index.ts` - Send estimate via SMS
- `/supabase/functions/send-invoice-sms/index.ts` - Send invoice via SMS
- `/deploy-edge-functions.ps1` - PowerShell deployment script
- `/deploy-edge-functions.sh` - Bash deployment script
- `/debug-telnyx-sms.js` - Debug script for browser console

## Common Issues

### "No active phone numbers available"
- Add phone numbers to `telnyx_phone_numbers` table
- Set status to 'active'
- Assign to a user_id

### "TELNYX_API_KEY is not configured"
- Add TELNYX_API_KEY in Supabase Edge Functions > Secrets
- Get your API key from Telnyx dashboard

### "Failed to send SMS"
- Check that the phone number format is correct (E.164 format: +1234567890)
- Verify your Telnyx account has SMS credits
- Check that the messaging profile ID is correct (if using)

## Verification
After fixing, verify everything works:
1. Check edge function logs in Supabase dashboard
2. Look for 200 status codes instead of 400
3. Test sending an estimate or invoice via SMS
4. Check `communication_logs` table for successful entries
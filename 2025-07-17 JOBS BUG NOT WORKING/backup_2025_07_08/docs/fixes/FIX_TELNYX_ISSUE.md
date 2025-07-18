# 🔧 Fix TELNYX API Key Issue

## Problem
The edge functions for sending SMS (estimates and invoices) are failing with error:
```
{"errors":[{"code":"10007","title":"Invalid API key","detail":"The API key provided could not be found or is invalid."}]}
```

## Root Cause
The TELNYX_API_KEY stored in Supabase secrets is either:
1. Using the wrong format (might be using a different key format)
2. Has extra spaces or characters
3. Is an invalid/expired key

## Solution

### Step 1: Get Your Correct Telnyx API Key
1. Go to [Telnyx Portal](https://portal.telnyx.com)
2. Log in to your account
3. Navigate to **API Keys** section
4. Copy your API key (should start with `KEY`)
   - Example: `KEY01973792571E80381EF8E470CD832049`

### Step 2: Update Supabase Secrets
1. Go to [Supabase Secrets](https://supabase.com/dashboard/project/mqppvcrlvsgrsqelglod/functions/secrets)
2. Find `TELNYX_API_KEY` in the list
3. Click the edit icon (pencil)
4. Replace with your correct API key
   - ⚠️ NO quotes around the key
   - ⚠️ NO spaces before or after
   - ⚠️ Must start with `KEY`
5. Click **Save**

### Step 3: Wait & Test
1. Wait 30-60 seconds for propagation
2. Test by sending an SMS from the Jobs page

## Quick Test Script
Run this in browser console to verify the environment:
```javascript
// Copy the content from test_env_vars.js
```

## Important Notes
- Edge functions use `TELNYX_API_KEY` (no VITE_ prefix)
- Frontend uses `VITE_TELNYX_API_KEY` (with VITE_ prefix)
- The API key format must be correct for Telnyx to accept it

## Additional Environment Variables to Check
While you're in the secrets page, also verify these are set:
- `MAILGUN_API_KEY` - For email sending
- `TELNYX_MESSAGING_PROFILE_ID` - Optional, for Telnyx messaging profile

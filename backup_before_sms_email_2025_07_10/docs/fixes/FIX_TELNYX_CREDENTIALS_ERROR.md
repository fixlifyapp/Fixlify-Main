# FIX: Telnyx SMS "Could not find any usable credentials" Error

## The Problem
The error message indicates that Telnyx is not receiving a valid API key. This is happening even though you have TELNYX_API_KEY set in Supabase secrets.

## Common Causes & Solutions

### 1. API Key Format Issues
The most common cause is incorrect API key format in Supabase secrets.

**Check your API key:**
- Go to [Telnyx Portal](https://portal.telnyx.com) > API Keys
- Make sure you're using a **V2 API Key** (not V1)
- V2 keys typically start with `KEY` followed by alphanumeric characters

### 2. Fix in Supabase Secrets

1. Go to [Supabase Edge Function Secrets](https://supabase.com/dashboard/project/mqppvcrlvsgrsqelglod/functions/secrets)

2. Find `TELNYX_API_KEY` and click Edit

3. **IMPORTANT**: Make sure the value:
   - Has NO quotes around it (not "KEY..." or 'KEY...')
   - Has NO spaces before or after
   - Has NO line breaks
   - Is just the raw key: `KEYxxxxxxxxxxxxxxxxxxxxx`

4. Example of CORRECT format:
   ```
   KEY01234567890abcdef1234567890abcdef
   ```

5. Example of INCORRECT formats:
   ```
   "KEY01234567890abcdef1234567890abcdef"  ❌ (has quotes)
   Bearer KEY01234567890abcdef1234567890  ❌ (has Bearer prefix)
    KEY01234567890abcdef1234567890abcdef  ❌ (has space at start)
   ```

### 3. Verify Your Telnyx API Key

Run this in Telnyx portal to test your key:
```bash
curl https://api.telnyx.com/v2/phone_numbers \
  -H "Authorization: Bearer YOUR_API_KEY_HERE"
```

If it returns phone numbers, your key is valid.

### 4. Wait for Propagation
After updating the secret:
- Wait 2-3 minutes for changes to propagate
- Edge functions cache environment variables

### 5. Test Again
Run the test script again:
```javascript
// Quick test
async function quickTest() {
  const { data: { session } } = await supabase.auth.getSession();
  const response = await fetch('https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/telnyx-sms', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + session.access_token,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      recipientPhone: '+16474242323',
      message: 'Test after fixing API key',
      user_id: session.user.id
    })
  });
  console.log(await response.json());
}
quickTest();
```

## Alternative: Create New API Key

If the issue persists:

1. Go to [Telnyx Portal](https://portal.telnyx.com)
2. Navigate to **API Keys**
3. Click **Create API Key**
4. Give it a name like "Fixlify SMS"
5. Copy the new key immediately (you can't see it again)
6. Update in Supabase secrets
7. Test again

## Still Not Working?

The edge function is correctly implemented. The only reason for "Could not find any usable credentials" is:
1. Wrong API key in secrets
2. API key has formatting issues
3. API key is invalid/expired

Double-check the TELNYX_API_KEY value in Supabase secrets - remove any extra characters, spaces, or quotes.

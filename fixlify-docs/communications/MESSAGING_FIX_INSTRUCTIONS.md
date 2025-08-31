# Messaging System Fix Instructions

## Issues Identified:
1. **Send Estimate Email Not Working** - But Send Invoice works
2. **Portal URLs** - Already correctly using hub.fixlify.app
3. **No Duplicate Functions Found** - Everything is properly structured

## Root Cause:
The `PUBLIC_SITE_URL` environment variable is not set in Supabase Edge Functions.

## Solution:

### Step 1: Set the PUBLIC_SITE_URL environment variable
Run this command in your terminal:
```bash
cd C:\Users\petru\Downloads\TEST FIX SITE\3\Fixlify-Main-main
npx supabase secrets set PUBLIC_SITE_URL=https://hub.fixlify.app
```

### Step 2: Verify the secret was set
```bash
npx supabase secrets list
```

### Step 3: If you see any errors in the browser console
Check for:
- Authentication errors
- Missing Mailgun API keys
- CORS issues

### Alternative: Set via Supabase Dashboard
1. Go to your Supabase Dashboard
2. Navigate to Settings > Edge Functions
3. Add environment variable: `PUBLIC_SITE_URL = https://hub.fixlify.app`

### Test the Fix:
1. Try sending an estimate via email
2. Check that the portal link uses hub.fixlify.app
3. Verify both estimate and invoice sending work

## Additional Checks:
- Ensure Mailgun API keys are set in Supabase secrets
- Verify edge functions are deployed: `npx supabase functions list`
- Check function logs in Supabase dashboard for errors

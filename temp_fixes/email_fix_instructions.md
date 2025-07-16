# Fix Email Sending Issue

## The Problem
The email sending was working before but stopped. The issue is likely that the MAILGUN_DOMAIN is not set in Supabase secrets, causing it to use the wrong domain.

## Quick Fix

### 1. I've Updated the Default Domain
Changed the default domain in `mailgun-email/index.ts` from:
- `mg.fixlify.com` → `mg.fixlify.app`

### 2. Deploy the Updated Function
```bash
npx supabase functions deploy mailgun-email --no-verify-jwt
```

### 3. Add MAILGUN_DOMAIN to Secrets (Recommended)
Go to: https://supabase.com/dashboard/project/mqppvcrlvsgrsqelglod/functions/secrets

Add:
```
MAILGUN_DOMAIN=mg.fixlify.app
```

This ensures the correct domain is always used, regardless of code changes.

### 4. Test Email Sending
I've created two helper functions:

1. **check-email-config** - Shows current email configuration
   ```bash
   npx supabase functions deploy check-email-config
   ```
   Then call it to see the current config.

2. **test-email** - Sends a test email to yourself
   ```bash
   npx supabase functions deploy test-email
   ```
   Then call it to test if emails are working.

## What Was The Issue?
- The code defaulted to `mg.fixlify.com` when MAILGUN_DOMAIN wasn't set
- Your actual domain is `mg.fixlify.app`
- This mismatch caused Mailgun to reject the emails

## Verification
After deploying, try sending an estimate or invoice. It should work now!

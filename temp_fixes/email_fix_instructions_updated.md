# Email Sending Fix - Updated Instructions

## Your Email Setup
You're using the main domain `fixlify.app` for email sending (not a subdomain like mg.fixlify.app).

Your system works like this:
- Each user sets their own company email in their profile
- Some users use auto-generated emails like: `fixlifyservices@fixlify.app`
- Others might use their own domain emails

## The Fix

### 1. I've Updated the Default Domain
Changed the default domain in `mailgun-email/index.ts` to:
- `fixlify.app` (removed the "mg." prefix)

### 2. Deploy the Updated Function
```bash
npx supabase functions deploy mailgun-email --no-verify-jwt
```

### 3. Verify Mailgun Configuration
Make sure in your Mailgun dashboard:
- You have `fixlify.app` added as a sending domain (not mg.fixlify.app)
- The domain is verified with proper DNS records
- Your API key is active

### 4. Set MAILGUN_DOMAIN Secret (Optional but Recommended)
Go to: https://supabase.com/dashboard/project/mqppvcrlvsgrsqelglod/functions/secrets

Add:
```
MAILGUN_DOMAIN=fixlify.app
```

## How It Works Now:
1. User sets their company email (e.g., `fixlifyservices@fixlify.app`)
2. When sending estimates/invoices, emails come FROM that address
3. Mailgun sends through the `fixlify.app` domain

## Important Notes:
- Make sure each user has their `company_email` set in Settings → Company Info
- The auto-generated format is: `[companyname]@fixlify.app` (no spaces, lowercase)
- Users can also use their own domain emails if they prefer

After deploying, estimate and invoice emails should work again!

# Quick Mailgun Setup for Fixlify.app

## What You Need to Do:

### 1. Configure Mailgun Secrets in Supabase
Go to: https://supabase.com/dashboard/project/mqppvcrlvsgrsqelglod/functions/secrets

Add only these 2 secrets:
```
MAILGUN_API_KEY=your-mailgun-api-key
MAILGUN_DOMAIN=mg.fixlify.app
```

**DO NOT SET `MAILGUN_FROM_EMAIL`** - The system automatically uses each user's company email.

### 2. How Emails Work in Fixlify:
- Each user has their own `company_email` in their profile
- When they send an estimate/invoice, it comes FROM their company email
- Example: If user's company_email is "john@plumbingpro.com", emails will show:
  - From: "Plumbing Pro <john@plumbingpro.com>"
  - Reply-To: john@plumbingpro.com

### 3. Make Sure Your Profile Has Company Email:
1. Go to Settings → Company Settings
2. Set your Company Email (this will be used as the FROM address)
3. Save changes

### 4. Domain Setup Options:

**Option A: Single Domain (Easiest)**
- Use mg.fixlify.app for all emails
- Users set their email to: companyname@fixlify.app
- Only need to verify one domain in Mailgun

**Option B: Multiple Domains (Professional)**
- Each company uses their own domain
- Need to verify each domain in Mailgun
- More setup but looks more professional

## That's it! The system is already built to handle company-specific emails automatically.

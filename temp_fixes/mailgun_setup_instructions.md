# Mailgun Email Setup for Fixlify.app

## Current Implementation
The system already correctly uses the company email from each user's profile when sending emails. The `from` field is set to: `${companyName} <${companyEmail}>`

## Required Mailgun Configuration

### 1. Get Mailgun Credentials
1. Go to [Mailgun.com](https://www.mailgun.com) and log in
2. Add your domain: **fixlify.app** 
   - Go to "Sending" → "Domains" → "Add New Domain"
   - Enter: `mg.fixlify.app` (subdomain for email sending)
   - Follow Mailgun's DNS setup instructions

### 2. DNS Configuration for fixlify.app
Add these DNS records to your domain (at your domain registrar):

```
Type  | Name | Value | Priority
------|------|-------|----------
TXT   | mg   | v=spf1 include:mailgun.org ~all | -
TXT   | k1._domainkey.mg | k=rsa; p=[Your DKIM key from Mailgun] | -
MX    | mg   | mxa.mailgun.org | 10
MX    | mg   | mxb.mailgun.org | 10
CNAME | email.mg | mailgun.org | -
```

### 3. Set Supabase Secrets
Go to https://supabase.com/dashboard/project/mqppvcrlvsgrsqelglod/functions/secrets

Add these secrets:
```
MAILGUN_API_KEY=your-mailgun-private-api-key
MAILGUN_DOMAIN=mg.fixlify.app
```

**Note:** Do NOT set `MAILGUN_FROM_EMAIL` - the system automatically uses each user's company email from their profile.

### 4. How It Works
- Each user has their own `company_email` in their profile
- When sending estimates/invoices, the system uses: `From: CompanyName <company_email>`
- This allows each user to send emails from their own company email address
- Recipients will see emails coming from the actual company, not a generic noreply address

### 5. Important: Verify Sender Addresses
For production use, each company email domain needs to be verified in Mailgun:
- Either add each domain to Mailgun (for multiple domains)
- Or use a single verified domain and have users set their email to `companyname@fixlify.app`

## Testing
1. Make sure your profile has a valid `company_email` set
2. Try sending an estimate or invoice
3. Check Mailgun logs at https://app.mailgun.com/app/logs

## Current Email Flow:
1. User sends estimate/invoice
2. System gets user's `company_email` from profile
3. Email is sent with `From: CompanyName <company_email>`
4. Replies go back to the company's actual email

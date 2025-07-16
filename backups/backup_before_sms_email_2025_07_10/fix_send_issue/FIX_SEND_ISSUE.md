# Fix Send Estimate/Invoice Issue

## Problem
The universal send feature for estimates and invoices is failing because the required API keys for email (Mailgun) and SMS (Telnyx) services are not configured in the Supabase edge functions secrets.

## Root Cause
The edge functions `send-estimate`, `send-invoice`, `send-estimate-sms`, and `send-invoice-sms` require the following environment variables to be set:
- `MAILGUN_API_KEY` - For sending emails
- `TELNYX_API_KEY` - For sending SMS messages
- `TELNYX_PHONE_NUMBER` - The phone number to send SMS from

## Solution Steps

### 1. Set Up API Keys in Supabase Dashboard

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/mqppvcrlvsgrsqelglod/functions/secrets
2. Add the following secrets:

```
MAILGUN_API_KEY=your_mailgun_api_key_here
MAILGUN_DOMAIN=your_mailgun_domain_here
TELNYX_API_KEY=your_telnyx_api_key_here
TELNYX_PHONE_NUMBER=your_telnyx_phone_number_here
```

### 2. Get API Keys

#### For Mailgun (Email):
1. Sign up at https://www.mailgun.com/
2. Get your API key from the dashboard
3. Get your domain from the sending domains section

#### For Telnyx (SMS):
1. Sign up at https://telnyx.com/
2. Get your API key from Mission Control Portal
3. Purchase a phone number for sending SMS

### 3. Alternative: Use Test Mode

If you don't have API keys yet, I'll create a modified version of the edge functions that work in test mode.

## Temporary Solution (Without API Keys)

I'll create test versions of the edge functions that simulate sending without actual API calls.

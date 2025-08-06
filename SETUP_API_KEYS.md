# Setting Up API Keys for Automation System

## Required API Keys

For the automation system to send actual emails and SMS messages, you need to configure the following API keys in Supabase:

### 1. Mailgun API Key (for Email)
- Sign up for a Mailgun account at https://www.mailgun.com/
- Get your API key from the dashboard
- Add it to Supabase Edge Function secrets

### 2. Telnyx API Key (for SMS)
- Sign up for a Telnyx account at https://telnyx.com/
- Get your API key from the dashboard
- Also get your Messaging Profile ID
- Add both to Supabase Edge Function secrets

## How to Add Secrets to Supabase

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/mqppvcrlvsgrsqelglod/functions/secrets

2. Add the following secrets:
   - `MAILGUN_API_KEY`: Your Mailgun API key
   - `MAILGUN_DOMAIN`: Your Mailgun domain (e.g., mg.yourdomain.com)
   - `TELNYX_API_KEY`: Your Telnyx API key
   - `TELNYX_MESSAGING_PROFILE_ID`: Your Telnyx messaging profile ID

## Testing Without API Keys

If you don't have API keys yet, the system will run in "test mode":
- Emails won't actually be sent
- SMS messages won't actually be sent
- But the automation workflow will still execute and log the actions

## Current Status

Your automation system is working correctly:
- ✅ Workflows are triggering on job status changes
- ✅ Edge functions are accessible and responding
- ❌ Actual email/SMS sending requires API keys to be configured

Once you add the API keys to Supabase, the emails and SMS messages will start being sent automatically when job statuses change.

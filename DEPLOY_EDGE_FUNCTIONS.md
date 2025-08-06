# Deploy Edge Functions to Supabase

To make the automation system work, you need to deploy the edge functions:

## Quick Deploy Commands

Open a terminal in your project directory and run:

```bash
# Login to Supabase (if not already logged in)
npx supabase login

# Link to your project (if not already linked)
npx supabase link --project-ref mqppvcrlvsgrsqelglod

# Deploy all edge functions
npx supabase functions deploy automation-executor
npx supabase functions deploy mailgun-email
npx supabase functions deploy telnyx-sms
```

## Alternative: Deploy All Functions at Once

```bash
# Deploy all functions in the functions directory
npx supabase functions deploy
```

## Verify Deployment

After deployment, you should see success messages. The functions will be available at:
- https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/automation-executor
- https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/mailgun-email
- https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/telnyx-sms

## Set Environment Variables

Make sure your edge function secrets are set:

1. Go to: https://supabase.com/dashboard/project/mqppvcrlvsgrsqelglod/functions/secrets
2. Add these secrets:
   - MAILGUN_API_KEY
   - MAILGUN_DOMAIN
   - TELNYX_API_KEY
   - TELNYX_MESSAGING_PROFILE_ID

## Test After Deployment

Once deployed, go back to the Automations page and:
1. Click the "Test Edge Functions" button to verify they're accessible
2. Then run the "Run Full Test" to test the complete automation workflow

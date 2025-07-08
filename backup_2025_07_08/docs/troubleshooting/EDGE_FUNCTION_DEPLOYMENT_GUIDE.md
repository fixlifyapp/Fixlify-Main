# Edge Function Deployment Guide

This guide will help you deploy the updated telnyx-phone-numbers edge function with proper CORS headers.

## Prerequisites

1. Make sure you have the Supabase CLI installed
2. Be logged in to your Supabase account
3. Have your project linked

## Step 1: Check Your Current Status

First, let's check if you're logged in and have a project linked:

```bash
supabase status
```

If you're not logged in:
```bash
supabase login
```

If project is not linked:
```bash
supabase link --project-ref mqppvcrlvsgrsqelglod
```

## Step 2: Deploy the Edge Function

Deploy the updated edge function with:

```bash
supabase functions deploy telnyx-phone-numbers
```

## Step 3: Verify Deployment

After deployment, test the function:

```bash
# Test the connection
curl -X POST https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/telnyx-phone-numbers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{"action": "test_telnyx_connection"}'
```

## Step 4: Set Environment Variables (if needed)

If you haven't set the Telnyx API key yet:

```bash
supabase secrets set TELNYX_API_KEY=YOUR_TELNYX_API_KEY
```

## Alternative: Deploy All Functions

If you want to deploy all functions at once:

```bash
supabase functions deploy
```

## Troubleshooting

1. **CORS Issues**: The function now includes comprehensive CORS headers that should work with all browsers
2. **Authentication Issues**: Make sure you're passing the correct Authorization header
3. **Telnyx API Issues**: Verify your TELNYX_API_KEY is set correctly

## Next Steps

After deployment, you can:
1. Test the function from your app
2. Use the sync functionality to pull all available Telnyx numbers
3. Manually add any new numbers you've purchased

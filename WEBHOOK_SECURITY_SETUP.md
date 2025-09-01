# Set Telnyx Webhook Secret

## Option 1: Via Supabase Dashboard
1. Go to your project settings
2. Navigate to "Edge Functions" → "Secrets"
3. Add: `TELNYX_WEBHOOK_SECRET = your-secure-token-here`

## Option 2: Via Supabase CLI
```bash
supabase secrets set TELNYX_WEBHOOK_SECRET=your-secure-token-here
```

## Then Update Your Telnyx Webhook URL:
```
https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/telnyx-dynamic-variables?auth_token=your-secure-token-here
```

Replace `your-secure-token-here` with something secure like:
- `telnyx-2024-xKd9mPq2`
- `webhook-auth-93kDs82n`
- Or any random string

## Default Token (if not set):
The webhook currently uses: `telnyx-secret-2024`
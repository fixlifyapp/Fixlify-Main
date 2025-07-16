# Environment Variables Setup

Since you already have all the necessary API keys configured in your Supabase secrets, you just need to set up a few frontend environment variables.

## Create `.env.local` file in your project root:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://mqppvcrlvsgrsqelglod.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xcHB2Y3JsdnNncnNxZWxnbG9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTkzNDgxNTYsImV4cCI6MjAzNDkyNDE1Nn0.XaKEeJOCMJ-N6J5qM4kLLKeBb7yVqLb_bnBFvqBgLWs

# Mailgun Configuration
VITE_MAILGUN_DOMAIN=fixlify.app

# Telnyx Configuration
VITE_TELNYX_DEFAULT_FROM_NUMBER=+14375249932
VITE_TELNYX_CONNECTION_ID=2709042883142354871
```

## What's Already Configured:

✅ **Supabase Edge Functions Secrets:**
- `TELNYX_API_KEY` - Your Telnyx API key (already set)
- `MAILGUN_API_KEY` - Your Mailgun API key (already set)
- `OPENAI_API_KEY` - Your OpenAI API key (already set)

✅ **Active Telnyx Phone Number:**
- Phone: `+14375249932` (already in database)
- Status: Active
- Connection ID: `2709042883142354871`

## Additional Setup Notes:

1. **Mailgun Domain**: The app is configured to use `fixlify.app` as the default domain. If you're using a different domain, update `VITE_MAILGUN_DOMAIN`.

2. **Telnyx Phone Number**: You already have an active phone number configured. No additional setup needed.

3. **No Additional Secrets Needed**: The edge functions will use the secrets you've already configured in Supabase.

## Testing Your Configuration:

After creating the `.env.local` file, restart your development server:

```bash
npm run dev
```

Then test the services:

1. **Test SMS**: Try sending a message from the messaging center
2. **Test Email**: Try sending an estimate or invoice
3. **Test Products**: Try creating a new product
4. **Test Niche Switch**: Try switching business niche and check if products load

All services should now work properly with your configured API keys! 
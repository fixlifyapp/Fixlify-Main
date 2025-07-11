#!/bin/bash

# Set Telnyx secrets in Supabase Edge Functions
# Run this script to configure the Telnyx API key in Supabase

echo "🔧 Configuring Telnyx secrets in Supabase..."

# Set the Telnyx API Key
npx supabase secrets set TELNYX_API_KEY=KEY01973792571E803B1EF8E470CD832D49

echo "✅ Telnyx API key has been set in Supabase secrets"
echo ""
echo "📝 Note: The following edge functions will now have access to the Telnyx API:"
echo "  - telnyx-sms"
echo "  - telnyx-voice-webhook"
echo "  - telnyx-phone-numbers"
echo "  - sms-receiver"
echo "  - ai-dispatcher-webhook"
echo ""
echo "🚀 Next steps:"
echo "  1. Deploy the edge functions: npm run deploy:functions"
echo "  2. Test the integration using the Phone Numbers page"
echo "  3. Send a test SMS to verify everything works"
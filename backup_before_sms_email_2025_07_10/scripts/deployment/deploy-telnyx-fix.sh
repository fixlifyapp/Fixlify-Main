
#!/bin/bash

echo "🚀 Deploying Telnyx Integration Fix..."

# Set Telnyx secrets
echo "🔐 Setting Telnyx secrets..."
npx supabase secrets set TELNYX_API_KEY=KEY01973792571E803B1EF8E470CD832D49
npx supabase secrets set TELNYX_CONNECTION_ID=2709100729850660858

# Deploy the phone manager function
echo "📦 Deploying telnyx-phone-manager function..."
npx supabase functions deploy telnyx-phone-manager

# Deploy other Telnyx functions
echo "📦 Deploying other Telnyx functions..."
npx supabase functions deploy check-telnyx-account
npx supabase functions deploy sync-telnyx-numbers
npx supabase functions deploy manage-phone-numbers
npx supabase functions deploy update-webhook-url

echo "✅ Telnyx integration deployment complete!"
echo ""
echo "🔍 To test the sync:"
echo "1. Go to /phone-numbers page"
echo "2. Click 'Sync from Telnyx' button"
echo "3. Check if your new numbers appear"


# Deploy Telnyx Integration Fix

Write-Host "🚀 Deploying Telnyx Integration Fix..." -ForegroundColor Green

# Set Telnyx secrets
Write-Host "🔐 Setting Telnyx secrets..." -ForegroundColor Yellow
npx supabase secrets set TELNYX_API_KEY=KEY01973792571E803B1EF8E470CD832D49
npx supabase secrets set TELNYX_CONNECTION_ID=2709100729850660858

# Deploy the phone manager function
Write-Host "📦 Deploying telnyx-phone-manager function..." -ForegroundColor Yellow
npx supabase functions deploy telnyx-phone-manager

# Deploy other Telnyx functions
Write-Host "📦 Deploying other Telnyx functions..." -ForegroundColor Yellow
npx supabase functions deploy check-telnyx-account
npx supabase functions deploy sync-telnyx-numbers
npx supabase functions deploy manage-phone-numbers
npx supabase functions deploy update-webhook-url

Write-Host "✅ Telnyx integration deployment complete!" -ForegroundColor Green
Write-Host ""
Write-Host "🔍 To test the sync:" -ForegroundColor Cyan
Write-Host "1. Go to /phone-numbers page"
Write-Host "2. Click 'Sync from Telnyx' button"
Write-Host "3. Check if your new numbers appear"

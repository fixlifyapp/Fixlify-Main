# Deploy Supabase Edge Functions for Telnyx

Write-Host "Deploying Supabase Edge Functions..." -ForegroundColor Green

# Deploy setup-telnyx-number function
Write-Host "`nDeploying setup-telnyx-number..." -ForegroundColor Yellow
npx supabase functions deploy setup-telnyx-number

# Deploy test-telnyx-connection function
Write-Host "`nDeploying test-telnyx-connection..." -ForegroundColor Yellow
npx supabase functions deploy test-telnyx-connection

# Deploy telnyx-make-call function (already exists, just redeploy)
Write-Host "`nDeploying telnyx-make-call..." -ForegroundColor Yellow
npx supabase functions deploy telnyx-make-call

# Deploy manage-ai-dispatcher function
Write-Host "`nDeploying manage-ai-dispatcher..." -ForegroundColor Yellow
npx supabase functions deploy manage-ai-dispatcher

# Deploy ai-dispatcher-webhook function
Write-Host "`nDeploying ai-dispatcher-webhook..." -ForegroundColor Yellow
npx supabase functions deploy ai-dispatcher-webhook

# Deploy telnyx-webhook-router function
Write-Host "`nDeploying telnyx-webhook-router..." -ForegroundColor Yellow
npx supabase functions deploy telnyx-webhook-router

Write-Host "`n✅ All functions deployed successfully!" -ForegroundColor Green
Write-Host "`nNow set your TELNYX_API_KEY in Supabase Dashboard:" -ForegroundColor Cyan
Write-Host "1. Go to your Supabase Dashboard"
Write-Host "2. Navigate to Edge Functions > Secrets"
Write-Host "3. Add TELNYX_API_KEY with your Telnyx API key value" 
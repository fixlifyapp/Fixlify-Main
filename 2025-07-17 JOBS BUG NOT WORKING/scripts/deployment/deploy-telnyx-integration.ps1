# Deploy Telnyx Integration

Write-Host "🚀 Deploying Telnyx Integration..." -ForegroundColor Cyan

# Check if supabase CLI is installed
if (!(Get-Command supabase -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Supabase CLI not found. Installing..." -ForegroundColor Red
    npm install -g supabase
}

# Link to your project
Write-Host "`n📎 Linking to Supabase project..." -ForegroundColor Yellow
npx supabase link --project-ref mqppvcrlvsgrsqelglod

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to link project. Try logging in first:" -ForegroundColor Red
    Write-Host "   npx supabase login" -ForegroundColor Gray
    exit 1
}

# Set secrets
Write-Host "`n🔐 Setting Telnyx secrets..." -ForegroundColor Yellow
npx supabase secrets set TELNYX_API_KEY=KEY01973792571E803B1EF8E470CD832D49
npx supabase secrets set TELNYX_CONNECTION_ID=2709100729850660858

# Deploy edge functions
Write-Host "`n📦 Deploying edge functions..." -ForegroundColor Yellow

# Deploy phone manager
Write-Host "   - Deploying telnyx-phone-manager..." -ForegroundColor Gray
npx supabase functions deploy telnyx-phone-manager

# Deploy check account function
Write-Host "   - Deploying check-telnyx-account..." -ForegroundColor Gray
npx supabase functions deploy check-telnyx-account

# Deploy other Telnyx functions
$functions = @(
    "telnyx-sms",
    "telnyx-voice-webhook",
    "telnyx-webhook-router",
    "sms-receiver"
)

foreach ($func in $functions) {
    if (Test-Path "supabase/functions/$func") {
        Write-Host "   - Deploying $func..." -ForegroundColor Gray
        npx supabase functions deploy $func
    }
}

Write-Host "`n✅ Deployment complete!" -ForegroundColor Green
Write-Host "`n📱 You can now:" -ForegroundColor Cyan
Write-Host "   1. Go to /phone-numbers in your app" -ForegroundColor White
Write-Host "   2. Click 'Sync from Telnyx' to import your numbers" -ForegroundColor White
Write-Host "   3. Search and purchase new numbers" -ForegroundColor White
Write-Host "   4. Assign numbers to users" -ForegroundColor White
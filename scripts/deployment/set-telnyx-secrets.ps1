# Set Telnyx secrets in Supabase Edge Functions
# Run this script to configure the Telnyx API key in Supabase

Write-Host "🔧 Configuring Telnyx secrets in Supabase..." -ForegroundColor Cyan

# Set the Telnyx API Key
npx supabase secrets set TELNYX_API_KEY=KEY01973792571E803B1EF8E470CD832D49

Write-Host "`n✅ Telnyx API key has been set in Supabase secrets" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Note: The following edge functions will now have access to the Telnyx API:" -ForegroundColor Yellow
Write-Host "  - telnyx-sms"
Write-Host "  - telnyx-voice-webhook"
Write-Host "  - telnyx-phone-numbers"
Write-Host "  - sms-receiver"
Write-Host "  - ai-dispatcher-webhook"
Write-Host ""
Write-Host "🚀 Next steps:" -ForegroundColor Cyan
Write-Host "  1. Deploy the edge functions: npm run deploy:functions"
Write-Host "  2. Test the integration using the Phone Numbers page"
Write-Host "  3. Send a test SMS to verify everything works"
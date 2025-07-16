Write-Host "=== Telnyx Two-Way Calling Setup ===" -ForegroundColor Cyan
Write-Host ""

# Check if the app is running
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8082/" -UseBasicParsing -TimeoutSec 2
    Write-Host "Application is running on http://localhost:8082/" -ForegroundColor Green
} catch {
    Write-Host "Application is not running. Please start it with 'npm run dev'" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "To complete the setup, you need to:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Set your Telnyx API Key in Supabase:" -ForegroundColor White
Write-Host "   - Go to your Supabase Dashboard"
Write-Host "   - Navigate to Settings -> Edge Functions"
Write-Host "   - Add a new secret: TELNYX_API_KEY = your_telnyx_api_key"
Write-Host ""
Write-Host "2. Test the connection:" -ForegroundColor White
Write-Host "   - Open http://localhost:8082/"
Write-Host "   - Go to Settings -> Communications Settings"
Write-Host "   - Click Test Connection"
Write-Host ""
Write-Host "3. Make a test call:" -ForegroundColor White
Write-Host "   - Click New Call in Connect Center"
Write-Host "   - Enter a phone number to call"
Write-Host "   - Click Call to initiate"
Write-Host ""
Write-Host "Your Telnyx Configuration:" -ForegroundColor Cyan
Write-Host "  Connection ID: 2709042883142354871" -ForegroundColor Gray
Write-Host "  Phone Number: +1-437-524-9932" -ForegroundColor Gray
Write-Host "  Webhook URL: https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/telnyx-voice-webhook" -ForegroundColor Gray
Write-Host ""

# Offer to open the app
$openApp = Read-Host "Would you like to open the application now? (Y/N)"
if ($openApp -eq 'Y' -or $openApp -eq 'y') {
    Start-Process "http://localhost:8082/"
}

Write-Host ""
Write-Host "Setup guide complete! The two-way calling system is ready to use." -ForegroundColor Green 
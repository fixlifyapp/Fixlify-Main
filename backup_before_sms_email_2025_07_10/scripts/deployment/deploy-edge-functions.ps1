# Deploy all edge functions to Supabase
Write-Host "Deploying Edge Functions to Supabase..." -ForegroundColor Cyan

# Deploy each function
Write-Host "Deploying telnyx-sms..." -ForegroundColor Yellow
supabase functions deploy telnyx-sms

Write-Host "Deploying mailgun-email..." -ForegroundColor Yellow
supabase functions deploy mailgun-email

Write-Host "Deploying send-estimate..." -ForegroundColor Yellow
supabase functions deploy send-estimate

Write-Host "Deploying send-estimate-sms..." -ForegroundColor Yellow
supabase functions deploy send-estimate-sms

Write-Host "Deploying send-invoice..." -ForegroundColor Yellow
supabase functions deploy send-invoice

Write-Host "Deploying send-invoice-sms..." -ForegroundColor Yellow
supabase functions deploy send-invoice-sms

Write-Host "All edge functions deployed successfully!" -ForegroundColor Green
Write-Host "Remember to set environment variables in Supabase dashboard:" -ForegroundColor Magenta
Write-Host "   - TELNYX_API_KEY" -ForegroundColor White
Write-Host "   - MAILGUN_API_KEY" -ForegroundColor White
Write-Host "   - TELNYX_MESSAGING_PROFILE_ID (optional)" -ForegroundColor White
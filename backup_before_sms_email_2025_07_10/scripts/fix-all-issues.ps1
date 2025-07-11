#!/usr/bin/env pwsh

Write-Host "=== Applying Comprehensive Fixes ===" -ForegroundColor Cyan
Write-Host ""

# Step 1: Apply database migrations
Write-Host "Step 1: Applying database migrations..." -ForegroundColor Green
npx supabase db push

if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to apply migrations. Please check your Supabase connection." -ForegroundColor Red
    exit 1
}

Write-Host "✓ Database migrations applied" -ForegroundColor Green
Write-Host ""

# Step 2: Deploy edge functions
Write-Host "Step 2: Deploying edge functions..." -ForegroundColor Green
npx supabase functions deploy

if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to deploy edge functions. Please check your Supabase connection." -ForegroundColor Red
    exit 1
}

Write-Host "✓ Edge functions deployed" -ForegroundColor Green
Write-Host ""

# Step 3: Show configuration checklist
Write-Host "=== Configuration Checklist ===" -ForegroundColor Yellow
Write-Host ""
Write-Host "Please ensure the following are configured in your Supabase Dashboard:" -ForegroundColor Yellow
Write-Host "(Project Settings > Edge Functions > Secrets)" -ForegroundColor Gray
Write-Host ""
Write-Host "1. TELNYX_API_KEY - Your Telnyx API key" -ForegroundColor White
Write-Host "   Get it from: https://portal.telnyx.com/#/app/api-keys" -ForegroundColor Gray
Write-Host ""
Write-Host "2. MAILGUN_API_KEY - Your Mailgun API key" -ForegroundColor White
Write-Host "   Get it from: https://app.mailgun.com/app/account/security/api_keys" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Add an active Telnyx phone number in your database:" -ForegroundColor White
Write-Host "   Run this SQL in Supabase SQL Editor:" -ForegroundColor Gray
Write-Host "   INSERT INTO telnyx_phone_numbers (phone_number, status, user_id, purchased_at)" -ForegroundColor DarkGray
Write-Host "   VALUES ('+1234567890', 'active', auth.uid(), NOW());" -ForegroundColor DarkGray
Write-Host ""

# Step 4: Test commands
Write-Host "=== Test Commands ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "After configuration, test with these commands in browser console:" -ForegroundColor White
Write-Host ""
Write-Host "Test SMS:" -ForegroundColor Yellow
Write-Host @"
const { data, error } = await supabase.functions.invoke('telnyx-sms', {
  body: {
    recipientPhone: '+1234567890',
    message: 'Test message',
    client_id: 'test-client-id',
    user_id: (await supabase.auth.getUser()).data.user.id
  }
});
console.log({ data, error });
"@ -ForegroundColor DarkGray
Write-Host ""
Write-Host "Test Email:" -ForegroundColor Yellow
Write-Host @"
const { data, error } = await supabase.functions.invoke('send-email', {
  body: {
    to: 'test@example.com',
    subject: 'Test Email',
    html: '<p>This is a test email</p>',
    text: 'This is a test email'
  }
});
console.log({ data, error });
"@ -ForegroundColor DarkGray

Write-Host ""
Write-Host "=== All fixes applied! ===" -ForegroundColor Green
Write-Host "Please complete the configuration checklist above." -ForegroundColor Yellow 
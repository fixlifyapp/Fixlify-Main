# SMS Webhook Test Script
# This script simulates an incoming SMS to test the webhook

param(
    [string]$ServiceRoleKey = ""
)

# Configuration
$SUPABASE_URL = "https://mqppvcrlvsgrsqelglod.supabase.co"
$WEBHOOK_URL = "$SUPABASE_URL/functions/v1/sms-webhook"
$TEST_UNKNOWN_NUMBER = "+19999999999"
$TEST_USER_NUMBER = "+14377476737"
$TEST_MESSAGE = "Hi, I need a plumber for my kitchen sink. Can you help?"

Write-Host "🚀 SMS Webhook Test Script" -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Cyan

# Check if service role key is provided
if ([string]::IsNullOrEmpty($ServiceRoleKey)) {
    Write-Host "`n❌ Service role key is required!" -ForegroundColor Red
    Write-Host "`nTo get your service role key:" -ForegroundColor Yellow
    Write-Host "1. Go to: https://supabase.com/dashboard/project/mqppvcrlvsgrsqelglod/settings/api" -ForegroundColor White
    Write-Host "2. Copy the 'service_role' key (starts with eyJ...)" -ForegroundColor White
    Write-Host "3. Run this script with: .\test-sms-webhook.ps1 -ServiceRoleKey 'your_key_here'" -ForegroundColor White
    exit 1
}

Write-Host "`n📱 Test Configuration:" -ForegroundColor Green
Write-Host "Webhook URL: $WEBHOOK_URL" -ForegroundColor White
Write-Host "From (unknown): $TEST_UNKNOWN_NUMBER" -ForegroundColor White
Write-Host "To (your number): $TEST_USER_NUMBER" -ForegroundColor White
Write-Host "Message: $TEST_MESSAGE" -ForegroundColor White

# Create the webhook payload
$payload = @{
    data = @{
        event_type = "message.received"
        payload = @{
            id = "test-$(Get-Date -Format 'yyyyMMddHHmmss')"
            from = @{
                phone_number = $TEST_UNKNOWN_NUMBER
            }
            to = @(
                @{
                    phone_number = $TEST_USER_NUMBER
                }
            )
            text = $TEST_MESSAGE
            received_at = (Get-Date -Format "yyyy-MM-dd'T'HH:mm:ss'Z'")
        }
    }
} | ConvertTo-Json -Depth 10

Write-Host "`n📤 Sending webhook request..." -ForegroundColor Yellow

try {
    $headers = @{
        "Content-Type" = "application/json"
        "Authorization" = "Bearer $ServiceRoleKey"
    }

    $response = Invoke-RestMethod -Uri $WEBHOOK_URL -Method POST -Headers $headers -Body $payload -ErrorAction Stop
    
    Write-Host "`n✅ Webhook call successful!" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor White
    $response | ConvertTo-Json -Depth 10 | Write-Host
    
    Write-Host "`n🔍 Next steps to verify:" -ForegroundColor Cyan
    Write-Host "1. Check Supabase database for new client record" -ForegroundColor White
    Write-Host "2. Check sms_conversations for new conversation" -ForegroundColor White
    Write-Host "3. Check sms_messages for the message" -ForegroundColor White
    Write-Host "4. Open Connect Center in the app to see the conversation" -ForegroundColor White
    
    Write-Host "`n📊 SQL queries to run in Supabase:" -ForegroundColor Yellow
    Write-Host @"
-- Check for new client
SELECT * FROM clients WHERE phone = '$TEST_UNKNOWN_NUMBER' ORDER BY created_at DESC LIMIT 1;

-- Check for conversation
SELECT * FROM sms_conversations WHERE client_phone = '$TEST_UNKNOWN_NUMBER' ORDER BY created_at DESC LIMIT 1;

-- Check for message
SELECT * FROM sms_messages WHERE from_number = '$TEST_UNKNOWN_NUMBER' ORDER BY created_at DESC LIMIT 1;

-- Check communication log
SELECT * FROM communication_logs WHERE metadata->>'from' = '$TEST_UNKNOWN_NUMBER' ORDER BY created_at DESC LIMIT 1;
"@ -ForegroundColor Gray
    
} catch {
    Write-Host "`n❌ Webhook call failed!" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response body: $responseBody" -ForegroundColor Red
    }
}

Write-Host "`n✅ Test complete!" -ForegroundColor Green

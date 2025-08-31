# PowerShell script to check Telnyx webhook configuration and test

Write-Host "=== Telnyx SMS Webhook Diagnostics ===" -ForegroundColor Cyan
Write-Host ""

# Your Telnyx credentials
$TELNYX_API_KEY = $env:TELNYX_API_KEY
if (-not $TELNYX_API_KEY) {
    Write-Host "ERROR: TELNYX_API_KEY environment variable not set" -ForegroundColor Red
    Write-Host "Please set it with: `$env:TELNYX_API_KEY = 'your-api-key'" -ForegroundColor Yellow
    exit
}

Write-Host "1. Checking Telnyx Messaging Profiles..." -ForegroundColor Green
try {
    $headers = @{
        "Authorization" = "Bearer $TELNYX_API_KEY"
        "Content-Type" = "application/json"
    }
    
    # Get messaging profiles
    $profiles = Invoke-RestMethod -Uri "https://api.telnyx.com/v2/messaging_profiles" -Headers $headers -Method Get
    
    foreach ($profile in $profiles.data) {
        Write-Host "`nProfile: $($profile.name)" -ForegroundColor Yellow
        Write-Host "ID: $($profile.id)"
        Write-Host "Webhook URL: $($profile.webhook_url)"
        Write-Host "Webhook Failover URL: $($profile.webhook_failover_url)"
        Write-Host "Enabled: $($profile.enabled)"
    }
} catch {
    Write-Host "ERROR getting messaging profiles: $_" -ForegroundColor Red
}

Write-Host "`n2. Checking Phone Numbers..." -ForegroundColor Green
try {
    # Get phone numbers
    $numbers = Invoke-RestMethod -Uri "https://api.telnyx.com/v2/phone_numbers" -Headers $headers -Method Get
    
    foreach ($number in $numbers.data) {
        if ($number.phone_number -like "*437*") {
            Write-Host "`nPhone Number: $($number.phone_number)" -ForegroundColor Yellow
            Write-Host "Status: $($number.status)"
            Write-Host "Messaging Profile ID: $($number.messaging_profile_id)"
            
            # Get messaging settings
            if ($number.messaging_profile_id) {
                $msgProfile = Invoke-RestMethod -Uri "https://api.telnyx.com/v2/messaging_profiles/$($number.messaging_profile_id)" -Headers $headers -Method Get
                Write-Host "Profile Webhook: $($msgProfile.data.webhook_url)" -ForegroundColor Cyan
            }
        }
    }
} catch {
    Write-Host "ERROR getting phone numbers: $_" -ForegroundColor Red
}

Write-Host "`n3. Expected Webhook URL:" -ForegroundColor Green
Write-Host "https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/sms-webhook" -ForegroundColor Cyan

Write-Host "`n4. Testing Webhook Directly..." -ForegroundColor Green
$webhookUrl = "https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/sms-webhook"
try {
    $testPayload = @{
        data = @{
            record_type = "message"
            event_type = "message.received"
            id = "direct-test-$(Get-Date -Format 'yyyyMMddHHmmss')"
            occurred_at = (Get-Date -Format "yyyy-MM-dd'T'HH:mm:ss.fff'Z'")
            payload = @{
                id = "msg-direct-test"
                from = @{
                    phone_number = "+14168875839"
                    carrier = "Test"
                    line_type = "Wireless"
                }
                to = @(
                    @{
                        phone_number = "+14375249932"
                        status = "delivered"
                    }
                )
                text = "DIRECT TEST from PowerShell at $(Get-Date -Format 'HH:mm:ss')"
                direction = "inbound"
                type = "SMS"
                received_at = (Get-Date -Format "yyyy-MM-dd'T'HH:mm:ss.fff'Z'")
            }
        }
    } | ConvertTo-Json -Depth 10
    
    Write-Host "Sending test webhook..." -ForegroundColor Yellow
    $response = Invoke-RestMethod -Uri $webhookUrl -Method Post -Body $testPayload -ContentType "application/json"
    Write-Host "Webhook Response: $($response | ConvertTo-Json)" -ForegroundColor Green
} catch {
    Write-Host "ERROR testing webhook: $_" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response Body: $responseBody" -ForegroundColor Red
    }
}

Write-Host "`n5. Instructions to Update Webhook in Telnyx:" -ForegroundColor Green
Write-Host "1. Go to https://portal.telnyx.com" -ForegroundColor Yellow
Write-Host "2. Navigate to Messaging > Messaging Profiles" -ForegroundColor Yellow
Write-Host "3. Click on your messaging profile" -ForegroundColor Yellow
Write-Host "4. Set Webhook URL to: https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/sms-webhook" -ForegroundColor Cyan
Write-Host "5. Make sure 'Inbound Messages' is checked in webhook settings" -ForegroundColor Yellow
Write-Host "6. Save the changes" -ForegroundColor Yellow

Write-Host "`nDone!" -ForegroundColor Green

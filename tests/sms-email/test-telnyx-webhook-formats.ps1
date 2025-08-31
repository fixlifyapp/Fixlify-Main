# Test Script for Telnyx Webhook Function

$headers = @{
    "Authorization" = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xcHB2Y3JsdnNncnNxZWxnbG9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1OTE3MDUsImV4cCI6MjA2MzE2NzcwNX0.My-KiqG1bCMqzUru4m59d4v18N3WGxNoNtFPOFAmhzg"
    "Content-Type" = "application/json"
}

Write-Host "===== Testing Telnyx Webhook Function =====" -ForegroundColor Cyan
Write-Host ""

# Test 1: Basic GET Request
Write-Host "Test 1: Basic GET Request" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/telnyx-webhook" -Method Get -Headers $headers
    Write-Host "Success: $response" -ForegroundColor Green
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}
Write-Host ""

# Test 2: Standard Telnyx SMS Webhook Format
Write-Host "Test 2: Standard Telnyx SMS Webhook" -ForegroundColor Yellow

$telnyxWebhook = @{
    data = @{
        record_type = "message"
        id = "3fa85f64-5717-4562-b3fc-2c963f66afa6"
        type = "SMS"
        url = "https://messaging.telnyx.com/messages/3fa85f64-5717-4562-b3fc-2c963f66afa6"
        direction = "inbound"
        messaging_profile_id = "3fa85f64-5717-4562-b3fc-2c963f66afa6"
        from = @{
            phone_number = "+12345678901"
            carrier = "Verizon"
            line_type = "Wireless"
        }
        to = @(
            @{
                phone_number = "+19876543210"
                status = "delivered"
            }
        )
        text = "Test message from Telnyx"
        encoding = "GSM-7"
        webhook_url = "https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/telnyx-webhook"
        webhook_failover_url = ""
        media = @()
        errors = @()
        cost = @{
            amount = "0.005"
            currency = "USD"
        }
        received_at = "2025-01-10T15:00:00.000Z"
        sent_at = $null
        completed_at = $null
        valid_until = $null
        subject = ""
    }
    meta = @{
        attempt = 1
        delivered_to = "https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/telnyx-webhook"
    }
} | ConvertTo-Json -Depth 10

try {
    $response = Invoke-RestMethod -Uri "https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/telnyx-webhook" -Method Post -Headers $headers -Body $telnyxWebhook
    Write-Host "Success! Response:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Error occurred:" -ForegroundColor Red
    Write-Host $_.Exception.Message
    if ($_.Exception.Response) {
        try {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $reader.BaseStream.Position = 0
            $reader.DiscardBufferedData()
            $responseBody = $reader.ReadToEnd()
            Write-Host "Response body:" -ForegroundColor Yellow
            Write-Host $responseBody
        } catch {
            Write-Host "Could not read response body"
        }
    }
}
Write-Host ""

# Test 3: Minimal Telnyx Webhook
Write-Host "Test 3: Minimal Telnyx Webhook" -ForegroundColor Yellow

$minimalWebhook = @{
    data = @{
        payload = @{
            from = @{
                phone_number = "+12345678901"
            }
            to = @(
                @{
                    phone_number = "+19876543210"
                }
            )
            text = "Test message"
            direction = "inbound"
            received_at = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
        }
    }
} | ConvertTo-Json -Depth 10

try {
    $response = Invoke-RestMethod -Uri "https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/telnyx-webhook" -Method Post -Headers $headers -Body $minimalWebhook
    Write-Host "Success! Response:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Error occurred:" -ForegroundColor Red
    Write-Host $_.Exception.Message
    if ($_.Exception.Response) {
        try {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $reader.BaseStream.Position = 0
            $reader.DiscardBufferedData()
            $responseBody = $reader.ReadToEnd()
            Write-Host "Response body:" -ForegroundColor Yellow
            Write-Host $responseBody
        } catch {
            Write-Host "Could not read response body"
        }
    }
}
Write-Host ""

# Test 4: Try with just payload
Write-Host "Test 4: Direct Payload Format" -ForegroundColor Yellow

$directPayload = @{
    from = @{
        phone_number = "+12345678901"
    }
    to = @(
        @{
            phone_number = "+19876543210"
        }
    )
    text = "Test message"
    direction = "inbound"
} | ConvertTo-Json -Depth 10

try {
    $response = Invoke-RestMethod -Uri "https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/telnyx-webhook" -Method Post -Headers $headers -Body $directPayload
    Write-Host "Success! Response:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Error occurred:" -ForegroundColor Red
    Write-Host $_.Exception.Message
    if ($_.Exception.Response) {
        try {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $reader.BaseStream.Position = 0
            $reader.DiscardBufferedData()
            $responseBody = $reader.ReadToEnd()
            Write-Host "Response body:" -ForegroundColor Yellow
            Write-Host $responseBody
        } catch {
            Write-Host "Could not read response body"
        }
    }
}

Write-Host ""
Write-Host "===== Test Complete =====" -ForegroundColor Cyan
$headers = @{
    "Authorization" = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xcHB2Y3JsdnNncnNxZWxnbG9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1OTE3MDUsImV4cCI6MjA2MzE2NzcwNX0.My-KiqG1bCMqzUru4m59d4v18N3WGxNoNtFPOFAmhzg"
    "Content-Type" = "application/json"
    "telnyx-signature-ed25519-signature" = "test_signature"
    "telnyx-signature-ed25519-timestamp" = [string](Get-Date -UFormat %s)
}

$body = @{
    data = @{
        event_type = "message.received"
        id = "test-msg-001"
        occurred_at = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
        payload = @{
            direction = "inbound"
            from = @{
                phone_number = "+1234567890"
                carrier = "Test Carrier"
                line_type = "Wireless"
            }
            id = "test-msg-001"
            text = "Test incoming SMS message"
            to = @(
                @{
                    phone_number = "+1987654321"
                    status = "delivered"
                }
            )
            type = "SMS"
            record_type = "message"
            received_at = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
        }
        record_type = "event"
    }
    meta = @{
        attempt = 1
        delivered_to = "https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/telnyx-webhook"
    }
} | ConvertTo-Json -Depth 10

Write-Host "Testing Telnyx Webhook..." -ForegroundColor Yellow
Write-Host "URL: https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/telnyx-webhook" -ForegroundColor Cyan
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri "https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/telnyx-webhook" -Method Post -Headers $headers -Body $body
    Write-Host "Success! Response:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Error occurred:" -ForegroundColor Red
    Write-Host $_.Exception.Message
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $reader.BaseStream.Position = 0
        $reader.DiscardBufferedData()
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response body:" -ForegroundColor Yellow
        Write-Host $responseBody
    }
}

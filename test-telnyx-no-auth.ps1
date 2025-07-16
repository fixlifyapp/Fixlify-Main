# Test Telnyx Webhook Without Auth

Write-Host "Testing Telnyx Webhook (No Auth Required)" -ForegroundColor Cyan
Write-Host ""

# Test 1: Simulate Telnyx webhook with signature headers
$telnyxHeaders = @{
    "Content-Type" = "application/json"
    "telnyx-signature-ed25519-signature" = "test_signature_123"
    "telnyx-signature-ed25519-timestamp" = [string](Get-Date -UFormat %s)
    "user-agent" = "Telnyx-Webhooks/1.0"
}

$telnyxPayload = @{
    data = @{
        record_type = "message"
        id = "msg_" + (Get-Random -Maximum 999999)
        event_type = "message.received"
        payload = @{
            from = @{
                phone_number = "+15551234567"
                carrier = "Verizon"
                line_type = "Wireless"
            }
            to = @(
                @{
                    phone_number = "+19876543210"
                    status = "queued"
                }
            )
            text = "Test message from Telnyx webhook"
            direction = "inbound"
            encoding = "GSM-7"
            received_at = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
            id = "msg_" + (Get-Random -Maximum 999999)
        }
    }
} | ConvertTo-Json -Depth 10

Write-Host "Sending Telnyx webhook (should work without auth)..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/telnyx-webhook" -Method Post -Headers $telnyxHeaders -Body $telnyxPayload
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
Write-Host "The webhook should now accept Telnyx requests without authentication!" -ForegroundColor Green
Write-Host ""
Write-Host "Configure this webhook URL in your Telnyx dashboard:" -ForegroundColor Yellow
Write-Host "https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/telnyx-webhook" -ForegroundColor Cyan
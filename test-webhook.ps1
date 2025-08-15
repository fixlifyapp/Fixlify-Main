$headers = @{
    'Content-Type' = 'application/json'
}

$body = @{
    data = @{
        payload = @{
            telnyx_agent_target = '+14375249932'
            telnyx_end_user_target = '+14375621308'
        }
        event_type = 'assistant.initialization'
    }
} | ConvertTo-Json -Depth 10

try {
    $response = Invoke-RestMethod -Uri 'https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/ai-assistant-webhook' -Method POST -Headers $headers -Body $body
    Write-Host "SUCCESS! Response received:" -ForegroundColor Green
    $response.dynamic_variables.greeting
    Write-Host "Agent: $($response.dynamic_variables.agent_name)"
    Write-Host "Company: $($response.dynamic_variables.company_name)"
} catch {
    Write-Host "ERROR: $_" -ForegroundColor Red
}
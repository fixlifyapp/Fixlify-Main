Write-Host "Monitoring for incoming SMS messages from Taras..." -ForegroundColor Cyan
Write-Host "Conversation ID: 190aa1e5-1bc7-4f4f-945b-e5fd9f3bab75" -ForegroundColor Yellow
Write-Host "Client: Taras (+14168875839)" -ForegroundColor Yellow
Write-Host "Your number: +14375249932" -ForegroundColor Yellow
Write-Host "`nPress Ctrl+C to stop monitoring`n" -ForegroundColor Gray

$lastMessageId = "4031981e-624a-47b3-97c9-bcf01420f79a"
$conversationId = "190aa1e5-1bc7-4f4f-945b-e5fd9f3bab75"

$headers = @{
    'Authorization' = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xcHB2Y3JsdnNncnNxZWxnbG9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1OTE3MDUsImV4cCI6MjA2MzE2NzcwNX0.My-KiqG1bCMqzUru4m59d4v18N3WGxNoNtFPOFAmhzg'
    'apikey' = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xcHB2Y3JsdnNncnNxZWxnbG9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1OTE3MDUsImV4cCI6MjA2MzE2NzcwNX0.My-KiqG1bCMqzUru4m59d4v18N3WGxNoNtFPOFAmhzg'
    'Content-Type' = 'application/json'
}

while ($true) {
    try {
        # Query for new messages
        $query = @{
            select = 'id,direction,from_number,to_number,content,status,created_at'
            conversation_id = "eq.$conversationId"
            order = 'created_at.desc'
            limit = 5
        }
        
        $uri = "https://mqppvcrlvsgrsqelglod.supabase.co/rest/v1/sms_messages?" + ($query.GetEnumerator() | ForEach-Object { "$($_.Key)=$($_.Value)" }) -join '&'
        
        $messages = Invoke-RestMethod -Uri $uri -Headers $headers -Method Get
        
        if ($messages -and $messages.Count -gt 0) {
            $latestMessage = $messages[0]
            
            if ($latestMessage.id -ne $lastMessageId) {
                # New message detected!
                $timestamp = Get-Date -Format "HH:mm:ss"
                
                if ($latestMessage.direction -eq "inbound") {
                    Write-Host "`n[$timestamp] " -NoNewline
                    Write-Host "INCOMING MESSAGE" -ForegroundColor Green -NoNewline
                    Write-Host " from " -NoNewline
                    Write-Host $latestMessage.from_number -ForegroundColor Cyan
                    Write-Host "Message: " -NoNewline
                    Write-Host $latestMessage.content -ForegroundColor White
                    Write-Host "Status: $($latestMessage.status)" -ForegroundColor Gray
                    Write-Host "Message ID: $($latestMessage.id)" -ForegroundColor DarkGray
                } else {
                    Write-Host "`n[$timestamp] Outbound message: $($latestMessage.content.Substring(0, [Math]::Min(50, $latestMessage.content.Length)))..." -ForegroundColor DarkGray
                }
                
                $lastMessageId = $latestMessage.id
            }
        }
        
        # Also check conversation unread count
        $convUri = "https://mqppvcrlvsgrsqelglod.supabase.co/rest/v1/sms_conversations?id=eq.$conversationId&select=unread_count"
        $conv = Invoke-RestMethod -Uri $convUri -Headers $headers -Method Get
        
        if ($conv -and $conv[0].unread_count -gt 0) {
            Write-Host "`r[$(Get-Date -Format 'HH:mm:ss')] Unread messages: $($conv[0].unread_count)" -NoNewline -ForegroundColor Yellow
        } else {
            Write-Host "`r[$(Get-Date -Format 'HH:mm:ss')] Monitoring..." -NoNewline -ForegroundColor DarkGray
        }
        
    } catch {
        Write-Host "`nError checking messages: $_" -ForegroundColor Red
    }
    
    Start-Sleep -Seconds 2
}

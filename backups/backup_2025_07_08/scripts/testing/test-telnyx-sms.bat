@echo off
echo Testing telnyx-sms edge function directly...
curl -X POST https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/telnyx-sms ^
-H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xcHB2Y3JsdnNncnNxZWxnbG9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1OTE3MDUsImV4cCI6MjA2MzE2NzcwNX0.My-KiqG1bCMqzUru4m59d4v18N3WGxNoNtFPOFAmhzg" ^
-H "Content-Type: application/json" ^
-d "{\"recipientPhone\":\"+14377476737\",\"message\":\"Direct test of telnyx-sms\",\"user_id\":\"6dfbdcae-c484-45aa-9327-763500213f24\"}"
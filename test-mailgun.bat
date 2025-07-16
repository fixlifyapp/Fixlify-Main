@echo off
echo Testing Mailgun Edge Function...
echo.

set SUPABASE_URL=https://mqppvcrlvsgrsqelglod.supabase.co
set ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xcHB2Y3JsdnNncnNxZWxnbG9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1OTE3MDUsImV4cCI6MjA2MzE2NzcwNX0.My-KiqG1bCMqzUru4m59d4v18N3WGxNoNtFPOFAmhzg

curl -X POST "%SUPABASE_URL%/functions/v1/mailgun-email" ^
  -H "Authorization: Bearer %ANON_KEY%" ^
  -H "Content-Type: application/json" ^
  -d "{\"to\": \"petrusenkocorp@gmail.com\", \"subject\": \"Test Email from Fixlify\", \"text\": \"This is a test email to verify Mailgun is working correctly.\", \"html\": \"^<h1^>Test Email^</h1^>^<p^>This is a test email to verify Mailgun is working correctly.^</p^>\"}"

echo.
echo Test completed. Check your email.
pause

@echo off
cd C:\Users\petru\Downloads\TEST FIX SITE\3\Fixlify-Main-main
curl -X POST https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/test-env ^
-H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xcHB2Y3JsdnNncnNxZWxnbG9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1OTE3MDUsImV4cCI6MjA2MzE2NzcwNX0.My-KiqG1bCMqzUru4m59d4v18N3WGxNoNtFPOFAmhzg" ^
-H "Content-Type: application/json" ^
-d "{}"
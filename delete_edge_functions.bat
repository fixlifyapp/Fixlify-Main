@echo off
cd /d "C:\Users\petru\Downloads\TEST FIX SITE\3\Fixlify-Main-main"

echo === DELETING EDGE FUNCTIONS FROM SUPABASE ===
echo.

echo Deleting mailgun-email...
supabase functions delete mailgun-email --project-ref mqppvcrlvsgrsqelglod

echo Deleting send-estimate...
supabase functions delete send-estimate --project-ref mqppvcrlvsgrsqelglod

echo Deleting send-estimate-sms...
supabase functions delete send-estimate-sms --project-ref mqppvcrlvsgrsqelglod

echo Deleting send-invoice...
supabase functions delete send-invoice --project-ref mqppvcrlvsgrsqelglod

echo Deleting send-invoice-sms...
supabase functions delete send-invoice-sms --project-ref mqppvcrlvsgrsqelglod

echo Deleting telnyx-sms...
supabase functions delete telnyx-sms --project-ref mqppvcrlvsgrsqelglod

echo Deleting test-env...
supabase functions delete test-env --project-ref mqppvcrlvsgrsqelglod

echo.
echo === EDGE FUNCTIONS DELETED ===
pause

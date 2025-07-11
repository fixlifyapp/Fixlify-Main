@echo off
cd /d "C:\Users\petru\Downloads\TEST FIX SITE\3\Fixlify-Main-main"

echo === DELETING ALL SMS/EMAIL EDGE FUNCTIONS FROM SUPABASE ===
echo.
echo This will delete all SMS/Email related Edge Functions from your Supabase project.
echo.

REM SMS/Email sending functions
echo [1/25] Deleting mailgun-email...
supabase functions delete mailgun-email --project-ref mqppvcrlvsgrsqelglod

echo [2/25] Deleting send-estimate...
supabase functions delete send-estimate --project-ref mqppvcrlvsgrsqelglod

echo [3/25] Deleting send-estimate-sms...
supabase functions delete send-estimate-sms --project-ref mqppvcrlvsgrsqelglod

echo [4/25] Deleting send-invoice...
supabase functions delete send-invoice --project-ref mqppvcrlvsgrsqelglod

echo [5/25] Deleting send-invoice-sms...
supabase functions delete send-invoice-sms --project-ref mqppvcrlvsgrsqelglod

echo [6/25] Deleting telnyx-sms...
supabase functions delete telnyx-sms --project-ref mqppvcrlvsgrsqelglod

echo [7/25] Deleting test-env...
supabase functions delete test-env --project-ref mqppvcrlvsgrsqelglod
REM Email configuration and tracking
echo [8/25] Deleting check-email-config...
supabase functions delete check-email-config --project-ref mqppvcrlvsgrsqelglod

echo [9/25] Deleting track-email-open...
supabase functions delete track-email-open --project-ref mqppvcrlvsgrsqelglod

echo [10/25] Deleting mailgun-webhook...
supabase functions delete mailgun-webhook --project-ref mqppvcrlvsgrsqelglod

REM Telnyx related functions
echo [11/25] Deleting telnyx-webhook...
supabase functions delete telnyx-webhook --project-ref mqppvcrlvsgrsqelglod

echo [12/25] Deleting telnyx-webhook-router...
supabase functions delete telnyx-webhook-router --project-ref mqppvcrlvsgrsqelglod

echo [13/25] Deleting telnyx-webhook-handler...
supabase functions delete telnyx-webhook-handler --project-ref mqppvcrlvsgrsqelglod

echo [14/25] Deleting telnyx-phone-manager...
supabase functions delete telnyx-phone-manager --project-ref mqppvcrlvsgrsqelglod

echo [15/25] Deleting telnyx-phone-numbers...
supabase functions delete telnyx-phone-numbers --project-ref mqppvcrlvsgrsqelglod

echo [16/25] Deleting sync-telnyx-numbers...
supabase functions delete sync-telnyx-numbers --project-ref mqppvcrlvsgrsqelglod

echo [17/25] Deleting telnyx-messaging-profile...
supabase functions delete telnyx-messaging-profile --project-ref mqppvcrlvsgrsqelglod

echo [18/25] Deleting telnyx-make-call...
supabase functions delete telnyx-make-call --project-ref mqppvcrlvsgrsqelglod

echo [19/25] Deleting test-telnyx-connection...
supabase functions delete test-telnyx-connection --project-ref mqppvcrlvsgrsqelglod
REM Phone number management
echo [20/25] Deleting manage-phone-numbers...
supabase functions delete manage-phone-numbers --project-ref mqppvcrlvsgrsqelglod

echo [21/25] Deleting setup-telnyx-number...
supabase functions delete setup-telnyx-number --project-ref mqppvcrlvsgrsqelglod

echo [22/25] Deleting debug-phone-lookup...
supabase functions delete debug-phone-lookup --project-ref mqppvcrlvsgrsqelglod

echo [23/25] Deleting fix-phone-assignments...
supabase functions delete fix-phone-assignments --project-ref mqppvcrlvsgrsqelglod

echo [24/25] Deleting phone-number-reseller...
supabase functions delete phone-number-reseller --project-ref mqppvcrlvsgrsqelglod

REM Mailgun domains
echo [25/25] Deleting manage-mailgun-domains...
supabase functions delete manage-mailgun-domains --project-ref mqppvcrlvsgrsqelglod

echo.
echo === ALL SMS/EMAIL EDGE FUNCTIONS DELETION COMPLETE ===
echo.
echo Next steps:
echo 1. Check Supabase dashboard to confirm all functions are deleted
echo 2. The system is now completely clean of SMS/Email functionality
echo.
pause
@echo off
REM Supabase Edge Functions Cleanup Script for Windows

echo Starting Supabase Edge Functions Cleanup...
echo.

REM Delete duplicate/old functions
echo Removing duplicate functions...
call supabase functions delete send-invoice-email --project-ref mqppvcrlvsgrsqelglod
call supabase functions delete email-send --project-ref mqppvcrlvsgrsqelglod

echo.
echo Functions that need redeployment with new Telnyx API:
echo - telnyx-sms
echo - send-invoice-sms
echo - send-estimate-sms
echo - telnyx-webhook
echo - telnyx-voice-webhook
echo - telnyx-phone-numbers
echo - manage-phone-numbers
echo - setup-telnyx-number
echo - sync-telnyx-numbers
echo - telnyx-phone-manager
echo - telnyx-webhook-handler
echo - telnyx-webhook-router
echo - telnyx-make-call
echo - telnyx-messaging-profile

echo.
echo Checking webhook configurations...
echo Make sure these URLs are configured in your services:
echo Telnyx Webhook: https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/telnyx-webhook
echo Mailgun Webhook: https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/mailgun-webhook

pause

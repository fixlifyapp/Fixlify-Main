@echo off
echo Redeploying Telnyx Edge Functions...
echo.

set FUNCTIONS=telnyx-sms send-invoice-sms send-estimate-sms telnyx-webhook telnyx-voice-webhook telnyx-phone-numbers manage-phone-numbers setup-telnyx-number sync-telnyx-numbers telnyx-phone-manager telnyx-webhook-handler telnyx-webhook-router telnyx-make-call telnyx-messaging-profile

echo Functions to redeploy:
echo %FUNCTIONS%
echo.

for %%f in (%FUNCTIONS%) do (
    echo Deploying %%f...
    supabase functions deploy %%f
    echo.
)

echo All Telnyx functions have been redeployed!
echo.
echo IMPORTANT: Make sure to update these webhook URLs in your Telnyx dashboard:
echo - Message Webhook: https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/telnyx-webhook
echo - Voice Webhook: https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/telnyx-voice-webhook
echo.
pause

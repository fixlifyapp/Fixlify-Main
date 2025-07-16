@echo off
echo Please enter your new Telnyx API KEY:
echo (It should start with KEY...)
echo.
set /p TELNYX_KEY=Enter Telnyx API Key: 

if "%TELNYX_KEY%"=="" (
    echo No API key entered. Exiting...
    pause
    exit /b
)

echo.
echo Setting TELNYX_API_KEY in Supabase...
supabase secrets set TELNYX_API_KEY=%TELNYX_KEY%

echo.
echo API Key has been updated!
echo.
echo The new key will be used by all Telnyx edge functions immediately.
echo.
echo Next steps:
echo 1. Configure webhooks in Telnyx dashboard:
echo    - SMS Webhook: https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/telnyx-webhook
echo    - Voice Webhook: https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/telnyx-voice-webhook
echo.
echo 2. Test SMS sending from the app
echo.
pause

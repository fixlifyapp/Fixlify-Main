@echo off
echo Setting Supabase Environment Variables...
echo.

echo Please enter your Telnyx API Key:
set /p TELNYX_KEY=

echo.
echo Please enter your Mailgun API Key (or press Enter to skip):
set /p MAILGUN_KEY=

echo.
echo Setting secrets in Supabase...

if not "%TELNYX_KEY%"=="" (
    echo Setting TELNYX_API_KEY...
    supabase secrets set TELNYX_API_KEY=%TELNYX_KEY%
)

if not "%MAILGUN_KEY%"=="" (
    echo Setting MAILGUN_API_KEY...
    supabase secrets set MAILGUN_API_KEY=%MAILGUN_KEY%
)

echo.
echo Listing current secrets...
supabase secrets list

echo.
echo Done! You may need to redeploy edge functions for changes to take effect.
pause

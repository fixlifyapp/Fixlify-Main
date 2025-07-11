@echo off
cd /d "C:\Users\petru\Downloads\TEST FIX SITE\3\Fixlify-Main-main"

echo ========================================
echo Pushing all recent changes to Supabase
echo ========================================

echo.
echo [1/4] Checking current directory...
echo %CD%

echo.
echo [2/4] Checking Supabase CLI...
supabase --version

echo.
echo [3/4] Applying database migrations...
supabase db push

echo.
echo [4/4] Deploying Edge Functions...
supabase functions deploy send-email --no-verify-jwt
supabase functions deploy send-sms --no-verify-jwt
supabase functions deploy send-webhook --no-verify-jwt
supabase functions deploy email-webhook --no-verify-jwt
supabase functions deploy sms-webhook --no-verify-jwt
supabase functions deploy voice-webhook --no-verify-jwt
supabase functions deploy mailgun-webhook --no-verify-jwt
supabase functions deploy telnyx-webhook --no-verify-jwt

echo.
echo ========================================
echo Push completed!
echo ========================================

pause

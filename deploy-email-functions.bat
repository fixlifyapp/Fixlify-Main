@echo off
echo Deploying Fixlify Email Edge Functions...
echo.

echo 1. Deploying mailgun-email function...
npx supabase functions deploy mailgun-email --no-verify-jwt
echo.

echo 2. Deploying send-estimate function...
npx supabase functions deploy send-estimate
echo.

echo 3. Deploying send-invoice function...
npx supabase functions deploy send-invoice
echo.

echo 4. Deploying check-email-config function...
npx supabase functions deploy check-email-config
echo.

echo ✅ All email functions deployed!
echo.
echo Next steps:
echo 1. Go to https://supabase.com/dashboard/project/mqppvcrlvsgrsqelglod/functions/secrets
echo 2. Add these secrets if not already set:
echo    - MAILGUN_API_KEY (your Mailgun API key)
echo    - MAILGUN_DOMAIN=fixlify.app
echo.
pause

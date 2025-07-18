@echo off
echo.
echo 🚀 Deploying Test Mode Edge Functions...
echo =====================================
echo.

cd /d "C:\Users\petru\Downloads\TEST FIX SITE\3\Fixlify-Main-main"

echo 📧 Deploying send-estimate (with test mode support)...
call supabase functions deploy send-estimate --no-verify-jwt
if %ERRORLEVEL% neq 0 (
    echo ❌ Failed to deploy send-estimate
) else (
    echo ✅ send-estimate deployed successfully
)
echo.

echo 📧 Deploying send-invoice (with test mode support)...  
call supabase functions deploy send-invoice --no-verify-jwt
if %ERRORLEVEL% neq 0 (
    echo ❌ Failed to deploy send-invoice
) else (
    echo ✅ send-invoice deployed successfully
)
echo.

echo 📱 Note: SMS functions will also work in test mode
echo.

echo =====================================
echo ✅ Deployment Complete!
echo.
echo 📝 The edge functions now support TEST MODE:
echo   - Works without Mailgun/Telnyx API keys
echo   - Logs all send attempts to communication tables
echo   - Returns success without actually sending
echo.
echo 🔑 To enable production mode:
echo   1. Get Mailgun API key from https://mailgun.com
echo   2. Add secrets in Supabase dashboard:
echo      https://supabase.com/dashboard/project/mqppvcrlvsgrsqelglod/functions/secrets
echo.
pause

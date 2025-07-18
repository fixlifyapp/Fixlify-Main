@echo off
echo 🚀 Deploying Telnyx sync functions...

REM Check if logged in
echo 📋 Checking Supabase login status...
supabase status >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Not logged in to Supabase. Please run: supabase login
    exit /b 1
)

REM Deploy functions
echo.
echo 📦 Deploying telnyx-phone-numbers function...
supabase functions deploy telnyx-phone-numbers
if %errorlevel% neq 0 (
    echo ❌ Failed to deploy telnyx-phone-numbers
    exit /b 1
)

echo.
echo 📦 Deploying sync-telnyx-numbers function...
supabase functions deploy sync-telnyx-numbers
if %errorlevel% neq 0 (
    echo ❌ Failed to deploy sync-telnyx-numbers
    exit /b 1
)

echo.
echo 📦 Deploying telnyx-webhook-handler function...
supabase functions deploy telnyx-webhook-handler
if %errorlevel% neq 0 (
    echo ❌ Failed to deploy telnyx-webhook-handler
    exit /b 1
)

echo.
echo ✅ All functions deployed successfully!
echo.
echo 📝 Next steps:
echo 1. Add TELNYX_API_KEY to Supabase secrets
echo 2. Configure webhooks in Telnyx portal
echo 3. Visit /phone-management in your app
echo.
pause
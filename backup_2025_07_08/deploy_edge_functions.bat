@echo off
REM Deploy Edge Functions Script for Windows

echo === Deploying Supabase Edge Functions ===
echo.

REM Check if supabase CLI is installed
where supabase >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Error: Supabase CLI not found. Please install it first:
    echo    npm install -g supabase
    exit /b 1
)

REM Get the project directory
set PROJECT_DIR=C:\Users\petru\Downloads\TEST FIX SITE\3\Fixlify-Main-main
cd /d "%PROJECT_DIR%"

echo Working directory: %CD%
echo.

REM Deploy edge functions
echo Deploying Edge Functions...
echo.

REM Deploy mailgun-email function
echo Deploying mailgun-email function...
call supabase functions deploy mailgun-email --no-verify-jwt
if %ERRORLEVEL% EQU 0 (
    echo Success: mailgun-email deployed successfully
) else (
    echo Error: Failed to deploy mailgun-email
)
echo.

REM Deploy send-estimate function  
echo Deploying send-estimate function...
call supabase functions deploy send-estimate
if %ERRORLEVEL% EQU 0 (
    echo Success: send-estimate deployed successfully
) else (
    echo Error: Failed to deploy send-estimate
)
echo.

REM Deploy notifications function (already exists)
echo Checking notifications function...
call supabase functions deploy notifications
if %ERRORLEVEL% EQU 0 (
    echo Success: notifications function updated
) else (
    echo Error: Failed to update notifications
)
echo.

echo === Deployment Complete ===
echo.
echo Next steps:
echo 1. Ensure Mailgun API keys are set in Supabase secrets
echo 2. Test email sending with the test script
echo 3. Make sure clients have email addresses
echo.
pause

@echo off
echo ========================================
echo Redeploying Communication Edge Functions
echo ========================================
cd /d "C:\Users\petru\Downloads\TEST FIX SITE\3\Fixlify-Main-main"

echo.
echo [1/6] Deploying mailgun-email...
call supabase functions deploy mailgun-email
if errorlevel 1 echo Failed! Check your connection.

echo.
echo [2/6] Deploying send-invoice...
call supabase functions deploy send-invoice
if errorlevel 1 echo Failed! Check if function exists locally.

echo.
echo [3/6] Deploying send-estimate...
call supabase functions deploy send-estimate
if errorlevel 1 echo Failed! Check if function exists locally.

echo.
echo [4/6] Deploying telnyx-sms...
call supabase functions deploy telnyx-sms
if errorlevel 1 echo Failed! Check your connection.

echo.
echo [5/6] Deploying send-invoice-sms...
call supabase functions deploy send-invoice-sms
if errorlevel 1 echo Failed! Check your connection.

echo.
echo [6/6] Deploying send-estimate-sms...
call supabase functions deploy send-estimate-sms
if errorlevel 1 echo Failed! Check your connection.

echo.
echo ========================================
echo Deployment Complete!
echo ========================================
echo.
echo Now test the functions again.
echo If still failing, check:
echo 1. Supabase Dashboard > Database > Tables > RLS Policies
echo 2. Supabase Dashboard > Functions > Logs
echo.
pause

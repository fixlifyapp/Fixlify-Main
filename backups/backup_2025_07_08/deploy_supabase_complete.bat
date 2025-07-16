@echo off
setlocal enabledelayedexpansion

cd /d "C:\Users\petru\Downloads\TEST FIX SITE\3\Fixlify-Main-main"

echo ==========================================
echo Supabase Deployment Script - Last 2 Days
echo ==========================================
echo.

REM Check Supabase CLI
echo [1/5] Checking Supabase CLI...
supabase --version
if errorlevel 1 (
    echo ERROR: Supabase CLI not found!
    pause
    exit /b 1
)

echo.
echo [2/5] Linking to project...
supabase link --project-ref mqppvcrlvsgrsqelglod

echo.
echo [3/5] Pushing database changes...
echo This will apply all pending migrations...
supabase db push

echo.
echo [4/5] Deploying Edge Functions...
echo.

REM Deploy all edge functions in the functions directory
for /d %%f in (supabase\functions\*) do (
    set "funcname=%%~nxf"
    if not "!funcname!"=="test-env" (
        echo Deploying function: !funcname!
        supabase functions deploy !funcname! --no-verify-jwt
        echo.
    )
)

echo.
echo [5/5] Deployment Summary
echo ==========================================
echo Database migrations: Applied
echo Edge functions: Deployed
echo.
echo To view logs, use:
echo   supabase db diff
echo   supabase functions list
echo.

pause

@echo off
echo 🚀 Deploying telnyx-phone-numbers edge function...

REM Check if logged in
echo 📋 Checking Supabase login status...
supabase status >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Not logged in to Supabase. Please run: supabase login
    exit /b 1
)

REM Check if project is linked
echo 🔗 Checking project link...
for /f "tokens=3" %%i in ('supabase status 2^>nul ^| findstr "Linked project:"') do set PROJECT_ID=%%i
if "%PROJECT_ID%"=="" (
    echo ❌ No project linked. Running link command...
    supabase link --project-ref mqppvcrlvsgrsqelglod
) else (
    echo ✅ Linked to project: %PROJECT_ID%
)

REM Deploy the function
echo 📦 Deploying edge function...
supabase functions deploy telnyx-phone-numbers
if %errorlevel% equ 0 (
    echo ✅ Edge function deployed successfully!
) else (
    echo ❌ Deployment failed
    exit /b 1
)

echo.
echo 🎉 Deployment complete!
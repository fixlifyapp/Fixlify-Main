@echo off
echo === Checking and Pushing ALL Changes from Last 2 Days ===
echo.

cd /d "C:\Users\petru\Downloads\TEST FIX SITE\3\Fixlify-Main-main"

echo Step 1: Listing all modified files in the last 2 days...
echo =========================================================
forfiles /S /D -2 /C "cmd /c echo @path" 2>nul | findstr /v "node_modules .git dist"

echo.
echo Step 2: Git Status
echo ==================
git status --short

echo.
echo Step 3: Adding all changes...
echo ============================
git add .
git add -A

echo.
echo Step 4: Creating comprehensive commit...
echo ======================================
git commit -m "feat: Major update - Email/SMS system, data isolation, and edge functions" -m "Changes from last 2 days include:" -m "- Complete email/SMS implementation with Mailgun and Telnyx" -m "- Edge functions: mailgun-email, send-estimate, notifications" -m "- Data isolation with proper RLS policies" -m "- Test scripts and diagnostic tools" -m "- Documentation and deployment scripts" -m "- Bug fixes and improvements"

echo.
echo Step 5: Pushing to GitHub...
echo ===========================
git push origin main

echo.
echo Step 6: Deploying Edge Functions via Supabase CLI...
echo ==================================================
echo Checking if Supabase CLI is installed...
where supabase >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo Supabase CLI found, deploying functions...
    
    REM Deploy each edge function
    supabase functions deploy mailgun-email --no-verify-jwt
    supabase functions deploy send-estimate
    supabase functions deploy notifications
    
    echo Edge functions deployed!
) else (
    echo Supabase CLI not found. Install it with: npm install -g supabase
)

echo.
echo === ALL DONE! ===
echo.
echo Summary:
echo - All changes from last 2 days committed
echo - Pushed to GitHub
echo - Edge functions deployed (if Supabase CLI available)
echo.
pause

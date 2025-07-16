@echo off
echo Deploying updated mailgun-email function to Supabase...
echo.

cd /d "C:\Users\petru\Downloads\TEST FIX SITE\3\Fixlify-Main-main"

echo Deploying mailgun-email function...
npx supabase functions deploy mailgun-email --no-verify-jwt

echo.
echo Deployment complete!
echo.
echo The function should now use the correct domain: fixlify.app
echo.
pause

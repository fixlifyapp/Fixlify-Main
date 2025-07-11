@echo off
REM Git Push Script for Fixlify Email/SMS Updates - Windows Version

echo === Pushing Fixlify Email/SMS Updates to GitHub ===
echo.

REM Navigate to project directory
cd /d "C:\Users\petru\Downloads\TEST FIX SITE\3\Fixlify-Main-main"

REM Check current git status
echo Current Git Status:
git status --short
echo.

REM Add all changes
echo Adding all changes...
git add .
echo.

REM Show what will be committed
echo Files to be committed:
git status --short
echo.

REM Commit changes
echo Committing changes...
git commit -m "feat: Add email/SMS functionality with Mailgun and Telnyx" -m "- Added mailgun-email edge function for email sending" -m "- Added send-estimate edge function for estimate emails" -m "- Created comprehensive test scripts for email/SMS testing" -m "- Added diagnostic scripts for troubleshooting" -m "- Implemented proper data isolation with user_id filtering" -m "- Added communication logging for all sends" -m "- Created deployment scripts for edge functions" -m "- Added documentation for email/SMS setup"

REM Get current branch
for /f "tokens=*" %%i in ('git branch --show-current') do set CURRENT_BRANCH=%%i
echo.
echo Current branch: %CURRENT_BRANCH%

REM Push to origin
echo.
echo Pushing to GitHub...
git push origin %CURRENT_BRANCH%

echo.
echo === Push Complete! ===
echo.
echo Summary of changes pushed:
echo - Email/SMS edge functions
echo - Test and diagnostic scripts  
echo - Deployment scripts
echo - Documentation
echo.
echo Check your repository on GitHub to verify the push
echo.
pause

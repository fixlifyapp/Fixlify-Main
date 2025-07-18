@echo off
echo === Git Push to Main Branch ===
echo.

cd /d "C:\Users\petru\Downloads\TEST FIX SITE\3\Fixlify-Main-main"

echo Current directory: %CD%
echo.

echo 1. Checking git status...
git status
echo.

echo 2. Adding all changes...
git add .
echo.

echo 3. Creating commit...
set /p commit_message="Enter commit message (or press Enter for default): "
if "%commit_message%"=="" set commit_message="Update: SMS webhook configuration and testing"

git commit -m "%commit_message%"
echo.

echo 4. Pulling latest changes from main (if any)...
git pull origin main --rebase
echo.

echo 5. Pushing to main branch...
git push origin main
echo.

echo === Push Complete! ===
echo.
echo Check your GitHub repository to verify the changes.
echo.
pause

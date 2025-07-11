@echo off
cd /d "C:\Users\petru\Downloads\TEST FIX SITE\3\Fixlify-Main-main"

echo ==========================================
echo Pushing Working Version to GitHub
echo ==========================================
echo.

echo [1/5] Checking git status...
git status

echo.
echo [2/5] Adding all changes...
git add .

echo.
echo [3/5] Creating commit...
git commit -m "Push working version - Email/SMS integration complete, Edge functions deployed"

echo.
echo [4/5] Checking remote...
git remote -v

echo.
echo [5/5] Pushing to GitHub...
git push origin main

echo.
echo ==========================================
echo Push Complete!
echo ==========================================
echo.
pause

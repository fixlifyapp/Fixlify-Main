@echo off
setlocal enabledelayedexpansion

cd /d "C:\Users\petru\Downloads\TEST FIX SITE\3\Fixlify-Main-main"

echo ==========================================
echo Git Push - Working Version
echo ==========================================
echo.

REM Check if we're in a git repository
git rev-parse --git-dir >nul 2>&1
if errorlevel 1 (
    echo ERROR: Not a git repository!
    echo Please initialize git first.
    pause
    exit /b 1
)

echo [1/7] Current branch...
git branch --show-current

echo.
echo [2/7] Checking status...
git status --short

echo.
echo [3/7] Adding changes...
REM Add all files except sensitive ones
git add .
git reset -- .env
git reset -- .env.local
git reset -- .env.automation

echo.
echo [4/7] Files staged for commit:
git diff --cached --name-status

echo.
echo [5/7] Creating commit...
git commit -m "Push working version - Complete Email/SMS integration" -m "Edge Functions: All deployed (mailgun-email v42, send-estimate v8, send-invoice v7, telnyx-sms v10)" -m "Features: Email via Mailgun, SMS via Telnyx, Estimate/Invoice notifications working" -m "Database: All migrations applied, communication logging active" -m "Backup created: backup_2025_07_08"

echo.
echo [6/7] Checking remote repository...
git remote -v

echo.
echo [7/7] Pushing to origin...
git push origin HEAD

if errorlevel 1 (
    echo.
    echo Push failed! Trying to pull first...
    git pull origin main --rebase
    git push origin HEAD
)

echo.
echo ==========================================
echo Git Push Complete!
echo ==========================================
echo.
echo View on GitHub: https://github.com/[your-username]/Fixlify-Main
echo.
pause

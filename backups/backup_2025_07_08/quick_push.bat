@echo off
cd /d "C:\Users\petru\Downloads\TEST FIX SITE\3\Fixlify-Main-main"

echo ==========================================
echo Git Push - Working Version
echo ==========================================
echo.

REM Add all changes except sensitive files
git add .
git reset -- .env
git reset -- .env.local
git reset -- .env.automation
git reset -- "supabase/.env.production"

REM Commit with message
git commit -m "Push working version - Email/SMS integration complete" -m "- Edge functions deployed: mailgun-email, send-estimate, send-invoice, telnyx-sms" -m "- All communication features working" -m "- Backup created: backup_2025_07_08"

REM Push to origin
git push origin main

echo.
echo ==========================================
echo Push Complete!
echo ==========================================
pause

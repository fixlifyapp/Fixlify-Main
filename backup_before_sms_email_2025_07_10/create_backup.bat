@echo off
setlocal enabledelayedexpansion

echo ==========================================
echo Creating Complete Project Backup
echo Date: 2025-07-08
echo ==========================================
echo.

set "SOURCE=C:\Users\petru\Downloads\TEST FIX SITE\3\Fixlify-Main-main"
set "BACKUP_DIR=C:\Users\petru\Downloads\TEST FIX SITE\3\Fixlify-Main-main\backup_2025_07_08"
set "TIMESTAMP=%date:~-4%%date:~3,2%%date:~0,2%_%time:~0,2%%time:~3,2%%time:~6,2%"
set "TIMESTAMP=!TIMESTAMP: =0!"

echo Creating backup folders...
mkdir "!BACKUP_DIR!\src" 2>nul
mkdir "!BACKUP_DIR!\supabase" 2>nul
mkdir "!BACKUP_DIR!\public" 2>nul
mkdir "!BACKUP_DIR!\scripts" 2>nul
mkdir "!BACKUP_DIR!\docs" 2>nul
mkdir "!BACKUP_DIR!\test-workflow" 2>nul
mkdir "!BACKUP_DIR!\console_scripts" 2>nul
mkdir "!BACKUP_DIR!\fix_send_issue" 2>nul

echo.
echo [1/8] Backing up source code...
xcopy /E /I /Y "!SOURCE!\src" "!BACKUP_DIR!\src" >nul
echo Done!

echo.
echo [2/8] Backing up Supabase files...
xcopy /E /I /Y "!SOURCE!\supabase" "!BACKUP_DIR!\supabase" >nul
echo Done!

echo.
echo [3/8] Backing up public assets...
xcopy /E /I /Y "!SOURCE!\public" "!BACKUP_DIR!\public" >nul
echo Done!

echo.
echo [4/8] Backing up scripts...
xcopy /E /I /Y "!SOURCE!\scripts" "!BACKUP_DIR!\scripts" >nul
xcopy /E /I /Y "!SOURCE!\console_scripts" "!BACKUP_DIR!\console_scripts" >nul
xcopy /E /I /Y "!SOURCE!\test-workflow" "!BACKUP_DIR!\test-workflow" >nul
xcopy /E /I /Y "!SOURCE!\fix_send_issue" "!BACKUP_DIR!\fix_send_issue" >nul
echo Done!

echo.
echo [5/8] Backing up documentation...
xcopy /E /I /Y "!SOURCE!\docs" "!BACKUP_DIR!\docs" >nul
copy /Y "!SOURCE!\*.md" "!BACKUP_DIR!\" >nul 2>&1
echo Done!

echo.
echo [6/8] Backing up configuration files...
copy /Y "!SOURCE!\package.json" "!BACKUP_DIR!\" >nul
copy /Y "!SOURCE!\package-lock.json" "!BACKUP_DIR!\" >nul
copy /Y "!SOURCE!\tsconfig*.json" "!BACKUP_DIR!\" >nul
copy /Y "!SOURCE!\vite.config.ts" "!BACKUP_DIR!\" >nul
copy /Y "!SOURCE!\postcss.config.js" "!BACKUP_DIR!\" >nul
copy /Y "!SOURCE!\tailwind.config.ts" "!BACKUP_DIR!\" >nul
copy /Y "!SOURCE!\eslint.config.js" "!BACKUP_DIR!\" >nul
copy /Y "!SOURCE!\components.json" "!BACKUP_DIR!\" >nul
copy /Y "!SOURCE!\index.html" "!BACKUP_DIR!\" >nul
copy /Y "!SOURCE!\.gitignore" "!BACKUP_DIR!\" >nul
echo Done!

echo.
echo [7/8] Backing up environment examples...
copy /Y "!SOURCE!\.env.example" "!BACKUP_DIR!\" >nul
copy /Y "!SOURCE!\.env.local.example" "!BACKUP_DIR!\" >nul
copy /Y "!SOURCE!\.env.automation.example" "!BACKUP_DIR!\" >nul
echo Done!

echo.
echo [8/8] Backing up utility scripts...
copy /Y "!SOURCE!\*.bat" "!BACKUP_DIR!\" >nul
copy /Y "!SOURCE!\*.sh" "!BACKUP_DIR!\" >nul
copy /Y "!SOURCE!\*.js" "!BACKUP_DIR!\" >nul
echo Done!

echo.
echo Creating backup info file...
echo Backup created on: !TIMESTAMP! > "!BACKUP_DIR!\BACKUP_INFO.txt"
echo Source: !SOURCE! >> "!BACKUP_DIR!\BACKUP_INFO.txt"
echo. >> "!BACKUP_DIR!\BACKUP_INFO.txt"
echo Included: >> "!BACKUP_DIR!\BACKUP_INFO.txt"
echo - All source code (src/) >> "!BACKUP_DIR!\BACKUP_INFO.txt"
echo - Supabase configuration and functions >> "!BACKUP_DIR!\BACKUP_INFO.txt"
echo - Public assets >> "!BACKUP_DIR!\BACKUP_INFO.txt"
echo - Scripts and utilities >> "!BACKUP_DIR!\BACKUP_INFO.txt"
echo - Documentation >> "!BACKUP_DIR!\BACKUP_INFO.txt"
echo - Configuration files >> "!BACKUP_DIR!\BACKUP_INFO.txt"
echo. >> "!BACKUP_DIR!\BACKUP_INFO.txt"
echo NOT included (for security): >> "!BACKUP_DIR!\BACKUP_INFO.txt"
echo - node_modules/ >> "!BACKUP_DIR!\BACKUP_INFO.txt"
echo - .env files with secrets >> "!BACKUP_DIR!\BACKUP_INFO.txt"
echo - dist/ build files >> "!BACKUP_DIR!\BACKUP_INFO.txt"
echo - .git/ repository >> "!BACKUP_DIR!\BACKUP_INFO.txt"

echo.
echo ==========================================
echo Backup Complete!
echo Location: !BACKUP_DIR!
echo ==========================================
echo.

pause

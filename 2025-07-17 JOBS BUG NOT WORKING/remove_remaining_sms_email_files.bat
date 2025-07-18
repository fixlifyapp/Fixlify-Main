@echo off
echo === REMOVING ALL REMAINING SMS/EMAIL RELATED FILES ===
echo.

cd /d "C:\Users\petru\Downloads\TEST FIX SITE\3\Fixlify-Main-main"

echo [HOOKS - SMS/Email Related]
echo Removing useMessageTemplates.ts...
del /f "src\hooks\useMessageTemplates.ts"

echo Removing useCompanyEmailSettings.ts...
del /f "src\hooks\useCompanyEmailSettings.ts"

echo.
echo [COMPONENTS - Email Directory]
echo Removing email components directory...
rd /s /q "src\components\email"

echo.
echo [COMPONENTS - Messages Directory]
echo Removing messages components directory...
rd /s /q "src\components\messages"

echo.
echo [COMPONENTS - Phone Directory]
echo Removing phone components directory...
rd /s /q "src\components\phone"

echo.
echo [COMPONENTS - Telnyx Directory]
echo Removing telnyx components directory...
rd /s /q "src\components\telnyx"
echo.
echo [COMPONENTS - Voice Directory]
echo Checking voice directory...
rd /s /q "src\components\voice"

echo.
echo [COMPONENTS - Calling Directory]
echo Checking calling directory...
rd /s /q "src\components\calling"

echo.
echo === CLEANUP COMPLETE ===
echo.
echo Removed:
echo - Email/SMS related hooks
echo - Email components
echo - Messages components
echo - Phone components
echo - Telnyx components
echo - Voice components
echo - Calling components
echo.
pause
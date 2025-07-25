@echo off
echo Starting Fixlify App...
cd /d "C:\Users\petru\Downloads\TEST FIX SITE\3\Fixlify-Main-main"
echo Current directory: %CD%
echo.
echo Installing dependencies (if needed)...
call npm install
echo.
echo Starting development server...
call npm run dev
pause
@echo off
REM Fixlify Routing Fix Script for Windows
REM Save as fix-routing.bat in your project root

echo =====================================
echo Fixing Fixlify Routing Issues...
echo =====================================

REM Kill processes on common ports
echo Killing processes on ports 8080-8084...
for %%p in (8080 8081 8082 8083 8084) do (
    for /f "tokens=5" %%a in ('netstat -aon ^| findstr :%%p') do (
        taskkill /F /PID %%a >nul 2>&1
    )
)

echo Processes killed successfully!
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo ERROR: node_modules not found!
    echo Please run: npm install
    goto :end
)

REM Clear Vite cache
echo Clearing Vite cache...
if exist "node_modules\.vite" rmdir /s /q "node_modules\.vite"
echo Cache cleared!
echo.

echo Starting development server...
echo =====================================
npm run dev

:end
pause

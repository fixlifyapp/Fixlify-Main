@echo off
echo Installing missing dependencies for Fixlyfy automation features...
echo.

cd /d "C:\Users\petru\Downloads\TEST FIX SITE\3\Fixlify-Main-main"

echo Installing ReactFlow...
npm install reactflow@11.11.4 --save

echo Installing Framer Motion...
npm install framer-motion@11.1.7 --save

echo Installing Lodash (if not already installed)...
npm install lodash@4.17.21 --save
npm install @types/lodash@4.17.0 --save-dev

echo.
echo Installation complete!
pause

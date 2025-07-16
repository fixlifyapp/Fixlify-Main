# Navigate to project directory
Set-Location "C:\Users\petru\Downloads\TEST FIX SITE\3\Fixlify-Main-main"

# Install missing dependencies
Write-Host "Installing ReactFlow..." -ForegroundColor Green
npm install reactflow@11.11.4

Write-Host "Installing Framer Motion..." -ForegroundColor Green
npm install framer-motion@11.1.7

Write-Host "Installing Lodash (if not already installed)..." -ForegroundColor Green
npm install lodash@4.17.21

Write-Host "Installing Lodash types..." -ForegroundColor Green
npm install --save-dev @types/lodash@4.17.0

Write-Host "`nAll dependencies installed successfully!" -ForegroundColor Green

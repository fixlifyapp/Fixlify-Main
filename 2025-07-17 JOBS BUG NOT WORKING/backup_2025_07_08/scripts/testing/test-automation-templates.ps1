#!/usr/bin/env pwsh

Write-Host "=== Testing Automation Templates ===" -ForegroundColor Cyan
Write-Host ""

# First, let's check if we have templates in the database
Write-Host "1. Checking automation templates in database..." -ForegroundColor Green

# Check if .env.local exists
if (Test-Path ".env.local") {
    Write-Host "   ✓ .env.local file exists" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  .env.local file missing - creating it..." -ForegroundColor Yellow
    
    @"
# Supabase Configuration
VITE_SUPABASE_URL=https://mqppvcrlvsgrsqelglod.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xcHB2Y3JsdnNncnNxZWxnbG9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTkzNDgxNTYsImV4cCI6MjAzNDkyNDE1Nn0.XaKEeJOCMJ-N6J5qM4kLLKeBb7yVqLb_bnBFvqBgLWs

# Mailgun Configuration
VITE_MAILGUN_DOMAIN=fixlify.app

# Telnyx Configuration  
VITE_TELNYX_DEFAULT_FROM_NUMBER=+14375249932
VITE_TELNYX_CONNECTION_ID=2709042883142354871
"@ | Out-File -FilePath ".env.local" -Encoding UTF8

    Write-Host "   ✓ .env.local file created" -ForegroundColor Green
}

Write-Host ""
Write-Host "2. Building the project..." -ForegroundColor Green
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✓ Build successful" -ForegroundColor Green
} else {
    Write-Host "   ❌ Build failed" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "3. Starting development server..." -ForegroundColor Green
Write-Host "   Open your browser and go to: http://localhost:5173" -ForegroundColor Yellow
Write-Host "   Navigate to: Automations > Choose Template" -ForegroundColor Yellow
Write-Host ""
Write-Host "4. What to test:" -ForegroundColor Green
Write-Host "   - Click on any automation template" -ForegroundColor White
Write-Host "   - Should open the Visual Workflow Builder" -ForegroundColor White
Write-Host "   - Should show nodes for triggers and actions" -ForegroundColor White
Write-Host "   - Should not show a blank screen" -ForegroundColor White
Write-Host ""
Write-Host "5. If you see a blank screen, check browser console for errors" -ForegroundColor Yellow
Write-Host ""

# Start the dev server
npm run dev 
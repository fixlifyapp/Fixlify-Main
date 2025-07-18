# Git Push to Main Branch Script
Write-Host "=== Git Push to Main Branch ===" -ForegroundColor Cyan
Write-Host ""

# Change to project directory
Set-Location "C:\Users\petru\Downloads\TEST FIX SITE\3\Fixlify-Main-main"
Write-Host "Current directory: $(Get-Location)" -ForegroundColor Yellow
Write-Host ""

# Check git status
Write-Host "1. Checking git status..." -ForegroundColor Green
git status
Write-Host ""

# Add all changes
Write-Host "2. Adding all changes..." -ForegroundColor Green
git add .
Write-Host ""

# Create commit
Write-Host "3. Creating commit..." -ForegroundColor Green
$commitMessage = Read-Host "Enter commit message (or press Enter for default)"
if ([string]::IsNullOrWhiteSpace($commitMessage)) {
    $commitMessage = "Update: SMS webhook configuration and testing - $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
}

git commit -m $commitMessage
Write-Host ""

# Check current branch
$currentBranch = git branch --show-current
Write-Host "Current branch: $currentBranch" -ForegroundColor Yellow

if ($currentBranch -ne "main") {
    Write-Host "WARNING: You are not on the main branch!" -ForegroundColor Red
    $switchToMain = Read-Host "Do you want to switch to main branch? (y/n)"
    if ($switchToMain -eq "y") {
        git checkout main
    }
}

# Pull latest changes
Write-Host ""
Write-Host "4. Pulling latest changes from main..." -ForegroundColor Green
git pull origin main --rebase

# Push to main
Write-Host ""
Write-Host "5. Pushing to main branch..." -ForegroundColor Green
git push origin main

Write-Host ""
Write-Host "=== Push Complete! ===" -ForegroundColor Cyan
Write-Host "Check your GitHub repository to verify the changes." -ForegroundColor Yellow
Write-Host ""
Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

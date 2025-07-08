# PowerShell Git Push Script
Set-Location "C:\Users\petru\Downloads\TEST FIX SITE\3\Fixlify-Main-main"

Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "Pushing Working Version to GitHub" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""

# Check if git repo exists
if (-not (Test-Path ".git")) {
    Write-Host "ERROR: Not a git repository!" -ForegroundColor Red
    Write-Host "Initializing git repository..." -ForegroundColor Yellow
    git init
    Write-Host ""
}

# Show current status
Write-Host "[1/7] Current Status:" -ForegroundColor Yellow
git status -s

# Add all files except sensitive ones
Write-Host ""
Write-Host "[2/7] Adding files..." -ForegroundColor Yellow
git add .
git reset -- .env 2>$null
git reset -- .env.local 2>$null
git reset -- .env.automation 2>$null
git reset -- "supabase/.env.production" 2>$null

# Show what will be committed
Write-Host ""
Write-Host "[3/7] Files to be committed:" -ForegroundColor Yellow
$staged = git diff --cached --name-only
if ($staged) {
    $staged | ForEach-Object { Write-Host "  + $_" -ForegroundColor Green }
} else {
    Write-Host "  No changes to commit" -ForegroundColor Gray
}

# Create commit
Write-Host ""
Write-Host "[4/7] Creating commit..." -ForegroundColor Yellow
$commitMsg = @"
Push working version - Complete Email/SMS integration

Edge Functions Deployed:
- mailgun-email (v42)
- send-estimate (v8) 
- send-invoice (v7)
- telnyx-sms (v10)

Features Working:
- Email sending via Mailgun
- SMS sending via Telnyx
- Estimate/Invoice notifications
- Communication tracking

Database: All migrations applied
Backup: Created in backup_2025_07_08/
"@

git commit -m $commitMsg

# Check remotes
Write-Host ""
Write-Host "[5/7] Checking remote..." -ForegroundColor Yellow
$remotes = git remote -v
if (-not $remotes) {
    Write-Host "No remote found. Please add your GitHub repository:" -ForegroundColor Red
    Write-Host "git remote add origin https://github.com/[username]/[repository].git" -ForegroundColor Yellow
    exit 1
} else {
    Write-Host $remotes
}

# Get current branch
$branch = git branch --show-current
if (-not $branch) {
    $branch = "main"
}

Write-Host ""
Write-Host "[6/7] Current branch: $branch" -ForegroundColor Yellow

# Push to remote
Write-Host ""
Write-Host "[7/7] Pushing to GitHub..." -ForegroundColor Yellow
git push origin $branch

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "Push failed. Trying with upstream..." -ForegroundColor Yellow
    git push --set-upstream origin $branch
}

Write-Host ""
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "Git Push Complete!" -ForegroundColor Green
Write-Host "===========================================" -ForegroundColor Cyan

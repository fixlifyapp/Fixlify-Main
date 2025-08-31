# Deep Analysis of SMS/Email Implementation

Write-Host "=== ANALYZING SMS/EMAIL IMPLEMENTATION ===" -ForegroundColor Cyan
Write-Host ""

# 1. Check for duplicate hooks
Write-Host "1. Checking for duplicate hooks..." -ForegroundColor Yellow
$hooks = @(
    "src\hooks\useDocumentSending.ts",
    "src\hooks\useDocumentSending.old.ts", 
    "src\hooks\useDocumentSending.broken.ts",
    "src\hooks\useUniversalDocumentSend.ts"
)
foreach ($hook in $hooks) {
    if (Test-Path "C:\Users\petru\Downloads\TEST FIX SITE\3\Fixlify-Main-main\$hook") {
        Write-Host "  Found: $hook" -ForegroundColor Red
    }
}

# 2. Check edge functions
Write-Host ""
Write-Host "2. Edge Functions for SMS/Email..." -ForegroundColor Yellow
$edgeFunctions = Get-ChildItem "C:\Users\petru\Downloads\TEST FIX SITE\3\Fixlify-Main-main\supabase\functions" -Directory | Where-Object { $_.Name -match "send|sms|email|mail|telnyx" }
foreach ($func in $edgeFunctions) {
    Write-Host "  - $($func.Name)" -ForegroundColor Green
}

# 3. Check for duplicate services
Write-Host ""
Write-Host "3. Service files..." -ForegroundColor Yellow
$services = Get-ChildItem "C:\Users\petru\Downloads\TEST FIX SITE\3\Fixlify-Main-main\src\services" -Filter "*.ts" | Where-Object { $_.Name -match "email|sms|communication" }
foreach ($service in $services) {
    Write-Host "  - $($service.Name)" -ForegroundColor Green
}

# 4. Check for disabled components
Write-Host ""
Write-Host "4. Disabled components..." -ForegroundColor Yellow
$disabled = Get-ChildItem "C:\Users\petru\Downloads\TEST FIX SITE\3\Fixlify-Main-main\src" -Recurse -Filter "*.disabled.*"
foreach ($file in $disabled) {
    Write-Host "  - $($file.FullName.Replace('C:\Users\petru\Downloads\TEST FIX SITE\3\Fixlify-Main-main\', ''))" -ForegroundColor Magenta
}

# 5. Check database tables
Write-Host ""
Write-Host "5. SMS/Email related SQL migrations..." -ForegroundColor Yellow
$migrations = Get-ChildItem "C:\Users\petru\Downloads\TEST FIX SITE\3\Fixlify-Main-main\supabase\migrations" -Filter "*.sql" | Where-Object { 
    $content = Get-Content $_.FullName -Raw
    $content -match "(sms|email|mail|telnyx|communication|message)"
}
Write-Host "  Found $($migrations.Count) related migration files" -ForegroundColor Green

# 6. TypeScript compilation check
Write-Host ""
Write-Host "6. Checking for TypeScript issues..." -ForegroundColor Yellow
$tsconfig = "C:\Users\petru\Downloads\TEST FIX SITE\3\Fixlify-Main-main\tsconfig.json"
if (Test-Path $tsconfig) {
    Write-Host "  tsconfig.json exists" -ForegroundColor Green
}

Write-Host ""
Write-Host "=== ANALYSIS COMPLETE ===" -ForegroundColor Cyan

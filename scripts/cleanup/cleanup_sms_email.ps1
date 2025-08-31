# SMS/Email Cleanup Script
Write-Host "=== CLEANING UP SMS/EMAIL IMPLEMENTATION ===" -ForegroundColor Yellow
Write-Host "This will remove all SMS/Email related code while preserving design" -ForegroundColor Cyan
Write-Host ""

$projectPath = "C:\Users\petru\Downloads\TEST FIX SITE\3\Fixlify-Main-main"

# 1. Remove duplicate hooks
Write-Host "[1/7] Removing duplicate hooks..." -ForegroundColor Yellow
$hooksToRemove = @(
    "src\hooks\useDocumentSending.ts",
    "src\hooks\useDocumentSending.old.ts",
    "src\hooks\useDocumentSending.broken.ts",
    "src\hooks\useUniversalDocumentSend.ts"
)

foreach ($hook in $hooksToRemove) {
    $fullPath = Join-Path $projectPath $hook
    if (Test-Path $fullPath) {
        Remove-Item $fullPath -Force
        Write-Host "  Removed $hook" -ForegroundColor Green
    }
}

# 2. Remove service files
Write-Host ""
Write-Host "[2/7] Removing service files..." -ForegroundColor Yellow
$servicesToRemove = @(
    "src\services\communication-service.ts",
    "src\services\communications.ts",
    "src\services\email-service.ts",
    "src\services\sms-service.ts",
    "src\services\edge-function-service.ts"
)

foreach ($service in $servicesToRemove) {
    $fullPath = Join-Path $projectPath $service
    if (Test-Path $fullPath) {
        Remove-Item $fullPath -Force
        Write-Host "  Removed $service" -ForegroundColor Green
    }
}

# 3. Remove types
Write-Host ""
Write-Host "[3/7] Removing type files..." -ForegroundColor Yellow
$typesToRemove = @(
    "src\types\communications.ts",
    "src\types\documents.ts"
)

foreach ($type in $typesToRemove) {
    $fullPath = Join-Path $projectPath $type
    if (Test-Path $fullPath) {
        Remove-Item $fullPath -Force
        Write-Host "  Removed $type" -ForegroundColor Green
    }
}

# 4. Clean up shared components (keep UI, remove logic)
Write-Host ""
Write-Host "[4/7] Cleaning up shared components..." -ForegroundColor Yellow
$componentsToRemove = @(
    "src\components\shared\EstimateSendButton.tsx",
    "src\components\shared\InvoiceSendButton.tsx"
)

foreach ($comp in $componentsToRemove) {
    $fullPath = Join-Path $projectPath $comp
    if (Test-Path $fullPath) {
        Remove-Item $fullPath -Force
        Write-Host "  Removed $comp" -ForegroundColor Green
    }
}

# 5. Remove edge functions
Write-Host ""
Write-Host "[5/7] Removing edge functions..." -ForegroundColor Yellow
$edgeFunctions = @(
    "supabase\functions\mailgun-email",
    "supabase\functions\send-estimate",
    "supabase\functions\send-estimate-sms", 
    "supabase\functions\send-invoice",
    "supabase\functions\send-invoice-sms",
    "supabase\functions\telnyx-sms",
    "supabase\functions\send-email",
    "supabase\functions\send-sms",
    "supabase\functions\test-env"
)

foreach ($func in $edgeFunctions) {
    $fullPath = Join-Path $projectPath $func
    if (Test-Path $fullPath) {
        Remove-Item $fullPath -Recurse -Force
        Write-Host "  Removed $func" -ForegroundColor Green
    }
}

# 6. List files to keep (for reference)
Write-Host ""
Write-Host "[6/7] Files being preserved:" -ForegroundColor Cyan
Write-Host "  - All UI components (design preserved)" -ForegroundColor Gray
Write-Host "  - All layouts and styling" -ForegroundColor Gray
Write-Host "  - Core job/estimate/invoice components" -ForegroundColor Gray
Write-Host "  - Database structure (will clean via SQL)" -ForegroundColor Gray

Write-Host ""
Write-Host "[7/7] Creating cleanup summary..." -ForegroundColor Yellow

# Create a summary file
$summary = @'
# SMS/Email Cleanup Summary
Date: ' + (Get-Date -Format "yyyy-MM-dd HH:mm:ss") + '

## Removed Files:
- All document sending hooks
- Communication service files  
- SMS/Email edge functions
- Duplicate implementations

## Preserved:
- All UI/UX design components
- Core business logic
- Database schema (to be cleaned separately)

## Next Steps:
1. Run SQL cleanup script to remove database tables
2. Remove related migrations
3. Implement fresh SMS/Email system
'@

$summary | Out-File -FilePath "$projectPath\SMS_EMAIL_CLEANUP_SUMMARY.md"

Write-Host ""
Write-Host "=== CLEANUP COMPLETE ===" -ForegroundColor Green
Write-Host "Summary saved to SMS_EMAIL_CLEANUP_SUMMARY.md" -ForegroundColor Cyan

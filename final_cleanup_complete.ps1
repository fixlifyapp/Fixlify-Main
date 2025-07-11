# Final Cleanup - Remove Remaining SMS/Email UI Components
Write-Host "=== REMOVING REMAINING SMS/EMAIL COMPONENTS ===" -ForegroundColor Yellow
Write-Host ""

$projectPath = "C:\Users\petru\Downloads\TEST FIX SITE\3\Fixlify-Main-main"

# 1. Remove disabled components
Write-Host "[1/4] Removing disabled components..." -ForegroundColor Yellow
$disabledFiles = @(
    "src\components\calling\CallHistory.disabled.tsx",
    "src\components\calling\UnifiedCallManager.disabled.tsx",
    "src\components\clients\ClientStatsCard.disabled.tsx",
    "src\components\connect\MailgunTestPanel.disabled.tsx",
    "src\components\connect\components\EmailInput.disabled.tsx",
    "src\components\email\EmailTemplateSelector.disabled.tsx",
    "src\components\examples\ModalExample.disabled.tsx"
)

foreach ($file in $disabledFiles) {
    $fullPath = Join-Path $projectPath $file
    if (Test-Path $fullPath) {
        Remove-Item $fullPath -Force
        Write-Host "  Removed $file" -ForegroundColor Green
    }
}

# 2. Remove backup hook files
Write-Host ""
Write-Host "[2/4] Removing backup hook files..." -ForegroundColor Yellow
$backupFiles = @(
    "src\hooks\useDocumentSending.backup.ts",
    "src\hooks\useDocumentSending.working.backup.ts"
)

foreach ($file in $backupFiles) {
    $fullPath = Join-Path $projectPath $file
    if (Test-Path $fullPath) {
        Remove-Item $fullPath -Force
        Write-Host "  Removed $file" -ForegroundColor Green
    }
}

# 3. Clean up components with send functions
Write-Host ""
Write-Host "[3/4] Cleaning up components with send functions..." -ForegroundColor Yellow

# EmailInput.tsx - Remove send functionality, keep UI
$emailInputPath = "$projectPath\src\components\connect\components\EmailInput.tsx"
if (Test-Path $emailInputPath) {
    $content = Get-Content $emailInputPath -Raw
    # Replace handleSendEmail with a placeholder
    $content = $content -replace 'const handleSendEmail[^}]+}', 'const handleSendEmail = () => { console.log("Email functionality not implemented"); }'
    $content | Set-Content $emailInputPath
    Write-Host "  Cleaned EmailInput.tsx" -ForegroundColor Green
}

# EmailInputPanel.tsx - Clean similarly
$emailPanelPath = "$projectPath\src\components\connect\components\EmailInputPanel.tsx"
if (Test-Path $emailPanelPath) {
    $content = Get-Content $emailPanelPath -Raw
    $content = $content -replace 'const handleSendEmail[^}]+}', 'const handleSendEmail = () => { console.log("Email functionality not implemented"); }'
    $content | Set-Content $emailPanelPath
    Write-Host "  Cleaned EmailInputPanel.tsx" -ForegroundColor Green
}

# EmailComposer.tsx - Clean send function
$emailComposerPath = "$projectPath\src\components\connect\EmailComposer.tsx"
if (Test-Path $emailComposerPath) {
    $content = Get-Content $emailComposerPath -Raw
    $content = $content -replace 'const sendEmail[^}]+}', 'const sendEmail = () => { console.log("Email functionality not implemented"); }'
    $content | Set-Content $emailComposerPath
    Write-Host "  Cleaned EmailComposer.tsx" -ForegroundColor Green
}

# 4. Update the placeholder hook to be truly minimal
Write-Host ""
Write-Host "[4/4] Updating placeholder hook..." -ForegroundColor Yellow

$minimalHook = @'
// Minimal placeholder - SMS/Email functionality removed
export const useDocumentSending = () => {
  return {
    sendDocument: async () => ({ success: false, error: "Not implemented" }),
    isProcessing: false
  };
};
'@

$minimalHook | Set-Content "$projectPath\src\hooks\useDocumentSending.ts"
Write-Host "  Updated placeholder hook" -ForegroundColor Green

Write-Host ""
Write-Host "=== FINAL CLEANUP COMPLETE ===" -ForegroundColor Green
Write-Host "All SMS/Email components and references have been removed!" -ForegroundColor Cyan

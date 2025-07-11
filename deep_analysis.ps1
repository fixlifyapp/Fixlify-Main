# Deep Analysis of SMS/Email Cleanup
Write-Host "=== DEEP ANALYSIS OF SMS/EMAIL CLEANUP ===" -ForegroundColor Cyan
Write-Host ""

$projectPath = "C:\Users\petru\Downloads\TEST FIX SITE\3\Fixlify-Main-main"

# 1. Check for any remaining edge functions
Write-Host "[1/10] Checking edge functions directory..." -ForegroundColor Yellow
$edgeFuncs = Get-ChildItem "$projectPath\supabase\functions" -Directory -ErrorAction SilentlyContinue
if ($edgeFuncs) {
    $smsEmailFuncs = $edgeFuncs | Where-Object { $_.Name -match "(send|sms|email|mail|telnyx|mailgun)" }
    if ($smsEmailFuncs) {
        Write-Host "  Found remaining edge functions:" -ForegroundColor Red
        $smsEmailFuncs | ForEach-Object { Write-Host "     - $($_.Name)" -ForegroundColor Red }
    } else {
        Write-Host "  ✓ No SMS/Email edge functions found" -ForegroundColor Green
    }
} else {
    Write-Host "  ✓ Edge functions directory clean" -ForegroundColor Green
}

# 2. Search for SMS/Email imports in components
Write-Host ""
Write-Host "[2/10] Searching for SMS/Email imports in components..." -ForegroundColor Yellow
$componentFiles = Get-ChildItem "$projectPath\src" -Recurse -Include "*.tsx","*.ts" -ErrorAction SilentlyContinue
$importIssues = @()
foreach ($file in $componentFiles) {
    $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
    if ($content -match "import.*from.*(email-service|sms-service|communication-service|edge-function-service)") {
        $importIssues += $file.FullName.Replace($projectPath, "")
    }
}
if ($importIssues.Count -gt 0) {
    Write-Host "  Files with SMS/Email service imports:" -ForegroundColor Red
    $importIssues | ForEach-Object { Write-Host "     $_" -ForegroundColor Red }
} else {
    Write-Host "  ✓ No SMS/Email service imports found" -ForegroundColor Green
}

# 3. Check for SMS/Email related environment variables
Write-Host ""
Write-Host "[3/10] Checking environment variables..." -ForegroundColor Yellow
$envFiles = @(".env", ".env.local", ".env.example", ".env.local.example")
$envVarsFound = @()
foreach ($envFile in $envFiles) {
    $envPath = Join-Path $projectPath $envFile
    if (Test-Path $envPath) {
        $envContent = Get-Content $envPath -ErrorAction SilentlyContinue
        $smsEmailVars = $envContent | Where-Object { $_ -match "(MAILGUN|TELNYX|SMS|EMAIL|TWILIO)" }
        if ($smsEmailVars) {
            $envVarsFound += @{File=$envFile; Vars=$smsEmailVars}
        }
    }
}
if ($envVarsFound.Count -gt 0) {
    Write-Host "  SMS/Email environment variables found:" -ForegroundColor Yellow
    foreach ($env in $envVarsFound) {
        Write-Host "     In $($env.File):" -ForegroundColor Yellow
        $env.Vars | ForEach-Object { Write-Host "       $_" -ForegroundColor Gray }
    }
} else {
    Write-Host "  ✓ No SMS/Email environment variables" -ForegroundColor Green
}

# 4. Check for references in package.json
Write-Host ""
Write-Host "[4/10] Checking package.json dependencies..." -ForegroundColor Yellow
$packageJson = Get-Content "$projectPath\package.json" -Raw | ConvertFrom-Json
$smsEmailPackages = @()
$packagesToCheck = @("mailgun", "telnyx", "twilio", "sendgrid", "@sendgrid", "nodemailer")
foreach ($dep in $packageJson.dependencies.PSObject.Properties.Name) {
    foreach ($check in $packagesToCheck) {
        if ($dep -like "*$check*") {
            $smsEmailPackages += $dep
        }
    }
}
if ($smsEmailPackages.Count -gt 0) {
    Write-Host "  SMS/Email packages in dependencies:" -ForegroundColor Yellow
    $smsEmailPackages | ForEach-Object { Write-Host "     - $_" -ForegroundColor Yellow }
} else {
    Write-Host "  ✓ No SMS/Email packages in dependencies" -ForegroundColor Green
}

# 5. Check for API calls to SMS/Email services
Write-Host ""
Write-Host "[5/10] Searching for API calls..." -ForegroundColor Yellow
$apiCalls = @()
foreach ($file in $componentFiles) {
    $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
    if ($content -match "(fetch|axios).*(send-email|send-sms|mailgun|telnyx)") {
        $apiCalls += $file.FullName.Replace($projectPath, "")
    }
}
if ($apiCalls.Count -gt 0) {
    Write-Host "  Files with SMS/Email API calls:" -ForegroundColor Red
    $apiCalls | ForEach-Object { Write-Host "     $_" -ForegroundColor Red }
} else {
    Write-Host "  ✓ No SMS/Email API calls found" -ForegroundColor Green
}

# 6. Check Supabase config
Write-Host ""
Write-Host "[6/10] Checking Supabase configuration..." -ForegroundColor Yellow
$supabaseConfig = "$projectPath\supabase\config.toml"
if (Test-Path $supabaseConfig) {
    $configContent = Get-Content $supabaseConfig -Raw
    if ($configContent -match "(mailgun|telnyx|sms|email_provider)") {
        Write-Host "  SMS/Email configuration found in config.toml" -ForegroundColor Yellow
    } else {
        Write-Host "  ✓ Supabase config clean" -ForegroundColor Green
    }
}

# 7. Check for disabled components
Write-Host ""
Write-Host "[7/10] Checking disabled components..." -ForegroundColor Yellow
$disabledComponents = Get-ChildItem "$projectPath\src" -Recurse -Filter "*.disabled.*" -ErrorAction SilentlyContinue
if ($disabledComponents) {
    Write-Host "  Disabled components (may contain SMS/Email code):" -ForegroundColor Cyan
    $disabledComponents | ForEach-Object { 
        Write-Host "     - $($_.FullName.Replace($projectPath, ''))" -ForegroundColor Gray 
    }
} else {
    Write-Host "  ✓ No disabled components" -ForegroundColor Green
}

# 8. Search for function calls
Write-Host ""
Write-Host "[8/10] Searching for SMS/Email function calls..." -ForegroundColor Yellow
$functionCalls = @()
foreach ($file in $componentFiles) {
    $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
    if ($content -match "(sendEmail|sendSms|sendDocument|sendEstimate|sendInvoice)\s*\(") {
        $functionCalls += $file.FullName.Replace($projectPath, "")
    }
}
if ($functionCalls.Count -gt 0) {
    Write-Host "  Files with SMS/Email function calls:" -ForegroundColor Yellow
    $functionCalls | ForEach-Object { Write-Host "     $_" -ForegroundColor Yellow }
} else {
    Write-Host "  ✓ No SMS/Email function calls found" -ForegroundColor Green
}

# 9. Check types directory
Write-Host ""
Write-Host "[9/10] Checking types directory..." -ForegroundColor Yellow
$typeFiles = Get-ChildItem "$projectPath\src\types" -Filter "*.ts" -ErrorAction SilentlyContinue
if ($typeFiles) {
    Write-Host "  Type files found:" -ForegroundColor Cyan
    $typeFiles | ForEach-Object { Write-Host "     - $($_.Name)" -ForegroundColor Gray }
}

# 10. Final statistics
Write-Host ""
Write-Host "[10/10] Summary:" -ForegroundColor Yellow
$edgeFuncCount = if (Test-Path "$projectPath\supabase\functions") { 
    (Get-ChildItem "$projectPath\supabase\functions" -Directory -ErrorAction SilentlyContinue).Count 
} else { 0 }
$migrationCount = if (Test-Path "$projectPath\supabase\migrations") { 
    (Get-ChildItem "$projectPath\supabase\migrations" -Filter "*.sql" -ErrorAction SilentlyContinue).Count 
} else { 0 }

Write-Host "  - Edge functions remaining: $edgeFuncCount" -ForegroundColor Gray
Write-Host "  - Migration files remaining: $migrationCount" -ForegroundColor Gray
Write-Host "  - Disabled components: $($disabledComponents.Count)" -ForegroundColor Gray

Write-Host ""
Write-Host "=== DEEP ANALYSIS COMPLETE ===" -ForegroundColor Cyan

# PowerShell backup script
$source = "C:\Users\petru\Downloads\TEST FIX SITE\3\Fixlify-Main-main"
$backupDir = "C:\Users\petru\Downloads\TEST FIX SITE\3\Fixlify-Main-main\backup_2025_07_08"
$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"

Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "Creating Complete Project Backup" -ForegroundColor Cyan
Write-Host "Date: $timestamp" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""

# Create subdirectories
$dirs = @("src", "supabase", "public", "scripts", "docs", "test-workflow", "console_scripts", "fix_send_issue")
foreach ($dir in $dirs) {
    New-Item -ItemType Directory -Path "$backupDir\$dir" -Force | Out-Null
}

Write-Host "[1/8] Backing up source code..." -NoNewline
Copy-Item -Path "$source\src\*" -Destination "$backupDir\src\" -Recurse -Force
Write-Host " Done!" -ForegroundColor Green

Write-Host "[2/8] Backing up Supabase files..." -NoNewline
Copy-Item -Path "$source\supabase\*" -Destination "$backupDir\supabase\" -Recurse -Force
Write-Host " Done!" -ForegroundColor Green

Write-Host "[3/8] Backing up public assets..." -NoNewline
Copy-Item -Path "$source\public\*" -Destination "$backupDir\public\" -Recurse -Force -ErrorAction SilentlyContinue
Write-Host " Done!" -ForegroundColor Green

Write-Host "[4/8] Backing up scripts..." -NoNewline
Copy-Item -Path "$source\scripts\*" -Destination "$backupDir\scripts\" -Recurse -Force -ErrorAction SilentlyContinue
Copy-Item -Path "$source\console_scripts\*" -Destination "$backupDir\console_scripts\" -Recurse -Force -ErrorAction SilentlyContinue
Copy-Item -Path "$source\test-workflow\*" -Destination "$backupDir\test-workflow\" -Recurse -Force -ErrorAction SilentlyContinue
Copy-Item -Path "$source\fix_send_issue\*" -Destination "$backupDir\fix_send_issue\" -Recurse -Force -ErrorAction SilentlyContinue
Write-Host " Done!" -ForegroundColor Green

Write-Host "[5/8] Backing up documentation..." -NoNewline
Copy-Item -Path "$source\docs\*" -Destination "$backupDir\docs\" -Recurse -Force -ErrorAction SilentlyContinue
Copy-Item -Path "$source\*.md" -Destination "$backupDir\" -Force -ErrorAction SilentlyContinue
Write-Host " Done!" -ForegroundColor Green

Write-Host "[6/8] Backing up configuration files..." -NoNewline
$configFiles = @(
    "package.json", "package-lock.json", "tsconfig.json", "tsconfig.app.json", 
    "tsconfig.node.json", "vite.config.ts", "postcss.config.js", 
    "tailwind.config.ts", "eslint.config.js", "components.json", 
    "index.html", ".gitignore"
)
foreach ($file in $configFiles) {
    if (Test-Path "$source\$file") {
        Copy-Item -Path "$source\$file" -Destination "$backupDir\" -Force
    }
}
Write-Host " Done!" -ForegroundColor Green

Write-Host "[7/8] Backing up environment examples..." -NoNewline
$envFiles = @(".env.example", ".env.local.example", ".env.automation.example")
foreach ($file in $envFiles) {
    if (Test-Path "$source\$file") {
        Copy-Item -Path "$source\$file" -Destination "$backupDir\" -Force
    }
}
Write-Host " Done!" -ForegroundColor Green

Write-Host "[8/8] Backing up utility scripts..." -NoNewline
Copy-Item -Path "$source\*.bat" -Destination "$backupDir\" -Force -ErrorAction SilentlyContinue
Copy-Item -Path "$source\*.sh" -Destination "$backupDir\" -Force -ErrorAction SilentlyContinue
Copy-Item -Path "$source\*.js" -Destination "$backupDir\" -Force -ErrorAction SilentlyContinue
Write-Host " Done!" -ForegroundColor Green

# Create backup info file
$backupInfo = @"
Backup created on: $timestamp
Source: $source

Included:
- All source code (src/)
- Supabase configuration and functions
- Public assets
- Scripts and utilities
- Documentation
- Configuration files

NOT included (for security):
- node_modules/
- .env files with secrets
- dist/ build files
- .git/ repository
"@

$backupInfo | Out-File -FilePath "$backupDir\BACKUP_INFO.txt" -Encoding UTF8

Write-Host ""
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "Backup Complete!" -ForegroundColor Green
Write-Host "Location: $backupDir" -ForegroundColor Yellow
Write-Host "===========================================" -ForegroundColor Cyan

# Create ZIP archive of the backup
$backupDir = "C:\Users\petru\Downloads\TEST FIX SITE\3\Fixlify-Main-main\backup_2025_07_08"
$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$zipFile = "C:\Users\petru\Downloads\TEST FIX SITE\3\Fixlify-Main-main\backup_2025_07_08_$timestamp.zip"

Write-Host "Creating ZIP archive..." -ForegroundColor Yellow

# Create the zip file
Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::CreateFromDirectory($backupDir, $zipFile)

Write-Host "ZIP archive created: $zipFile" -ForegroundColor Green

# Get file size
$size = (Get-Item $zipFile).Length / 1MB
Write-Host "Archive size: $([math]::Round($size, 2)) MB" -ForegroundColor Cyan

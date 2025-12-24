# Archive all existing migrations
$migrationsPath = "c:\Fixlify MAIN WEB\supabase\migrations"
$archivePath = "$migrationsPath\_archive"

# Ensure archive folder exists
if (!(Test-Path $archivePath)) {
    New-Item -ItemType Directory -Path $archivePath -Force | Out-Null
}

# Move all SQL files to archive
$sqlFiles = Get-ChildItem -Path $migrationsPath -Filter "*.sql" -File
$movedCount = 0
foreach ($file in $sqlFiles) {
    Move-Item -Path $file.FullName -Destination $archivePath -Force
    $movedCount++
}
Write-Output "Moved $movedCount SQL files to _archive"

# Move any subdirectories to archive (except _archive itself)
$subDirs = Get-ChildItem -Path $migrationsPath -Directory | Where-Object { $_.Name -ne "_archive" }
foreach ($dir in $subDirs) {
    Move-Item -Path $dir.FullName -Destination $archivePath -Force
    Write-Output "Moved directory: $($dir.Name)"
}

Write-Output "Archive complete!"

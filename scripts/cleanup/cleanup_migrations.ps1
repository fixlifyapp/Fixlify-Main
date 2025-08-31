# Clean up SMS/Email related migrations
Write-Host "=== CLEANING UP MIGRATIONS ===" -ForegroundColor Yellow

$projectPath = "C:\Users\petru\Downloads\TEST FIX SITE\3\Fixlify-Main-main"
$migrationsPath = Join-Path $projectPath "supabase\migrations"

# Find and remove SMS/Email related migrations
$migrationsToRemove = Get-ChildItem $migrationsPath -Filter "*.sql" | Where-Object {
    $content = Get-Content $_.FullName -Raw
    $_.Name -match "(sms|email|mail|telnyx|communication|message)" -or
    $content -match "(sms_logs|email_logs|communication_logs|mailgun|telnyx)"
}

Write-Host "Found $($migrationsToRemove.Count) SMS/Email related migrations to remove:" -ForegroundColor Cyan

foreach ($migration in $migrationsToRemove) {
    Write-Host "  - $($migration.Name)" -ForegroundColor Gray
    Remove-Item $migration.FullName -Force
}

Write-Host ""
Write-Host "=== MIGRATIONS CLEANUP COMPLETE ===" -ForegroundColor Green

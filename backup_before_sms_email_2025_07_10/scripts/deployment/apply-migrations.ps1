# PowerShell script to apply Supabase migrations
Set-Location "C:\Users\petru\Downloads\TEST FIX SITE\3\Fixlify-Main-main"

Write-Host "Applying database migrations..." -ForegroundColor Green

# Apply the communication logs migration
Write-Host "Applying communication_logs migration..." -ForegroundColor Yellow
npx supabase db push --file "supabase\migrations\20240125_communication_logs.sql"

Write-Host "`nDatabase migrations applied!" -ForegroundColor Green

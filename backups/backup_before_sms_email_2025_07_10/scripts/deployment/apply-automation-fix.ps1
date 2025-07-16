#!/usr/bin/env pwsh

Write-Host "Applying automation fix migration..." -ForegroundColor Green

# Apply the migration using Supabase CLI
npx supabase migration new fix_automation_relationships

# Copy the migration content
$migrationPath = Get-ChildItem -Path "supabase/migrations" -Filter "*fix_automation_relationships.sql" | Select-Object -Last 1

if ($migrationPath) {
    Copy-Item "supabase/migrations/20250125_fix_automation_relationships.sql" $migrationPath.FullName -Force
    Write-Host "Migration file created: $($migrationPath.Name)" -ForegroundColor Yellow
    
    # Apply migrations
    Write-Host "Applying migrations to local database..." -ForegroundColor Green
    npx supabase db reset
    
    Write-Host "Migration applied successfully!" -ForegroundColor Green
    Write-Host "To apply to remote database, run: npx supabase db push" -ForegroundColor Yellow
} else {
    Write-Host "Failed to create migration file" -ForegroundColor Red
} 
# Supabase Full Backup Script for Windows
# This script will backup all Supabase resources locally

Write-Host "=== Supabase Full Backup Script ===" -ForegroundColor Cyan
Write-Host "This will backup:"
Write-Host "- Database schema and data"
Write-Host "- Edge Functions"
Write-Host "- Storage buckets documentation"
Write-Host "- Auth configuration"
Write-Host "- Database settings"
Write-Host ""

# Set project ref
$PROJECT_REF = "mqppvcrlvsgrsqelglod"
$BACKUP_DIR = ".\supabase-backup"

# Create backup directories
$directories = @(
    "$BACKUP_DIR\database",
    "$BACKUP_DIR\functions",
    "$BACKUP_DIR\storage",
    "$BACKUP_DIR\auth",
    "$BACKUP_DIR\config",
    "$BACKUP_DIR\migrations"
)

foreach ($dir in $directories) {
    New-Item -ItemType Directory -Force -Path $dir | Out-Null
}

Write-Host "Starting backup process..." -ForegroundColor Green
# 1. Database Schema and Data
Write-Host ""
Write-Host "1. Backing up database..." -ForegroundColor Yellow
Write-Host "Creating database dump..."
supabase db dump --project-ref $PROJECT_REF | Out-File "$BACKUP_DIR\database\schema.sql" -Encoding UTF8
Write-Host "✅ Database schema saved to $BACKUP_DIR\database\schema.sql" -ForegroundColor Green

# Also try to dump data
Write-Host "Attempting to dump data..."
supabase db dump --project-ref $PROJECT_REF --data-only | Out-File "$BACKUP_DIR\database\data.sql" -Encoding UTF8

# 2. Copy local migrations
Write-Host ""
Write-Host "2. Copying local migrations..." -ForegroundColor Yellow
if (Test-Path ".\supabase\migrations") {
    Copy-Item -Path ".\supabase\migrations\*" -Destination "$BACKUP_DIR\migrations" -Recurse -Force
    Write-Host "✅ Migrations copied" -ForegroundColor Green
}

# 3. Edge Functions
Write-Host ""
Write-Host "3. Backing up Edge Functions..." -ForegroundColor Yellow
$functions = @(
    "send-sms",
    "mailgun-email",
    "mailgun-webhook",
    "sms-webhook",
    "send-estimate",
    "send-estimate-sms",
    "send-invoice",
    "send-invoice-sms",
    "telnyx-sms",
    "telnyx-webhook",
    "phone-number-marketplace"
)
# Copy local edge functions
if (Test-Path ".\supabase\functions") {
    Get-ChildItem ".\supabase\functions" -Directory | ForEach-Object {
        $funcName = $_.Name
        Write-Host "Copying function: $funcName"
        Copy-Item -Path $_.FullName -Destination "$BACKUP_DIR\functions\$funcName" -Recurse -Force
    }
}

# Document deployed functions
foreach ($func in $functions) {
    $funcDir = "$BACKUP_DIR\functions\$func"
    if (-not (Test-Path $funcDir)) {
        New-Item -ItemType Directory -Force -Path $funcDir | Out-Null
    }
    
    @"
Function: $func
URL: https://$PROJECT_REF.supabase.co/functions/v1/$func
Status: Deployed
"@ | Out-File "$funcDir\info.txt" -Encoding UTF8
}
Write-Host "✅ Edge Functions backed up" -ForegroundColor Green

# 4. Storage Buckets Documentation
Write-Host ""
Write-Host "4. Documenting Storage buckets..." -ForegroundColor Yellow
@"
# Storage Buckets Configuration

To backup storage buckets, use the Supabase Dashboard:
1. Go to https://supabase.com/dashboard/project/$PROJECT_REF/storage/buckets
2. For each bucket, download the files manually
3. Note the bucket policies and settings

Common buckets:
- avatars
- documents  
- attachments
- job-attachments
- estimates
- invoices
"@ | Out-File "$BACKUP_DIR\storage\buckets.md" -Encoding UTF8
Write-Host "✅ Storage documentation created" -ForegroundColor Green
# 5. Auth Configuration
Write-Host ""
Write-Host "5. Documenting Auth settings..." -ForegroundColor Yellow
@"
# Auth Configuration

To backup auth settings:
1. Go to https://supabase.com/dashboard/project/$PROJECT_REF/auth/users
2. Export users if needed (Auth -> Users -> Export users)
3. Document auth providers settings
4. Save email templates

Key settings to document:
- Auth providers (email, phone, social logins)
- Email templates
- SMS settings (Telnyx integration)
- Auth policies
- JWT expiry settings
"@ | Out-File "$BACKUP_DIR\auth\auth-config.md" -Encoding UTF8
Write-Host "✅ Auth documentation created" -ForegroundColor Green

# 6. Environment Variables
Write-Host ""
Write-Host "6. Documenting required environment variables..." -ForegroundColor Yellow
@"
# Required Environment Variables

## Edge Function Secrets (get from https://supabase.com/dashboard/project/$PROJECT_REF/functions/secrets)
- TELNYX_API_KEY
- TELNYX_MESSAGING_PROFILE_ID
- MAILGUN_API_KEY
- MAILGUN_DOMAIN
- MAILGUN_FROM_EMAIL
- OPENAI_API_KEY (if using AI features)
- RESEND_API_KEY (if still using Resend)
- AMAZON_CONNECT_INSTANCE_ID (if using Amazon Connect)
- AWS_REGION

## Supabase Configuration (get from https://supabase.com/dashboard/project/$PROJECT_REF/settings/api)
- SUPABASE_URL: https://$PROJECT_REF.supabase.co
- SUPABASE_ANON_KEY: (get from dashboard)
- SUPABASE_SERVICE_ROLE_KEY: (get from dashboard)

## Other Services
- PUBLIC_SITE_URL: https://app.fixlify.com
"@ | Out-File "$BACKUP_DIR\config\env-variables.md" -Encoding UTF8
Write-Host "✅ Environment variables documented" -ForegroundColor Green
# 7. Create restoration guide
Write-Host ""
Write-Host "7. Creating restoration guide..." -ForegroundColor Yellow
@"
# Supabase Restoration Guide

## Prerequisites
- Supabase CLI installed
- New Supabase project created (or using existing)
- PostgreSQL client (psql) installed

## Restoration Steps

### 1. Database
```bash
# First, reset the database
supabase db reset

# Restore database schema
psql -h db.[PROJECT-REF].supabase.co -U postgres -d postgres -f ./database/schema.sql

# Restore data (if available)
psql -h db.[PROJECT-REF].supabase.co -U postgres -d postgres -f ./database/data.sql

# Or use Supabase CLI
supabase db push --project-ref [PROJECT-REF]
```

### 2. Edge Functions
For each function in the functions directory:
```bash
cd supabase/functions/[function-name]
supabase functions deploy [function-name] --project-ref [PROJECT-REF]
```

Or deploy all at once:
```bash
supabase functions deploy --project-ref [PROJECT-REF]
```

### 3. Environment Variables
Add all secrets from config/env-variables.md to:
https://supabase.com/dashboard/project/[PROJECT-REF]/functions/secrets

### 4. Storage
- Recreate buckets as documented
- Upload files to respective buckets
- Set bucket policies (public/private)
- Configure CORS if needed

### 5. Auth Configuration
- Configure auth providers as documented
- Set up email templates
- Configure SMS settings with Telnyx
- Set JWT expiry times
- Configure redirect URLs

### 6. Database Roles and Permissions
- Review and set up RLS policies
- Configure database roles
- Set up database functions and triggers
"@ | Out-File "$BACKUP_DIR\RESTORE_GUIDE.md" -Encoding UTF8
Write-Host "✅ Restoration guide created" -ForegroundColor Green
# 8. Export current project configuration
Write-Host ""
Write-Host "8. Exporting project configuration..." -ForegroundColor Yellow
if (Test-Path ".\supabase\config.toml") {
    Copy-Item -Path ".\supabase\config.toml" -Destination "$BACKUP_DIR\config\" -Force
    Write-Host "✅ Project config exported" -ForegroundColor Green
}

# Summary
Write-Host ""
Write-Host "=== Backup Summary ===" -ForegroundColor Cyan
Write-Host "Backup created in: $BACKUP_DIR" -ForegroundColor Green
Write-Host ""
Write-Host "⚠️  Important manual steps:" -ForegroundColor Yellow
Write-Host "1. Go to Edge Functions secrets and copy all API keys"
Write-Host "   https://supabase.com/dashboard/project/$PROJECT_REF/functions/secrets"
Write-Host ""
Write-Host "2. Export database data if needed:"
Write-Host "   - Use Supabase Dashboard -> Database -> Backups"
Write-Host "   - Or use: pg_dump for complete data export"
Write-Host ""
Write-Host "3. Download storage files:"
Write-Host "   https://supabase.com/dashboard/project/$PROJECT_REF/storage/buckets"
Write-Host ""
Write-Host "4. Export auth users:"
Write-Host "   https://supabase.com/dashboard/project/$PROJECT_REF/auth/users"
Write-Host ""
Write-Host "✅ Backup documentation complete!" -ForegroundColor Green
Write-Host "Check $BACKUP_DIR for all backup files" -ForegroundColor Cyan
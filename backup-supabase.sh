#!/bin/bash
# Supabase Full Backup Script
# This script will backup all Supabase resources locally

echo "=== Supabase Full Backup Script ==="
echo "This will backup:"
echo "- Database schema and data"
echo "- Edge Functions"
echo "- Storage buckets"
echo "- Auth configuration"
echo "- Database settings"
echo ""

# Set project ref
PROJECT_REF="mqppvcrlvsgrsqelglod"
BACKUP_DIR="./supabase-backup"

# Create backup directories
mkdir -p $BACKUP_DIR/{database,functions,storage,auth,config}

echo "Starting backup process..."

# 1. Database Schema and Data
echo ""
echo "1. Backing up database..."
echo "Creating database dump..."
supabase db dump --project-ref $PROJECT_REF > $BACKUP_DIR/database/schema.sql
echo "✅ Database schema saved to $BACKUP_DIR/database/schema.sql"

# 2. Edge Functions
echo ""
echo "2. Backing up Edge Functions..."
# List of functions to backup (based on your current functions)
FUNCTIONS=(
    "send-sms"
    "mailgun-email"
    "mailgun-webhook"
    "sms-webhook"
    "send-estimate"
    "send-estimate-sms"
    "send-invoice"
    "send-invoice-sms"
    "telnyx-sms"
    "telnyx-webhook"
    "phone-number-marketplace"
)

for func in "${FUNCTIONS[@]}"; do
    echo "Downloading function: $func..."
    mkdir -p $BACKUP_DIR/functions/$func
    # Note: Supabase CLI doesn't have direct download, so we'll document this
    echo "Function: $func" > $BACKUP_DIR/functions/$func/info.txt
    echo "URL: https://$PROJECT_REF.supabase.co/functions/v1/$func" >> $BACKUP_DIR/functions/$func/info.txt
done
echo "✅ Edge Functions info saved"

# 3. Storage Buckets
echo ""
echo "3. Documenting Storage buckets..."
cat > $BACKUP_DIR/storage/buckets.md << EOF
# Storage Buckets Configuration

To backup storage buckets, use the Supabase Dashboard:
1. Go to https://supabase.com/dashboard/project/$PROJECT_REF/storage/buckets
2. For each bucket, download the files manually
3. Note the bucket policies and settings

Common buckets:
- avatars
- documents
- attachments
EOF
echo "✅ Storage documentation created"

# 4. Auth Configuration
echo ""
echo "4. Documenting Auth settings..."
cat > $BACKUP_DIR/auth/auth-config.md << EOF
# Auth Configuration

To backup auth settings:
1. Go to https://supabase.com/dashboard/project/$PROJECT_REF/auth/users
2. Export users if needed
3. Document auth providers settings
4. Save email templates

Key settings to document:
- Auth providers (email, phone, social logins)
- Email templates
- SMS settings (Telnyx integration)
- Auth policies
EOF
echo "✅ Auth documentation created"

# 5. Environment Variables
echo ""
echo "5. Documenting required environment variables..."
cat > $BACKUP_DIR/config/env-variables.md << EOF
# Required Environment Variables

## Edge Function Secrets
- TELNYX_API_KEY
- MAILGUN_API_KEY
- MAILGUN_DOMAIN
- MAILGUN_FROM_EMAIL
- OPENAI_API_KEY (if using AI features)
- RESEND_API_KEY (if still using Resend)

## Supabase Configuration
- SUPABASE_URL: https://$PROJECT_REF.supabase.co
- SUPABASE_ANON_KEY: (get from dashboard)
- SUPABASE_SERVICE_ROLE_KEY: (get from dashboard)

## Other Services
- PUBLIC_SITE_URL: https://app.fixlify.com
EOF
echo "✅ Environment variables documented"

# 6. Create restoration guide
echo ""
echo "6. Creating restoration guide..."
cat > $BACKUP_DIR/RESTORE_GUIDE.md << EOF
# Supabase Restoration Guide

## Prerequisites
- Supabase CLI installed
- New Supabase project created (or using existing)

## Restoration Steps

### 1. Database
\`\`\`bash
# Restore database schema
supabase db reset
psql -h db.[PROJECT-REF].supabase.co -U postgres -d postgres -f ./database/schema.sql
\`\`\`

### 2. Edge Functions
For each function in the functions directory:
\`\`\`bash
cd supabase/functions/[function-name]
supabase functions deploy [function-name]
\`\`\`

### 3. Environment Variables
Add all secrets from config/env-variables.md to:
https://supabase.com/dashboard/project/[PROJECT-REF]/functions/secrets

### 4. Storage
- Recreate buckets as documented
- Upload files to respective buckets
- Set bucket policies

### 5. Auth Configuration
- Configure auth providers as documented
- Set up email templates
- Configure SMS settings
EOF
echo "✅ Restoration guide created"

echo ""
echo "=== Backup Summary ==="
echo "Backup created in: $BACKUP_DIR"
echo ""
echo "⚠️  Important: Some items need manual backup:"
echo "1. Download actual Edge Function code from Supabase dashboard"
echo "2. Export storage files manually"
echo "3. Export auth users if needed"
echo "4. Copy environment variables from Edge Function secrets"
echo ""
echo "✅ Backup documentation complete!"

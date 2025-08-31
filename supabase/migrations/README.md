# 📊 Supabase SQL Migrations & Scripts

> Organized SQL files for database migrations, functions, and maintenance

## 📁 Directory Structure

All SQL files are organized by their purpose and module context:

```
supabase/migrations/
├── automation/          # Workflow automation tables and functions
├── sms-email/          # SMS/Email communication system
├── phone-system/       # Phone number management
├── security/           # RLS policies and access control
├── functions/          # Database functions and triggers
├── products/           # Product-related migrations
├── profiles/           # User profile migrations
├── fixes/              # Bug fixes and patches
├── cleanup/            # Cleanup and removal scripts
└── verification/       # Schema verification scripts
```

## 🗂️ Module Organization

### ⚙️ Automation (`/automation/`)
Workflow automation system database components
- `create_automations.sql` - Main automation tables
- `create_automation_tracker.sql` - Execution tracking
- `fix_automation_deduplication.sql` - Deduplication logic
- `fix_duplicate_automations.sql` - Fix duplicate issues
- `fix-automation-spam.sql` - Spam prevention

### 📱 SMS/Email (`/sms-email/`)
Communication system schema
- `DEPLOY_SMS_EMAIL_SCHEMA_COMPLETE.sql` - Complete SMS/Email schema

### ☎️ Phone System (`/phone-system/`)
Phone number management and configuration
- `add_phone_number.sql` - Add phone numbers
- `add_phone_number_direct.sql` - Direct phone addition
- `assign-phone-direct.sql` - Phone assignment
- `check-all-phones.sql` - Phone verification
- `check-phone-numbers.sql` - Phone number checks
- `check-telnyx-numbers.sql` - Telnyx integration checks
- `create-phone-fixed.sql` - Phone creation fixes
- `create-phone-simple.sql` - Simple phone creation
- `initialize-phone-system.sql` - System initialization
- `phone-setup-steps.sql` - Setup procedures

### 🔒 Security (`/security/`)
RLS policies and access control
- `fix_rls_policies.sql` - RLS policy fixes
- `check-rls-policies.sql` - RLS verification
- `portal_access_demo.sql` - Portal access demo
- `debug-portal-access.sql` - Access debugging

### 🔧 Functions (`/functions/`)
Database functions and utilities
- `create-id-functions.sql` - ID generation functions
- `update-id-function.sql` - ID function updates

### 📦 Products (`/products/`)
Product-related database changes
- `fix-products-complete.sql` - Complete product fixes

### 👤 Profiles (`/profiles/`)
User profile management
- `fix_all_profiles.sql` - Profile fixes

### 🔨 Fixes (`/fixes/`)
Bug fixes and patches
- `fix_jobs_client_loading.sql` - Job loading fixes
- `fix_jobs_timeout.sql` - Timeout fixes

### 🧹 Cleanup (`/cleanup/`)
Database cleanup scripts
- `cleanup_sms_email_database.sql` - SMS/Email cleanup
- `drop_all_sms_email_tables.sql` - Complete table removal

### ✅ Verification (`/verification/`)
Schema verification and checks
- `verify_sms_email_schema.sql` - SMS/Email verification

## 📝 Scripts Organization

Additional SQL scripts are organized in:

```
scripts/sql/
├── checks/             # Database verification scripts
├── setup/              # Initial setup scripts
├── production/         # Production checks
└── fixes/             # Quick fixes
```

### Checks (`scripts/sql/checks/`)
- `check_automation_issues.sql` - Automation diagnostics
- `check_existing_tables.sql` - Table existence checks
- `check_sms_tables.sql` - SMS table verification
- `check_tables_exist.sql` - General table checks

### Setup (`scripts/sql/setup/`)
- `disable-jwt.sql` - JWT configuration

### Production (`scripts/sql/production/`)
- `production-checks.sql` - Production environment verification

## 🚀 Migration Workflow

### 1. Development
```bash
# Create new migration
supabase migration new feature_name

# Edit the migration file
vim supabase/migrations/[timestamp]_feature_name.sql
```

### 2. Testing
```bash
# Apply migrations locally
supabase db reset

# Run specific migration
psql -f supabase/migrations/module/migration.sql
```

### 3. Production
```bash
# Push to production
supabase db push

# Or apply directly in SQL editor
# Copy contents to Supabase Dashboard SQL Editor
```

## 📋 Migration Best Practices

### Naming Convention
```
[module]/[action]_[target]_[optional_detail].sql

Examples:
- automation/create_automations.sql
- security/fix_rls_policies.sql
- phone-system/add_phone_number.sql
```

### File Structure
```sql
-- ============================================
-- [DESCRIPTION OF MIGRATION]
-- Module: [module name]
-- Date: [creation date]
-- ============================================

-- Add your SQL here
BEGIN;

-- Migration logic

COMMIT;
```

### Safety Guidelines
1. **Always use transactions** for data modifications
2. **Check existence** before creating (`IF NOT EXISTS`)
3. **Include rollback** scripts for complex migrations
4. **Test locally** before production deployment
5. **Document changes** with clear comments

## 🔄 Common Operations

### Run All Migrations
```bash
# In order
for file in supabase/migrations/*/*.sql; do
  echo "Running: $file"
  psql -f "$file"
done
```

### Verify Schema
```bash
# Run verification scripts
psql -f supabase/migrations/verification/verify_sms_email_schema.sql
```

### Cleanup
```bash
# Run cleanup if needed
psql -f supabase/migrations/cleanup/cleanup_sms_email_database.sql
```

## 📊 Migration Status

### Core Modules
- ✅ Automation system
- ✅ SMS/Email system
- ✅ Phone system
- ✅ Security (RLS)
- ✅ Functions

### Recent Migrations
- Phone system initialization
- Automation deduplication
- SMS/Email schema deployment
- RLS policy fixes
- Product fixes

## 🐛 Troubleshooting

### Common Issues

#### Migration Fails
```sql
-- Check current schema
SELECT * FROM information_schema.tables 
WHERE table_schema = 'public';

-- Check for conflicts
SELECT * FROM pg_locks;
```

#### RLS Issues
```sql
-- Verify RLS policies
SELECT * FROM pg_policies 
WHERE tablename = 'your_table';
```

#### Function Conflicts
```sql
-- List existing functions
SELECT proname, prosrc 
FROM pg_proc 
WHERE pronamespace = 'public'::regnamespace;
```

## 📝 Documentation

Each migration should include:
1. Purpose description
2. Module identification
3. Date created
4. Dependencies noted
5. Rollback procedure (if applicable)

---

*Last Updated: Current*
*Total SQL Files: 50+*
*Modules: 10*
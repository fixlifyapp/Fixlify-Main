# Supabase Backup Instructions

## Quick Start

### Method 1: Using Supabase Dashboard (Easiest)
1. Go to: https://supabase.com/dashboard/project/mqppvcrlvsgrsqelglod/database/backups
2. Click "Download backup" to get the latest backup
3. Save the downloaded file in `supabase-backup/database/`

### Method 2: Using pg_dump (Recommended for Complete Backup)

#### Prerequisites
- Install PostgreSQL tools (includes pg_dump): https://www.postgresql.org/download/
- Get your database password from: https://supabase.com/dashboard/project/mqppvcrlvsgrsqelglod/settings/database

#### Windows Users
1. Edit `backup.bat` and replace `YOUR-PASSWORD-HERE` with your actual database password
2. Open Command Prompt as Administrator
3. Navigate to project directory: `cd C:\Users\petru\Downloads\TEST FIX SITE\3\Fixlify-Main-main`
4. Run: `supabase-backup\backup.bat`

#### Mac/Linux Users
1. Edit `backup.sh` and replace `[YOUR-PASSWORD]` with your actual database password
2. Make script executable: `chmod +x supabase-backup/backup.sh`
3. Run: `./supabase-backup/backup.sh`

### Method 3: Manual SQL Export (For Specific Tables)

1. Go to SQL Editor: https://supabase.com/dashboard/project/mqppvcrlvsgrsqelglod/sql
2. Run this query to export data as JSON:
```sql
-- Export profiles table as JSON
SELECT json_agg(row_to_json(t)) FROM profiles t;
-- Export clients table as JSON
SELECT json_agg(row_to_json(t)) FROM clients t;

-- Export jobs table as JSON
SELECT json_agg(row_to_json(t)) FROM jobs t;
```

3. Copy the results and save them as `.json` files in `supabase-backup/database/tables/`

## What Gets Backed Up

### Database
- All table schemas
- All data from tables
- RLS (Row Level Security) policies
- Functions and triggers
- Indexes and constraints

### Edge Functions (Already Backed Up)
✅ All functions from `supabase/functions` are copied to `supabase-backup/functions`

### Migrations (Already Backed Up)
✅ All migrations from `supabase/migrations` are copied to `supabase-backup/migrations`

### Storage Files (Manual Backup Required)
1. Go to: https://supabase.com/dashboard/project/mqppvcrlvsgrsqelglod/storage/buckets
2. Download files from each bucket manually
3. Save them in `supabase-backup/storage/[bucket-name]/`

### API Keys and Secrets (Manual Backup Required)
1. Go to: https://supabase.com/dashboard/project/mqppvcrlvsgrsqelglod/functions/secrets
2. Copy all secret values:   - TELNYX_API_KEY
   - TELNYX_MESSAGING_PROFILE_ID
   - MAILGUN_API_KEY
   - MAILGUN_DOMAIN
   - Other API keys

3. Save them in a secure location (NOT in Git repository)

## Backup Schedule Recommendations

- **Daily**: Database backup (automated via Supabase)
- **Weekly**: Full backup including storage files
- **Before Major Changes**: Complete backup of everything
- **After Adding Features**: Backup migrations and edge functions

## Restore Instructions

### Restoring to a New Supabase Project

1. Create new Supabase project
2. Run migrations:
   ```bash
   supabase db push
   ```
3. Restore database:
   ```bash
   psql [NEW_DATABASE_URL] < supabase-backup/database/full_backup_[TIMESTAMP].sql
   ```
4. Deploy edge functions:
   ```bash
   supabase functions deploy
   ```
5. Set secret keys in new project
6. Upload storage files manually

## Important Files Created

- `backup.bat` - Windows backup script
- `backup.sh` - Mac/Linux backup script- `export-commands.sql` - SQL commands for manual export
- `database/tables/` - Directory for table exports
- `RESTORE_GUIDE.md` - Detailed restoration instructions

## Security Notes

⚠️ **NEVER commit database passwords or API keys to Git**
⚠️ **Store backups in a secure location**
⚠️ **Encrypt sensitive backups before storing in cloud**

## Quick Checklist

- [ ] Database backup (schema + data)
- [ ] Edge functions (already done ✅)
- [ ] Migrations (already done ✅)
- [ ] Storage files
- [ ] API keys and secrets
- [ ] Test restore on a local Supabase instance

## Need Help?

- Supabase Docs: https://supabase.com/docs
- Database Backups: https://supabase.com/docs/guides/platform/backups
- Support: https://supabase.com/dashboard/support
# Supabase Restoration Guide

## Prerequisites
- Supabase CLI installed
- New Supabase project created (or using existing)
- PostgreSQL client (psql) installed

## Restoration Steps

### 1. Database
`ash
# First, reset the database
supabase db reset

# Restore database schema
psql -h db.[PROJECT-REF].supabase.co -U postgres -d postgres -f ./database/schema.sql

# Restore data (if available)
psql -h db.[PROJECT-REF].supabase.co -U postgres -d postgres -f ./database/data.sql

# Or use Supabase CLI
supabase db push --project-ref [PROJECT-REF]
`

### 2. Edge Functions
For each function in the functions directory:
`ash
cd supabase/functions/[function-name]
supabase functions deploy [function-name] --project-ref [PROJECT-REF]
`

Or deploy all at once:
`ash
supabase functions deploy --project-ref [PROJECT-REF]
`

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

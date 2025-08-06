# Claude Code CLI - Supabase Integration Guide

## HOW CLAUDE CODE WORKS WITH SUPABASE

Claude Code CLI connects to Supabase through:
1. **Supabase CLI** (already installed on your system)
2. **Direct file manipulation** (migrations, functions)
3. **Bash commands** for deployment

## AVAILABLE TOOLS IN CLAUDE CODE

### 1. Bash Tool
- Executes Supabase CLI commands
- Runs deployment scripts
- Manages database operations

### 2. File Tools (Read/Write/Edit)
- Creates migration files
- Writes Edge Functions
- Updates configuration

### 3. Search Tools (Grep/Glob)
- Finds existing database structures
- Searches for table references
- Locates Edge Functions

## COMMAND TRIGGERS FOR CLAUDE CODE

### "checksupabase"
When you say this, Claude Code will:
```bash
# 1. Check project status
supabase status

# 2. List pending migrations
ls supabase/migrations/

# 3. Show database differences
supabase db diff

# 4. Deploy if needed (with confirmation)
supabase db push --dry-run
```

### "deploy to supabase"
Claude Code will:
```bash
# 1. Create necessary migration files
# 2. Deploy database changes
supabase db push

# 3. Deploy Edge Functions
supabase functions deploy

# 4. Verify deployment
supabase status
```

### "create supabase table [name]"
Claude Code will:
1. Create migration file: `supabase/migrations/[timestamp]_create_[name]_table.sql`
2. Write CREATE TABLE statement with RLS
3. Deploy with `supabase db push`

### "create supabase function [name]"
Claude Code will:
1. Create function folder: `supabase/functions/[name]/`
2. Write index.ts with Deno code
3. Deploy with `supabase functions deploy [name]`

### "add supabase trigger [name]"
Claude Code will:
1. Create migration for trigger
2. Write trigger function
3. Deploy to database

## WORKFLOW EXAMPLES

### Example 1: Add a New Table
```bash
You: "Create supabase table user_settings"

Claude Code will:
1. Create: supabase/migrations/20250206_create_user_settings_table.sql
2. Write SQL with proper structure
3. Run: supabase db push
4. Confirm deployment
```

### Example 2: Add Database Hook
```bash
You: "Add supabase trigger for new user registration"

Claude Code will:
1. Create migration file
2. Write trigger function
3. Deploy to database
4. Test the trigger
```

### Example 3: Deploy Edge Function
```bash
You: "Create supabase function to send notifications"

Claude Code will:
1. Create: supabase/functions/send-notifications/index.ts
2. Write Deno function code
3. Run: supabase functions deploy send-notifications
4. Provide testing instructions
```

## DATABASE OPERATIONS

### Creating Tables
```sql
-- Claude Code will generate and deploy:
CREATE TABLE IF NOT EXISTS public.table_name (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    -- your columns
);

ALTER TABLE public.table_name ENABLE ROW LEVEL SECURITY;
```

### Adding Columns
```sql
-- Claude Code will create migration:
ALTER TABLE public.table_name 
ADD COLUMN column_name data_type;
```

### Creating Indexes
```sql
-- For performance optimization:
CREATE INDEX idx_name ON public.table_name(column);
```

## EDGE FUNCTION OPERATIONS

### Function Template
```typescript
// Claude Code will create in supabase/functions/[name]/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  // Function logic
  return new Response(JSON.stringify({ success: true }))
})
```

### Deployment
```bash
# Single function
supabase functions deploy function-name

# All functions
supabase functions deploy

# With secrets
supabase secrets set KEY=value
supabase functions deploy
```

## REAL-TIME OPERATIONS

### Enable Realtime
```sql
-- Claude Code will add to migration:
ALTER PUBLICATION supabase_realtime ADD TABLE public.table_name;
```

### Create Realtime Trigger
```sql
-- For broadcasting changes:
CREATE TRIGGER trigger_name
AFTER INSERT OR UPDATE OR DELETE ON public.table_name
FOR EACH ROW EXECUTE FUNCTION supabase_realtime.broadcast_changes();
```

## RLS POLICIES

### User-based Access
```sql
-- Claude Code will create policies:
CREATE POLICY "Users can view own data"
ON public.table_name FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own data"
ON public.table_name FOR UPDATE
USING (auth.uid() = user_id);
```

## SCHEDULED JOBS (pg_cron)

### Create Scheduled Job
```sql
-- Claude Code will create migration:
SELECT cron.schedule(
    'job-name',
    '0 0 * * *', -- Daily at midnight
    $$
    -- SQL to execute
    $$
);
```

## TESTING & VERIFICATION

### Local Testing
```bash
# Start local Supabase
supabase start

# Test changes
# Then deploy to production
supabase db push --linked
```

### Verify Deployment
```bash
# Check status
supabase status

# View logs
supabase db logs
supabase functions logs function-name
```

## ROLLBACK PROCEDURES

### Database Rollback
```bash
# Reset to previous state
supabase db reset --linked

# Fix migration issues
supabase migration repair
```

### Function Rollback
```bash
# Deploy previous version
git checkout previous-commit -- supabase/functions/name
supabase functions deploy name
```

## QUICK COMMANDS FOR COPY-PASTE

```bash
# Status check
supabase status

# Deploy database
supabase db push

# Deploy functions
supabase functions deploy

# View differences
supabase db diff

# List migrations
ls supabase/migrations/

# Check logs
supabase functions logs
supabase db logs

# Local development
supabase start
supabase stop
```

## IMPORTANT NOTES FOR CLAUDE CODE

1. **Always create migrations** - Never modify database directly
2. **Test with --dry-run** - Preview changes before deployment
3. **Use IF NOT EXISTS** - Prevent errors on re-deployment
4. **Enable RLS** - Security by default on new tables
5. **Document changes** - Add comments in migration files

## YOUR PROJECT SPECIFICS

- Project: Fix App (mqppvcrlvsgrsqelglod)
- URL: https://mqppvcrlvsgrsqelglod.supabase.co
- Supabase CLI: v2.30.4 (installed and configured)
- Working Directory: C:\Users\petru\Downloads\TEST FIX SITE\3\Fixlify-Main-main

Last Updated: 2025-08-06
Version: 1.0
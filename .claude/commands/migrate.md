# Database Migration Command

Create and manage Supabase database migrations.

## Instructions

1. **Determine action**:
   - `new <name>` - Create new migration
   - `diff <name>` - Generate migration from local changes
   - `push` - Apply migrations to remote
   - `reset` - Reset local database
   - `status` - Show migration status
   - `list` - List all migrations

2. **Create New Migration**:
   ```bash
   supabase migration new $ARGUMENTS
   ```

   Then provide migration SQL template:
   ```sql
   -- Migration: [timestamp]_$ARGUMENTS
   -- Description: [what this migration does]

   -- UP
   CREATE TABLE IF NOT EXISTS table_name (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
     created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
   );

   -- Indexes
   CREATE INDEX IF NOT EXISTS idx_table_org ON table_name(organization_id);

   -- RLS
   ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;

   -- Policies
   CREATE POLICY "org_isolation" ON table_name
     FOR ALL USING (
       organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid())
     );
   ```

3. **Generate from Diff**:
   ```bash
   supabase db diff -f $ARGUMENTS
   ```

4. **Push Migrations**:
   ```bash
   # Show pending migrations
   supabase migration list

   # Push to remote
   supabase db push
   ```

5. **Reset Local**:
   ```bash
   supabase db reset
   ```

6. **Update TypeScript Types**:
   ```bash
   supabase gen types typescript --local > src/integrations/supabase/types.ts
   ```

## Arguments

$ARGUMENTS - Action and parameters

## Examples

- `/migrate new add_client_tags` - Create new migration
- `/migrate diff schema_changes` - Generate from local changes
- `/migrate push` - Apply to remote database
- `/migrate status` - Check migration status
- `/migrate reset` - Reset local database

# Edge Functions Cleanup - Action Required in Supabase

## Functions to Delete from Supabase Dashboard

### 1. exec-sql (CRITICAL SECURITY RISK)
- **Function ID**: b2c568bd-69f4-4130-bb18-0de8df344b06
- **Status**: ACTIVE
- **Action**: DELETE IMMEDIATELY - This function allows arbitrary SQL execution
- **Risk**: Major security vulnerability - anyone with access can bypass RLS and execute any SQL

### 2. telnyx-webhook (DEPRECATED)
- **Function ID**: Not found in list (may already be removed)
- **Status**: Referenced in code but deprecated
- **Action**: If exists, DELETE - Replaced by sms-webhook

### 3. update-profiles-schema (ONE-TIME MIGRATION)
- **Function ID**: 6d512a5d-4ef0-4cae-8a16-7f9ceaa841ed
- **Status**: ACTIVE
- **Action**: DELETE - Schema migration completed, no longer needed

## Code Updates Completed

✅ **Updated**: `src/utils/init-app.ts` - Removed call to update-profiles-schema
✅ **Updated**: `FIXLIFY_PROJECT_KNOWLEDGE.md` - Updated edge functions list
✅ **Note**: Test scripts reference these functions but they're in test/backup folders

## How to Delete Edge Functions in Supabase

1. Go to your Supabase Dashboard
2. Navigate to Edge Functions section
3. Find each function by name or ID
4. Click on the function
5. Click "Delete" or "Remove" button
6. Confirm deletion

## After Deletion

1. Monitor application for any errors
2. Update any Telnyx webhook configurations to use `sms-webhook` instead of `telnyx-webhook`
3. Ensure no deployment scripts are using `exec-sql` for future migrations

## Security Note

The `exec-sql` function is particularly dangerous as it allows arbitrary SQL execution with service role privileges. This bypasses all Row Level Security (RLS) policies and could allow unauthorized access to all data in your database.

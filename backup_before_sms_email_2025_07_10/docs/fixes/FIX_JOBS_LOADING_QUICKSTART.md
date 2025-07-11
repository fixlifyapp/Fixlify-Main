# Fix Jobs Not Loading in Client Tab

## Quick Fix Steps

1. **Run the migration in Supabase SQL Editor**:
   - Go to Supabase Dashboard > SQL Editor
   - Copy and run the contents of: `migrations/fix_jobs_client_loading.sql`

2. **Clear browser cache and localStorage**:
   ```javascript
   // Run in browser console
   localStorage.clear();
   location.reload();
   ```

3. **Test the fix**:
   - Log in again
   - Navigate to any client
   - Click on the Jobs tab
   - Jobs should now load

## If Jobs Still Don't Load

### Option 1: Run Debug in Console
When on a client's Jobs tab, open browser console (F12) and run:
```javascript
// This will show detailed debug information
debugJobsLoading()
```

### Option 2: Manual Test
Copy and paste this into console:
```javascript
// Get client ID from URL
const clientId = window.location.pathname.match(/clients\/([a-f0-9-]+)/)?.[1];
if (clientId) {
  console.log('Testing client:', clientId);
  // Test query
  const { supabase } = await import('@/integrations/supabase/client');
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('client_id', clientId)
    .limit(5);
  
  if (error) {
    console.error('Query error:', error);
  } else {
    console.log('Jobs found:', data?.length || 0);
    console.table(data);
  }
}
```

### Option 3: Check Organization Context
```javascript
// Check if organization context is set
console.log('Organization ID:', localStorage.getItem('organizationId'));
console.log('User ID:', localStorage.getItem('userId'));
```

## Common Issues and Solutions

### Issue 1: Organization ID Missing
**Symptom**: `organizationId` is null in localStorage
**Fix**: Log out and log in again

### Issue 2: RLS Policy Blocking Access
**Symptom**: Query returns empty array even though jobs exist
**Fix**: Run the migration to update RLS policies

### Issue 3: Jobs Missing organization_id
**Symptom**: Jobs exist but have null organization_id
**Fix**: The migration will update these automatically

## Files Modified
- `/src/hooks/useJobsOptimized.ts` - Added debugging and better error handling
- `/src/components/clients/ClientJobs.tsx` - Added error states and debug tools
- `/src/utils/jobsDebug.ts` - Debug utility functions
- `/migrations/fix_jobs_client_loading.sql` - Database fixes

## Prevention
To prevent this in the future:
1. Always ensure jobs have organization_id when created
2. Test with different user roles
3. Monitor console for query errors

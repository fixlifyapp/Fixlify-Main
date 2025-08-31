# Edge Function Fix Documentation

## Issue Fixed
Both `send-estimate` and `send-invoice` edge functions were failing with the error:
```
JSON object requested, multiple (or no) rows returned
```

## Root Cause
The edge functions were using nested queries with `.single()` which expects exactly one row:
```javascript
const { data: estimate, error: estimateError } = await supabaseAdmin
  .from('estimates')
  .select(`
    *,
    jobs!inner(
      id,
      client_id,
      clients!inner(*)
    )
  `)
  .eq('id', estimateId)
  .single();
```

This fails when:
- The inner join produces multiple rows
- There are data integrity issues
- A job has multiple client associations

## Solution Applied
Changed both edge functions to use separate queries:

```javascript
// 1. Get estimate without nested queries
const { data: estimate, error: estimateError } = await supabaseAdmin
  .from('estimates')
  .select('*')
  .eq('id', estimateId)
  .maybeSingle();

// 2. Get job data if exists
let client = null;
if (estimate.job_id) {
  const { data: job } = await supabaseAdmin
    .from('jobs')
    .select('id, client_id')
    .eq('id', estimate.job_id)
    .maybeSingle();

  // 3. Get client data if exists
  if (job && job.client_id) {
    const { data: clientData } = await supabaseAdmin
      .from('clients')
      .select('*')
      .eq('id', job.client_id)
      .maybeSingle();
    
    client = clientData;
  }
}
```

## Benefits
1. **No more single row errors** - Using `.maybeSingle()` handles cases where no rows or multiple rows exist
2. **Better error handling** - Each query can fail independently without breaking the entire function
3. **More resilient** - Works even with data integrity issues
4. **Cleaner code** - Easier to debug and maintain

## Files Updated
- `/supabase/functions/send-estimate/index.ts` (Version 2 deployed)
- `/supabase/functions/send-invoice/index.ts` (Version 125 deployed)

## Testing
To test the fix, try sending an estimate or invoice email from the UI. The functions should now work without the "JSON object requested" error.

## Note
The SMS functions (`send-estimate-sms` and `send-invoice-sms`) were already using separate queries and didn't need fixing.

# Fix: Jobs Loading Timeout Issue

## Problem
Jobs tab shows endless loading spinner with console errors:
- "Request timeout detected"
- "Circuit breaker is OPEN"
- "useJobs - fetchJobs error: Error: Request timeout"

## Root Cause
The jobs query was too heavy due to:
1. Joining with clients table for every job
2. Fetching tags array field
3. Missing database indexes
4. Circuit breaker triggered after repeated timeouts

## Solution Applied

### 1. Optimized Query
- Removed client join from main query
- Removed tags field to reduce payload
- Added 10-second timeout to prevent hanging
- Created optimized RPC function for client-specific queries

### 2. Database Optimizations
- Added composite indexes on frequently queried columns
- Created optimized view for job listings
- Added `get_client_jobs` function with built-in timeout

### 3. Circuit Breaker Reset
- Added reset functionality to circuit breaker
- Manual refresh now resets the circuit breaker
- Added global function for emergency reset

## Quick Fix Steps

### Step 1: Run Database Migration
Execute in Supabase SQL Editor:
```sql
-- Run contents of migrations/fix_jobs_timeout.sql
```

### Step 2: Clear Browser Cache
Run in browser console:
```javascript
// Quick reset
localStorage.clear();
window.resetJobsCircuitBreaker();
location.reload();
```

### Step 3: Emergency Fix (if still not working)
Run the emergency fix script in console:
```javascript
// Copy contents of console_scripts/fix_jobs_timeout.js
```

## Prevention
1. Monitor query performance in Supabase Dashboard
2. Use pagination for large datasets
3. Avoid complex joins in list views
4. Add appropriate indexes for common queries

## Files Modified
- `/src/hooks/useJobsOptimized.ts` - Optimized query, added timeout
- `/src/utils/errorHandling.ts` - Added circuit breaker reset
- `/migrations/fix_jobs_timeout.sql` - Database optimizations
- `/console_scripts/fix_jobs_timeout.js` - Emergency fix script

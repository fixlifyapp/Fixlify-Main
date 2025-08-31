# Job System Refactoring Guide

## Issues Found

### 1. **67+ Duplicate Job Interfaces**
- Every component/hook has its own Job interface definition
- No single source of truth
- Interfaces don't match database schema

### 2. **Field Name Inconsistencies**
| Database Field | Used in Code As | Should Be |
|----------------|-----------------|-----------|
| revenue | total, amount | revenue |
| user_id | created_by | user_id |
| client_id | clientId | client_id |
| schedule_start | scheduled_start | schedule_start |

### 3. **Status Value Inconsistencies**
- Database: `'scheduled'`, `'in_progress'`, `'completed'`
- Some code: `'New'`, `'In Progress'`, `'Completed'`
- Mixed case handling throughout

### 4. **Duplicate Hooks**
- `useJobs.ts` - Main implementation (395 lines)
- `use-jobs.ts` - React Query version (37 lines)
- `useJobsOptimized.ts` - "Optimized" version
- `useJobsConsolidated.ts` - Another variant

## Migration Steps

### Phase 1: Create Central Type Definition ✅
Created `src/types/job.ts` with:
- Single Job interface matching database
- Proper enums for status
- Type guards and validation
- Clear input types for create/update

### Phase 2: Update All Imports (TODO)
```bash
# Find all Job interface definitions
grep -r "interface.*Job" src/

# Replace with import
import { Job, JobStatus, CreateJobInput, UpdateJobInput } from '@/types/job';
```

### Phase 3: Fix Field Names (TODO)
1. Replace all `total` with `revenue` for job amounts
2. Replace all `clientId` with `client_id`
3. Replace all `created_by` with `user_id` where appropriate
4. Standardize status values to lowercase with underscores

### Phase 4: Consolidate Hooks (TODO)
1. Keep only `useJobs.ts` as the main hook
2. Delete duplicate implementations
3. Update all imports to use the single hook
4. Add React Query wrapper if needed

### Phase 5: Update Components (TODO)
Priority components to update:
1. `JobsList.tsx` - Main list display
2. `JobDetails.tsx` - Detail view
3. `JobOverview.tsx` - Overview component
4. `CreateJobDialog.tsx` - Job creation
5. `JobsPage.tsx` - Main page

### Phase 6: Database Migrations (TODO)
Consider these improvements:
1. Add indexes on frequently queried fields
2. Add check constraints for status values
3. Consider removing unused `organization_id`
4. Standardize money fields to use `numeric` type

## Testing Checklist

- [ ] Job creation works with all fields
- [ ] Job listing displays correctly
- [ ] Job editing saves all fields
- [ ] Status changes work properly
- [ ] Financial calculations are accurate
- [ ] Search and filters work
- [ ] Realtime updates work
- [ ] Permissions are enforced
- [ ] Related entities (estimates, invoices) link correctly

## Code Smells to Fix

1. **Type Casting**: Remove all `as Job[]` casts
2. **Any Types**: Replace `any` with proper types
3. **Optional Chaining Abuse**: Reduce excessive `?.` usage
4. **Inconsistent Validation**: Use central validation
5. **Magic Strings**: Use enums for status, types, etc.

## Performance Improvements

1. **Remove N+1 Queries**: Use proper joins
2. **Add Pagination**: Don't load all jobs at once
3. **Index Optimization**: Add indexes for common queries
4. **Cache Strategy**: Implement proper caching
5. **Batch Operations**: For bulk updates

## Security Considerations

1. **RLS Policies**: Ensure all job queries respect RLS
2. **Input Validation**: Validate all user inputs
3. **SQL Injection**: Use parameterized queries
4. **Permission Checks**: Consistent permission enforcement
5. **Audit Trail**: Log all modifications

## Recommended Database Indexes

```sql
-- Performance indexes
CREATE INDEX idx_jobs_user_id ON jobs(user_id);
CREATE INDEX idx_jobs_client_id ON jobs(client_id);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_date ON jobs(date);
CREATE INDEX idx_jobs_schedule_start ON jobs(schedule_start);
CREATE INDEX idx_jobs_created_at ON jobs(created_at);

-- Composite indexes for common queries
CREATE INDEX idx_jobs_user_status ON jobs(user_id, status);
CREATE INDEX idx_jobs_user_date ON jobs(user_id, date);
```

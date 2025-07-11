# Multi-Tenancy Implementation Guide

This guide explains how to use the new multi-tenancy features in Fixlify.

## Overview

The multi-tenancy implementation ensures complete data isolation between users while providing niche-specific experiences based on their business type.

## Key Components

### 1. Data Isolation Hook (`useDataIsolation`)

Located in `src/hooks/useDataIsolation.ts`

```typescript
import { useDataIsolation } from "@/hooks/useDataIsolation";

const MyComponent = () => {
  const { withUserFilter, prepareInsert, validateOwnership } = useDataIsolation();
  
  // Automatically filter queries by user_id
  const query = withUserFilter(
    supabase.from('jobs').select('*')
  );
  
  // Prepare data for insert with user_id
  const newJob = prepareInsert({ title: 'New Job' });
  
  // Validate ownership of a record
  if (validateOwnership(record)) {
    // User owns this record
  }
};
```

### 2. Niche Templates (`nicheTemplates`)

Located in `src/data/nicheTemplates.ts`

Contains pre-defined templates for each business niche:
- Products/Services
- Tags
- Custom Fields
- Automations
- Email Templates

### 3. Niche Data Initializer

Located in `src/services/nicheDataInitializer.ts`

```typescript
import { NicheDataInitializer } from "@/services/nicheDataInitializer";

// Initialize data for a new user
const initializer = new NicheDataInitializer(userId, businessType);
await initializer.initializeAllData({
  setupProducts: true,
  setupTags: true,
  setupCustomFields: true
});
```
### 4. Niche Empty States

Located in `src/components/empty-states/NicheEmptyState.tsx`

```typescript
import { NicheEmptyState } from "@/components/empty-states/NicheEmptyState";

// Use in your pages when data is empty
if (jobs.length === 0) {
  return <NicheEmptyState type="jobs" businessType={businessType} />;
}
```

### 5. Niche Dashboard

Located in `src/components/dashboard/NicheDashboard.tsx`

```typescript
import { NicheDashboard } from "@/components/dashboard/NicheDashboard";

// Display niche-specific metrics
<NicheDashboard businessType={user.businessType} />
```

## Implementation Steps

### Step 1: Update Existing Pages

Replace your existing data fetching with the isolated version:

```typescript
// Before
const { data } = await supabase.from('jobs').select('*');

// After
const { withUserFilter } = useDataIsolation();
const { data } = await withUserFilter(
  supabase.from('jobs').select('*')
);
```

### Step 2: Update Create Functions

Use `prepareInsert` to automatically add user_id:

```typescript
// Before
await supabase.from('jobs').insert({ title: 'New Job' });

// After
const { prepareInsert } = useDataIsolation();
await supabase.from('jobs').insert(
  prepareInsert({ title: 'New Job' })
);
```
### Step 3: Handle Empty States

Update your pages to show niche-specific empty states:

```typescript
const [businessType, setBusinessType] = useState("");

useEffect(() => {
  // Fetch user's business type from profile
  fetchBusinessType();
}, []);

if (data.length === 0) {
  return <NicheEmptyState type="jobs" businessType={businessType} />;
}
```

### Step 4: Run Database Migrations

Apply the performance indexes migration:

```bash
supabase migration up
```

## Testing

See `MULTITENANCY_TESTING_GUIDE.md` for comprehensive testing instructions.

## Example Implementation

See complete examples in the `src/examples` directory:
- `JobsPageExample.tsx` - Basic implementation
- `JobsPageMultiTenant.tsx` - Full multi-tenant implementation

## Security Considerations

1. Always use the data isolation hooks
2. Never bypass RLS policies
3. Test with multiple user accounts
4. Monitor for data leaks in production

## Performance Tips

1. Use the provided indexes for better query performance
2. Cache user-specific data using `useUserCache`
3. Implement pagination for large datasets
4. Use React Query for efficient data fetching

## Troubleshooting

### User sees another user's data
- Check that all queries use `withUserFilter`
- Verify RLS policies are enabled
- Check for missing user_id in insert operations

### Empty state not showing
- Ensure business_niche is set in user profile
- Check that NicheEmptyState is imported correctly

### Performance issues
- Run ANALYZE on tables after bulk operations
- Check that indexes are created
- Monitor slow queries in Supabase dashboard
# Organization Context Management Solution

## Problem Statement
The Fixlify application had inconsistent usage of `user_id` and `organization_id` across different parts of the system, especially in the automation workflows. This caused:
- Queries failing with "organization_id=undefined"
- Some parts using `user_id` while others used `organization_id`
- Inconsistent data access patterns

## Solution Overview

### 1. **OrganizationContext Service** (`/src/services/organizationContext.ts`)
A centralized service that manages organization context throughout the application:
- Singleton pattern for consistent state
- Automatic fallback from organization_id to user_id for backward compatibility
- Methods to apply filters to Supabase queries
- Initialization from user profile

### 2. **useOrganizationContext Hook** (`/src/hooks/use-organization-context.ts`)
React hook that provides organization context to components:
- Automatic initialization when user logs in
- Provides helper methods for queries
- Reactive to profile changes

### 3. **Database Migration**
Applied migration to ensure data consistency:
- Updates existing records to have both `organization_id` and `user_id`
- Adds indexes for better query performance
- Maintains backward compatibility

## Usage Examples

### In React Components:
```typescript
import { useOrganizationContext } from '@/hooks/use-organization-context';

const MyComponent = () => {
  const { organizationId, userId, applyToQuery } = useOrganizationContext();
  
  // Use in queries
  const loadData = async () => {
    let query = supabase.from('my_table').select('*');
    query = applyToQuery(query); // Automatically adds org/user filters
    const { data, error } = await query;
  };
};
```

### In Services:
```typescript
import { organizationContext } from '@/services/organizationContext';

// Initialize (usually done once in App.tsx)
await organizationContext.initialize(userId);

// Use in queries
const query = organizationContext.applyToQuery(
  supabase.from('automation_workflows').select('*')
);
```

### For Automation Triggers:
The system now checks both organization_id and user_id, ensuring backward compatibility:
```typescript
query.or(`organization_id.eq.${organizationId},user_id.eq.${userId}`)
```

## Benefits
1. **Consistency**: All queries use the same filtering logic
2. **Backward Compatibility**: Works with existing data that might have only user_id
3. **Future-Proof**: Easy transition to pure organization-based queries
4. **Performance**: Proper indexes for efficient queries
5. **Maintainability**: Single source of truth for organization context

## Migration Path
1. **Phase 1** (Current): Support both user_id and organization_id
2. **Phase 2**: Gradually update all features to use organization_id
3. **Phase 3**: Eventually deprecate user_id-only queries

## Best Practices
1. Always use `organizationContext` or `useOrganizationContext` for queries
2. Don't hardcode organization_id or user_id in components
3. Initialize organization context early in the app lifecycle
4. Handle cases where organization_id might not be available

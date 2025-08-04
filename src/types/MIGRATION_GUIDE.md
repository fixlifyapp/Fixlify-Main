# Type System Migration Guide

## Overview
We've improved the type system to provide full TypeScript support for related entities. Jobs now have properly typed relations instead of `any`.

## What Changed

### Before (Old Way)
```typescript
// Old: No type safety for relations
interface Job {
  client?: any;
  technician?: any;
  estimates?: any[];
}

// No autocomplete or type checking
const clientName = job.client.name; // Could crash if client undefined
```

### After (New Way)
```typescript
// New: Full type safety
import type { JobWithRelations } from '@/types/core/job';

interface Props {
  job: JobWithRelations;
}

// TypeScript provides autocomplete and safety
const clientName = job.client?.name || 'Unknown';
const clientEmail = job.client?.email; // TypeScript knows this is string | undefined
```

## Migration Steps

### 1. Update Imports
```typescript
// Old
import { Job } from '@/types/job';

// New (choose one based on needs)
import type { Job } from '@/types/core/job'; // Just the job
import type { JobWithRelations } from '@/types/core/job'; // Job with typed relations
import type { Job, Client, Profile } from '@/types'; // Multiple types
```

### 2. Use Type-Safe Access
```typescript
// Old (unsafe)
if (job.client.email) {
  sendEmail(job.client.email);
}

// New (safe)
if (job.client?.email) {
  sendEmail(job.client.email);
}
```

### 3. Leverage IntelliSense
When you type `job.client.`, your IDE will now show all available properties:
- name
- email
- phone
- address
- company
- etc.

## Available Types

### Core Types
- `Job` - Basic job without relations
- `JobWithRelations` - Job with all relations typed
- `Client` - Customer/client type
- `Profile` - User/technician profile
- `Estimate` - Estimate with items
- `Invoice` - Invoice with items and payments
- `Payment` - Payment records

### Import Examples
```typescript
// Import individual types
import type { Job } from '@/types/core/job';
import type { Client } from '@/types/core/client';

// Import from central location
import type { Job, Client, Profile, Estimate } from '@/types';

// Import with enums and helpers
import { JobStatus, isValidJobStatus } from '@/types/core/job';
```

## Backward Compatibility

All old imports still work:
- `@/types/job` → Re-exports from `@/types/core/job`
- `@/types/client` → Re-exports from `@/types/core/client`
- `@/types/profile` → Re-exports from `@/types/core/profile`

## Benefits

1. **Autocomplete**: Full IntelliSense for all properties
2. **Type Safety**: Catch errors at compile time
3. **Better Refactoring**: IDE can rename properties across entire codebase
4. **Self-Documenting**: Types serve as documentation

## Common Patterns

### Accessing Client Data
```typescript
// Safe client access
const displayClient = (job: JobWithRelations) => {
  if (!job.client) return 'No client assigned';
  
  return `${job.client.name} (${job.client.email || 'No email'})`;
};
```

### Working with Estimates
```typescript
// Calculate total from estimates
const totalEstimated = job.estimates?.reduce((sum, estimate) => {
  return sum + estimate.total;
}, 0) || 0;
```

### Checking Technician Assignment
```typescript
// Type-safe technician check
const isAssigned = (job: JobWithRelations): boolean => {
  return job.technician !== undefined && job.technician !== null;
};

const technicianName = job.technician?.name || 'Unassigned';
```

## No Breaking Changes

- All existing code continues to work
- Migration can be done incrementally
- Old `any` types are still supported (but not recommended)

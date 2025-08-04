# Database Type Integration Guide

## Overview
We've integrated Supabase database types with our application types for complete type safety from database to UI.

## Benefits

### 1. **Type-Safe Database Queries**
```typescript
// Before: No type checking on database operations
const { data } = await supabase.from('jobs').select('*');
// data is 'any', no autocomplete

// After: Full type safety
import type { Database } from '@/integrations/supabase/types';

const { data } = await supabase
  .from('jobs')
  .select('*')
  .single<Database['public']['Tables']['jobs']['Row']>();
// data is fully typed with all database fields
```

### 2. **Validated Data Transformations**
```typescript
import { databaseJobToJob, isValidDatabaseJob } from '@/types';

// Convert database row to application type
const dbRow = await fetchJobFromDatabase();
if (isValidDatabaseJob(dbRow)) {
  const job = databaseJobToJob(dbRow);
  // job is now typed as Job with all validations applied
}
```

### 3. **Type-Safe Inserts and Updates**
```typescript
import type { CreateJobDatabase } from '@/types';

// TypeScript ensures only valid fields are sent to database
const newJob: CreateJobDatabase = {
  title: 'New Job',
  client_id: 'client-123',
  status: JobStatus.SCHEDULED, // Enum validated
  revenue: 100,
  // estimates: [], // ❌ Error: Not a database field
};

const { data, error } = await supabase
  .from('jobs')
  .insert(newJob);
```

## Available Database Types

### Job Types
- `JobDatabase` - Database row with enhancements
- `JobWithDatabaseRelations` - Includes typed relations
- `CreateJobDatabase` - For inserts
- `UpdateJobDatabase` - For updates
- `databaseJobToJob()` - Convert DB to app type

### Client Types
- `ClientDatabase` - Database row enhanced
- `ClientWithDatabaseMetrics` - With computed fields
- `CreateClientDatabase` - For inserts
- `UpdateClientDatabase` - For updates
- `databaseClientToClient()` - Convert DB to app type

### Profile Types
- `ProfileDatabase` - Database row enhanced
- `ProfileWithDatabaseRelations` - With relations
- `CreateProfileDatabase` - For inserts
- `UpdateProfileDatabase` - For updates
- `databaseProfileToProfile()` - Convert DB to app type

## Usage Examples

### Fetching with Relations
```typescript
import type { JobWithDatabaseRelations } from '@/types';

// Type-safe query with joins
const { data } = await supabase
  .from('jobs')
  .select(`
    *,
    client:clients(*),
    technician:profiles(*)
  `)
  .eq('id', jobId)
  .single();

// TypeScript knows the shape of data including relations
console.log(data.client?.name); // Fully typed
```

### Creating Records
```typescript
import { clientToDatabase } from '@/types';

const clientData = {
  name: 'John Doe',
  email: 'john@example.com',
  phone: '555-1234',
};

// Convert to database format
const dbClient = clientToDatabase(clientData);

// Insert with type safety
const { data, error } = await supabase
  .from('clients')
  .insert(dbClient)
  .select()
  .single();
```

### Validation Pattern
```typescript
import { isValidDatabaseJob, databaseJobToJob } from '@/types';

async function getJob(id: string) {
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', id)
    .single();
    
  if (error) throw error;
  
  // Validate and convert
  if (!isValidDatabaseJob(data)) {
    throw new Error('Invalid job data from database');
  }
  
  return databaseJobToJob(data);
}
```

## Best Practices

1. **Use Database Types for Supabase Operations**
   ```typescript
   // ✅ Good
   import type { CreateJobDatabase } from '@/types';
   const newJob: CreateJobDatabase = { ... };
   
   // ❌ Avoid
   const newJob: any = { ... };
   ```

2. **Validate Data from Database**
   ```typescript
   // Always validate when data comes from external sources
   if (isValidDatabaseJob(data)) {
     const job = databaseJobToJob(data);
   }
   ```

3. **Use Type Guards**
   ```typescript
   // Type guards ensure type safety
   function processJob(data: unknown) {
     if (isValidDatabaseJob(data)) {
       // data is now typed as JobDatabase
       console.log(data.title);
     }
   }
   ```

4. **Leverage IDE Support**
   - Let TypeScript catch field name typos
   - Use autocomplete for database columns
   - Refactor with confidence

## Migration Path

1. **Gradual Adoption** - Use database types in new code
2. **Update Queries** - Add type parameters to select()
3. **Add Validation** - Use type guards for safety
4. **Full Migration** - Update all database operations

The database types are fully compatible with existing code while providing enhanced type safety for new development.

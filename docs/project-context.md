# Fixlify Project Context

> AI-optimized context file for consistent code generation. Last updated: 2026-01-12

## Technology Stack

### Frontend (React 18 + TypeScript)
- **Build**: Vite 5.4, TypeScript 5.5 (NOT strict mode - see tsconfig.json)
- **UI**: shadcn/ui + Radix UI primitives + Tailwind CSS 3.4
- **State**: React Query (TanStack Query 5.56) for server state
- **Forms**: react-hook-form 7.53 + zod 3.23
- **Routing**: react-router-dom 6.26

### Backend (Supabase)
- **Database**: PostgreSQL 15 via Supabase
- **Auth**: Supabase Auth with RLS policies
- **Edge Functions**: Deno runtime (48+ functions deployed)
- **Realtime**: Supabase Realtime for live updates

### Integrations
- **SMS/Voice**: Telnyx API (+14375249932)
- **Email**: Mailgun (mg.fixlify.app)
- **Payments**: Stripe
- **AI**: OpenAI GPT-4, Claude API

---

## Critical Implementation Rules

### TypeScript Configuration
```
WARNING: tsconfig.json has relaxed settings:
- noImplicitAny: false
- strictNullChecks: false
- noUnusedLocals: false
```
**Rule**: Despite relaxed settings, always use proper types. Avoid `any`.

### Path Aliases
```typescript
// Always use @ alias for src imports
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
```

### Component Patterns
```typescript
// shadcn/ui components location
src/components/ui/          // Base shadcn components
src/components/{feature}/   // Feature-specific components

// Naming conventions
ComponentName.tsx           // PascalCase for components
useHookName.ts             // camelCase with 'use' prefix for hooks
utility-name.ts            // kebab-case for utilities
```

### Supabase Client Usage
```typescript
// Always import from integrations folder
import { supabase } from "@/integrations/supabase/client";

// Use typed queries with proper error handling
const { data, error } = await supabase
  .from('table_name')
  .select('*')
  .eq('column', value);

if (error) throw error;
```

### Edge Functions (Deno)
```typescript
// Location: supabase/functions/{function-name}/index.ts

// Required imports
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// CORS headers required for every response
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
```

---

## Code Organization

### Folder Structure
```
src/
├── components/
│   ├── ui/              # shadcn base components
│   ├── {feature}/       # Feature components (clients, jobs, invoices)
│   └── layout/          # Layout components
├── hooks/               # Custom React hooks (useClientData, useJobData)
├── pages/               # Route components
├── services/            # API service layer
├── types/               # TypeScript type definitions
├── utils/               # Utility functions
└── integrations/        # External service integrations
    └── supabase/        # Supabase client and types
```

### Hook Patterns
```typescript
// Data fetching hooks use React Query
export function useClients() {
  return useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const { data, error } = await supabase.from('clients').select('*');
      if (error) throw error;
      return data;
    }
  });
}

// Mutations with cache invalidation
export function useCreateClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (client: NewClient) => {
      const { data, error } = await supabase.from('clients').insert(client);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    }
  });
}
```

---

## Styling Guidelines

### Tailwind + shadcn/ui
```typescript
// Use cn() utility for conditional classes
import { cn } from "@/lib/utils";

<div className={cn(
  "base-classes",
  condition && "conditional-class",
  className
)} />

// Brand colors (defined in tailwind.config.ts)
fixlyfy: {
  DEFAULT: '#8A4DD5',    // Primary purple
  light: '#B084F9',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
}
```

### Dark Mode Support
```typescript
// Enabled via class strategy in tailwind.config.ts
darkMode: ["class"]

// Use next-themes for theme switching
import { useTheme } from "next-themes";
```

---

## Database Conventions

### RLS Policies Required
All tables MUST have Row Level Security policies. Example:
```sql
-- Enable RLS
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Policy pattern
CREATE POLICY "Users can view own organization clients"
ON clients FOR SELECT
USING (organization_id = auth.jwt() ->> 'organization_id');
```

### Naming Conventions
- Tables: `snake_case` plural (clients, jobs, invoices)
- Columns: `snake_case` (created_at, client_id)
- Foreign keys: `{table}_id` (client_id, job_id)

---

## Testing

### Vitest Configuration
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'happy-dom',
    globals: true,
  }
});
```

### Test Location
```
src/hooks/__tests__/     # Hook tests
src/test/                # Integration tests
tests/                   # E2E and system tests
```

---

## ESLint Rules

### Active Rules (eslint.config.js)
- SonarJS cognitive-complexity: max 15
- SonarJS no-duplicate-string: threshold 5
- @typescript-eslint/no-explicit-any: warn
- react-hooks/rules-of-hooks: error

### Pre-commit
- Husky + lint-staged runs ESLint on staged files
- Max 50 warnings allowed

---

## Edge Function Patterns

### 43 Edge Functions Organized By:
```
AI Functions:      ai-*, generate-ai-*, automation-*
Email:             send-email, mailgun-email, email-webhook
SMS/Voice:         telnyx-*, sms-webhook
Invoicing:         send-invoice, send-estimate
```

### Telnyx Integration
```typescript
// Phone number format: E.164 (+1XXXXXXXXXX)
// API: https://api.telnyx.com/v2
// SMS: POST /messages
// Calls: POST /calls
```

---

## Performance Patterns

### Lazy Loading
```typescript
// Routes are lazy loaded
const ClientsPage = lazy(() => import("@/pages/Clients"));

// Wrap with Suspense
<Suspense fallback={<LoadingSpinner />}>
  <ClientsPage />
</Suspense>
```

### PWA Configuration
- Service Worker enabled via vite-plugin-pwa
- Caches Supabase API responses (24h)
- Offline-first for static assets

---

## Common Mistakes to Avoid

1. **DON'T** import supabase directly - use `@/integrations/supabase/client`
2. **DON'T** forget CORS headers in Edge Functions
3. **DON'T** skip RLS policies on new tables
4. **DON'T** use raw SQL without parameterization
5. **DON'T** forget to invalidate React Query cache after mutations
6. **DO** use E.164 format for phone numbers (+1XXXXXXXXXX)
7. **DON'T** hardcode API keys - use Supabase secrets or .env

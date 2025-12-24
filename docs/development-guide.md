# Fixlify - Development Guide

## Prerequisites

### Required Software

| Software | Version | Purpose |
|----------|---------|---------|
| Node.js | 18.x or 20.x | JavaScript runtime |
| npm | 9.x+ | Package manager |
| Git | Latest | Version control |
| VS Code | Latest | Recommended IDE |
| Supabase CLI | Latest | Database management |

### Recommended VS Code Extensions

- ESLint
- Prettier
- Tailwind CSS IntelliSense
- TypeScript Vue Plugin (Volar)
- GitLens
- Error Lens

## Quick Start

### 1. Clone Repository

```bash
git clone <repository-url>
cd "Fixlify MAIN WEB"
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Create `.env` file in project root:

```env
VITE_SUPABASE_URL=https://mqppvcrlvsgrsqelglod.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Start Development Server

```bash
npm run dev
```

Application runs at: `http://localhost:8080`

Alternative port:
```bash
npm run dev:8081
```

### 5. Build for Production

```bash
npm run build
```

Output: `dist/` directory

## Development Workflow

### Branch Strategy

```
main
  │
  ├── feature/feature-name    # New features
  ├── fix/bug-description     # Bug fixes
  ├── refactor/component-name # Refactoring
  └── docs/documentation-update
```

### Commit Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Features
git commit -m "feat: add tenant contact to properties"

# Bug fixes
git commit -m "fix: resolve job status update issue"

# Refactoring
git commit -m "refactor: consolidate job hooks"

# Documentation
git commit -m "docs: update architecture documentation"

# Performance
git commit -m "perf: optimize client list rendering"

# Chores
git commit -m "chore: update dependencies"
```

### Pull Request Process

1. Create feature branch from `main`
2. Make changes with atomic commits
3. Run linting: `npm run lint`
4. Build verification: `npm run build`
5. Create PR with description
6. Request review
7. Merge after approval

## Project Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server (port 8080) |
| `npm run dev:8081` | Start dev server (port 8081) |
| `npm run build` | Production build |
| `npm run build:dev` | Development build |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview production build |
| `npm run context:validate` | Validate project context |
| `npm run context:update` | Update knowledge base |

## Component Development

### Creating New Components

1. **Location**: Place in appropriate directory under `src/components/`
2. **Naming**: Use PascalCase (`MyComponent.tsx`)
3. **Structure**:

```tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface MyComponentProps {
  title: string;
  onAction?: () => void;
}

export const MyComponent = ({ title, onAction }: MyComponentProps) => {
  const [isActive, setIsActive] = useState(false);

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold">{title}</h2>
      <Button onClick={onAction}>
        Action
      </Button>
    </div>
  );
};
```

### Using shadcn/ui Components

shadcn/ui components are in `src/components/ui/`. Import and use:

```tsx
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
```

### Creating Custom Hooks

1. **Location**: `src/hooks/`
2. **Naming**: `useHookName.ts` (camelCase with `use` prefix)
3. **Pattern**:

```tsx
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useMyData = (id: string) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['myData', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('my_table')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  return { data, isLoading, error };
};
```

## Database Development

### Supabase CLI Setup

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
npx supabase login

# Link to project
npx supabase link --project-ref mqppvcrlvsgrsqelglod
```

### Creating Migrations

```bash
# Create new migration
npx supabase migration new add_feature_name

# Edit migration file in supabase/migrations/
```

Example migration:

```sql
-- Add new column
ALTER TABLE clients
ADD COLUMN IF NOT EXISTS preferred_contact TEXT DEFAULT 'phone';

-- Add RLS policy
CREATE POLICY "Users can view own business clients"
ON clients FOR SELECT
USING (business_id = auth.jwt() ->> 'business_id');
```

### Applying Migrations

```bash
# Apply migrations to remote
npx supabase db push

# Reset local database
npx supabase db reset
```

### Type Generation

After schema changes, regenerate types:

```bash
npx supabase gen types typescript --project-id mqppvcrlvsgrsqelglod > src/integrations/supabase/types.ts
```

## Edge Function Development

### Creating New Edge Function

```bash
npx supabase functions new my-function
```

Creates: `supabase/functions/my-function/index.ts`

### Edge Function Template

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data, error } = await req.json()

    // Your logic here

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
```

### Deploying Edge Functions

```bash
# Deploy single function
npx supabase functions deploy my-function

# Deploy all functions
npx supabase functions deploy
```

### Testing Edge Functions Locally

```bash
npx supabase functions serve my-function
```

## Styling Guidelines

### Tailwind CSS

Use Tailwind utility classes:

```tsx
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm">
  <span className="text-lg font-medium text-gray-900">Title</span>
  <Button variant="outline" size="sm">Action</Button>
</div>
```

### Color Palette

| Color | Tailwind Class | Usage |
|-------|---------------|-------|
| Primary | `bg-blue-500` | Brand color, CTAs |
| Success | `bg-green-500` | Success states |
| Warning | `bg-yellow-500` | Warning states |
| Error | `bg-red-500` | Error states |
| Gray | `bg-gray-*` | Backgrounds, text |

### Responsive Design

```tsx
<div className="
  w-full           // Mobile (default)
  md:w-1/2         // Tablet
  lg:w-1/3         // Desktop
  xl:w-1/4         // Large desktop
">
```

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- JobDetails.test.tsx
```

### Writing Tests

```tsx
import { render, screen } from '@testing-library/react';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('renders title correctly', () => {
    render(<MyComponent title="Test Title" />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });
});
```

## Debugging

### React DevTools

Install React DevTools browser extension for component inspection.

### React Query DevTools

Already integrated. Access via floating button in development mode.

### Console Logging

```tsx
// Use console groups for organized logs
console.group('JobDetails: Status Update');
console.log('Current status:', currentStatus);
console.log('New status:', newStatus);
console.groupEnd();
```

### Supabase Logs

View Edge Function logs in Supabase Dashboard → Edge Functions → Logs

## Common Issues & Solutions

### Issue: Module not found

```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install
```

### Issue: Type errors after schema change

```bash
# Regenerate Supabase types
npx supabase gen types typescript --project-id mqppvcrlvsgrsqelglod > src/integrations/supabase/types.ts
```

### Issue: Edge Function 500 error

1. Check function logs in Supabase Dashboard
2. Verify environment variables are set
3. Check CORS headers

### Issue: Real-time not updating

1. Check WebSocket connection in DevTools
2. Verify RLS policies allow access
3. Check subscription channel name

## Performance Best Practices

1. **Use React.memo** for expensive components
2. **Lazy load routes** with `React.lazy()`
3. **Optimize queries** - select only needed columns
4. **Use pagination** for large lists
5. **Cache aggressively** with React Query

## Security Checklist

- [ ] No secrets in frontend code
- [ ] All tables have RLS policies
- [ ] Input validation on all forms
- [ ] CORS properly configured
- [ ] Authentication required for protected routes

## Deployment

### Vercel Deployment

1. Connect GitHub repository to Vercel
2. Configure environment variables
3. Deploy automatically on push to `main`

### Database Migrations

```bash
# Run before deploying new features
npx supabase db push
```

### Edge Function Deployment

```bash
npx supabase functions deploy
```

## Getting Help

- **Documentation**: Check `docs/` folder
- **Code Search**: Use VS Code search (`Ctrl+Shift+F`)
- **Component Library**: Browse `src/components/ui/`
- **Type Definitions**: Check `src/types/` and `src/integrations/supabase/types.ts`

## Related Documentation

- [Project Overview](./project-overview.md)
- [Architecture](./architecture.md)
- [Source Tree Analysis](./source-tree-analysis.md)

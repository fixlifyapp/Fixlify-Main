# Fixlify AI Development Context

## 🚀 Quick Commands
When user says:
- **"check context engineering"** → Load and review ALL context files:
  1. FIXLIFY_PROJECT_KNOWLEDGE.md (main documentation)
  2. FIXLIFY_CONTEXT.md (development rules)
  3. FIXLIFY_PATTERNS.md (code patterns)
  4. FIXLIFY_COMMON_FIXES.md (solution library)
  5. FIXLIFY_LAYOUT_PATTERNS.md (layout patterns)
  6. CONTEXT_ENGINEERING_GUIDE.md (how to maintain)
  7. FIXLIFY_QUICK_REFERENCE.md (cheat sheet)
  8. FIXLIFY_RULES.md (if exists)
  9. Any other FIXLIFY_*.md files
- **"apply fixlify context"** → Load context and prepare to work
- **"update context"** → Add new learnings to appropriate files
- **"check patterns"** → Review PATTERNS.md for implementation
- **"check fixes"** → Review COMMON_FIXES.md for solutions
- **"document this"** → Update PROJECT_KNOWLEDGE.md

## 🎯 Role Definition
You are an expert full-stack developer working on Fixlify AI Automate, a comprehensive business management and automation platform for service-based businesses (HVAC, plumbing, electrical, etc.).

## 🛠️ Technical Context
- **Stack**: React 18.3.1, TypeScript 5.5.3, Vite 5.4.1, Supabase (PostgreSQL), Tailwind CSS 3.4.11
- **UI Library**: shadcn/ui with Radix UI primitives
- **State Management**: TanStack React Query 5.56.2, React Hook Form 7.53.0 with Zod
- **Routing**: React Router DOM 6.26.2
- **Charts**: Recharts 2.12.7
- **Icons**: Lucide React
- **Project Location**: C:\Users\petru\Downloads\TEST FIX SITE\3\Fixlify-Main-main
- **Dev Server**: Port 8080 (fallback to 8081, 8082, 8083)

## 📐 Development Rules

### Priority Rules (MUST FOLLOW)
1. **NEVER** break existing functionality - test thoroughly
2. **ALWAYS** test on mobile, tablet, and desktop (all browsers)
3. **UPDATE** FIXLIFY_PROJECT_KNOWLEDGE.md after every fix
4. **USE** Desktop Commander for all file operations
5. **USE** Supabase MCP for all database operations
6. **CHECK** for duplicate files/systems before creating new ones
7. **WRITE** all code comments and documentation in English
8. **DOUBLE-CHECK** for errors at the end of implementation

### Business Logic Rules
1. **ESTIMATES** → Can be converted to invoices (one-way operation)
2. **INVOICES** → Track payments and balance automatically
3. **JOBS** → Central entity connecting clients, estimates, invoices, payments
4. **MULTI-TENANT** → Every query must respect organization_id
5. **AUDIT TRAIL** → Important actions should be logged
6. **REAL-TIME** → Changes should reflect immediately via subscriptions

### UI/UX Rules
1. **MOBILE-FIRST** → Design for mobile, enhance for desktop
2. **LOADING STATES** → Every async operation needs feedback
3. **ERROR HANDLING** → User-friendly messages, log technical details
4. **EMPTY STATES** → Helpful messages when no data exists
5. **CONFIRMATIONS** → Destructive actions need confirmation

### Responsive Design Rules (NEW)
1. **CONTAINER SYSTEM** → Always use `.container-responsive` for content
2. **BREAKPOINTS** → Mobile (<640px), Tablet (640-1023px), Desktop (1024-1279px), Wide (≥1280px)
3. **MAX-WIDTH** → Desktop: 1200px, Wide: 1400px to prevent stretching
4. **SPACING SCALE** → Mobile: 1rem, Tablet: 1.5rem, Desktop: 2rem, Wide: 2.5rem
5. **TOUCH TARGETS** → Minimum 44px height/width on mobile devices
6. **TEST ALL SIZES** → Use browser DevTools responsive mode
7. **AVOID !IMPORTANT** → Use proper CSS specificity instead

### Layout Debugging (NEW)
1. **USE TOOLS** → Run `LAYOUT_DEBUG.js` in console to find issues
2. **CHECK REPORT** → Review `LAYOUT_ANALYSIS_REPORT.md` for patterns
3. **ONE CSS FILE** → Don't create multiple CSS files for same issue
4. **SEMANTIC CLASSES** → Use `.space-mobile`, `.space-tablet`, etc.
5. **DOCUMENT FIXES** → Update `FIXLIFY_PROJECT_KNOWLEDGE.md` immediately
6. **ACCESSIBILITY** → Keyboard navigation and screen reader support

### Performance Rules
1. **PAGINATION** → Lists over 50 items must paginate
2. **DEBOUNCE** → Search inputs wait 500ms before querying
3. **CACHE** → Use React Query caching effectively
4. **LAZY LOAD** → Images and heavy components load on demand
5. **OPTIMIZE** → Bundle size matters - check imports

### Security Rules
1. **RLS** → Never bypass row-level security
2. **VALIDATION** → Client and server-side validation
3. **SANITIZATION** → Clean user inputs before database
4. **PERMISSIONS** → Check user permissions before actions
5. **TOKENS** → Refresh tokens before expiry

### Code Quality Rules
- **Chunking**: Write files in 25-30 line chunks maximum
- **Imports**: Use proper React-style imports (e.g., `import Papa from 'papaparse'`)
- **Error Handling**: Always wrap async operations in try-catch
- **Loading States**: Provide feedback for all async operations
- **Accessibility**: Maintain ARIA labels and keyboard navigation
- **Comments**: Add JSDoc comments for complex functions
- **Types**: No `any` types unless absolutely necessary
- **Props**: Destructure props in function parameters

### Communication Rules
1. **EXPLAIN** changes before implementing
2. **CONFIRM** understanding of requirements
3. **REPORT** progress during long operations
4. **SUMMARIZE** what was done after completion
5. **WARN** about potential breaking changes
6. **ASK** when requirements are unclear

### Git & Version Control Rules
1. **ATOMIC** → One fix per commit conceptually
2. **DESCRIPTIVE** → Clear commit messages
3. **TEST** → Verify before marking complete
4. **ROLLBACK** → Keep backup of working code
5. **CHANGELOG** → Update PROJECT_KNOWLEDGE.md

## 🎨 Code Standards

### Naming Conventions
```typescript
// Components: PascalCase
export const ClientsList = () => { }

// Hooks: camelCase with 'use' prefix
export const useClients = () => { }

// Files: kebab-case
clients-list.tsx, use-clients.ts

// CSS classes: Tailwind utilities first
className="rounded-lg shadow-md bg-white hover:shadow-lg transition-all"

// Database tables: snake_case
clients, job_estimates, team_members

// API/Edge functions: kebab-case
send-estimate, portal-data, mailgun-email
```

### Component Structure
```typescript
// 1. Imports (grouped by type)
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

// 2. Types/Interfaces
interface ComponentProps {
  id: string;
  onSuccess?: () => void;
}

// 3. Component
export const Component = ({ id, onSuccess }: ComponentProps) => {
  // 4. State declarations
  const [isLoading, setIsLoading] = useState(false);
  
  // 5. Hooks
  const navigate = useNavigate();
  const { data, refetch } = useCustomHook();
  
  // 6. Effects
  useEffect(() => {
    // Effect logic
  }, [dependency]);
  
  // 7. Handlers
  const handleAction = async () => {
    // Handler logic
  };
  
  // 8. Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
};
```

### Styling Approach
```typescript
// Mobile-first responsive design
className="p-4 sm:p-6 lg:p-8"

// Consistent spacing scale
// p-2 (0.5rem), p-3 (0.75rem), p-4 (1rem), p-6 (1.5rem), p-8 (2rem)

// Brand colors
// fixlyfy (primary purple)
// fixlyfy-light, fixlyfy-dark (shades)

// State variants
// hover:, focus:, active:, disabled:
// group-hover: for parent-triggered states
```

## 🔄 Development Workflow

### 1. **Analyze Phase**
- Check FIXLIFY_PROJECT_KNOWLEDGE.md for similar issues
- Search for existing implementations
- Identify all affected files
- Consider mobile/tablet/desktop implications

### 2. **Plan Phase**
- List files to modify
- Identify potential breaking changes
- Plan database migrations if needed
- Consider performance implications

### 3. **Implement Phase**
- Create/modify files in chunks
- Follow established patterns
- Add proper error handling
- Include loading states

### 4. **Test Phase**
- Test all screen sizes
- Verify in multiple browsers
- Check console for errors
- Test error scenarios

### 5. **Document Phase**
- Update FIXLIFY_PROJECT_KNOWLEDGE.md
- Add to patterns if new pattern created
- Document any gotchas in COMMON_FIXES
- Update context if new rules discovered

## ⚠️ Critical System Knowledge

### Authentication
- Token stored as `fixlify-auth-token` in localStorage
- Supabase auth with JWT
- RLS policies enforce data isolation
- Session detection in URL parameters

### Database
- Multi-tenant with `organization_id`
- Row-level security on all tables
- Use `.maybeSingle()` instead of `.single()` for safety
- Always handle nullable fields

### Real-time Features
- Supabase subscriptions for live updates
- Debounce rapid updates (500ms minimum)
- Clean up subscriptions on unmount

### Performance
- Lazy load route components
- Use React.memo for expensive components
- Virtualize long lists (>100 items)
- Debounce search inputs

### Edge Functions
```
Deployed functions:
- telnyx-sms (SMS sending)
- mailgun-email (Email sending)
- send-estimate (Estimate emails)
- send-invoice (Invoice emails)
- portal-data (Client portal)
```

## 🎯 Current Architecture Patterns

### Data Fetching
```typescript
// Use React Query hooks
const { data, isLoading, error, refetch } = useQuery({
  queryKey: ['clients', filters],
  queryFn: async () => {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }
});
```

### Error Handling
```typescript
try {
  await operation();
  toast.success('Success message');
} catch (error) {
  console.error('Context:', error);
  toast.error('User-friendly error message');
}
```

### Form Handling
```typescript
// Use React Hook Form with Zod
const form = useForm<FormData>({
  resolver: zodResolver(formSchema),
  defaultValues: {
    field: ''
  }
});
```

## 🚨 Common Pitfalls to Avoid

1. **Never use localStorage/sessionStorage in artifacts**
2. **Don't use .single() without error handling**
3. **Avoid nested queries in Supabase**
4. **Don't forget organization_id in queries**
5. **Always clean up event listeners and subscriptions**
6. **Never hardcode IDs or credentials**
7. **Don't create duplicate edge functions**

## 📊 Testing Checklist

Before considering any task complete:
- [ ] Works on mobile (320px+)
- [ ] Works on tablet (768px+)
- [ ] Works on desktop (1024px+)
- [ ] No console errors
- [ ] Loading states show
- [ ] Error states handle gracefully
- [ ] Keyboard navigation works
- [ ] Screen reader friendly
- [ ] Updates persist after refresh
- [ ] No layout shifts

## 🔗 Quick Commands

```bash
# Start dev server
npm run dev

# Check TypeScript
npm run type-check

# Format code
npm run format

# Build for production
npm run build
```

## 📚 Reference Priority

When working on tasks, reference in this order:
1. **FIXLIFY_CONTEXT.md** - How to behave
2. **FIXLIFY_PROJECT_KNOWLEDGE.md** - What has been done
3. **FIXLIFY_PATTERNS.md** - How to implement
4. **FIXLIFY_COMMON_FIXES.md** - What to avoid

---

*Remember: The goal is clean, maintainable, performant code that works flawlessly across all devices.*
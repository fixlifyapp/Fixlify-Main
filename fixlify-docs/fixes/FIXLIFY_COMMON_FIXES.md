# Fixlify Common Issues & Quick Fixes

## 🔧 Quick Fix Commands

### Authentication Issues
```javascript
// Fix blank page / auth errors
localStorage.removeItem('fixlify-auth-token');
window.location.href = '/login';

// Clear all auth data
localStorage.clear();
sessionStorage.clear();
location.reload();

// Debug auth state
console.log('Auth token:', localStorage.getItem('fixlify-auth-token'));
console.log('Supabase session:', await supabase.auth.getSession());
```

### React Query Cache Issues
```javascript
// Clear React Query cache
queryClient.clear();

// Invalidate specific queries
queryClient.invalidateQueries({ queryKey: ['clients'] });
queryClient.invalidateQueries({ queryKey: ['jobs'] });

// Force refetch all active queries
queryClient.refetchQueries();
```

## 🐛 Common Errors & Solutions

### 1. "JSON object requested, multiple (or no) rows returned"
**Cause**: Using `.single()` when query returns 0 or multiple rows

**Fix**:
```typescript
// ❌ Bad
const { data, error } = await supabase
  .from('clients')
  .select('*')
  .eq('id', clientId)
  .single(); // Throws if not exactly 1 row

// ✅ Good
const { data, error } = await supabase
  .from('clients')
  .select('*')
  .eq('id', clientId)
  .maybeSingle(); // Returns null if no rows
```

### 2. "invalid refresh token"
**Cause**: Expired or corrupted auth token

**Fix**:
```typescript
// In ProtectedRoute or App component
useEffect(() => {
  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        localStorage.removeItem('fixlify-auth-token');
        navigate('/login');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('fixlify-auth-token');
      navigate('/login');
    }
  };
  
  checkAuth();
}, []);
```

### 3. "ERR_INSUFFICIENT_RESOURCES"
**Cause**: Too many database connections or queries

**Fix**:
```typescript
// Add connection pooling
const supabase = createClient(url, key, {
  db: {
    poolSize: 10 // Limit connections
  }
});

// Add query debouncing
const debouncedSearch = useMemo(
  () => debounce((query: string) => {
    refetch();
  }, 500),
  [refetch]
);
```

### 4. "Maximum update depth exceeded"
**Cause**: Infinite re-render loop

**Fix**:
```typescript
// ❌ Bad - causes infinite loop
useEffect(() => {
  setData(newData);
}); // No dependency array

// ✅ Good
useEffect(() => {
  setData(newData);
}, [newData]); // Proper dependencies

// ✅ Also good - memoize callbacks
const handleUpdate = useCallback(() => {
  // update logic
}, [dependency]);
```

### 5. "DialogPortal must be used within Dialog"
**Cause**: Incorrect dialog component usage

**Fix**:
```typescript
// ❌ Bad
<DialogPortal>
  <DialogContent>...</DialogContent>
</DialogPortal>

// ✅ Good
<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent>...</DialogContent>
</Dialog>
```

## 🎨 Layout Issues

### Header Button Alignment
**Problem**: Buttons not aligning to the right

**Fix**:
```typescript
// PageHeader component
<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
  <div>{/* Title content */}</div>
  <div className="mt-4 sm:mt-0">{/* Button */}</div>
</div>
```

### White Gap Between Header and Content
**Problem**: Large gap in page layout

**Fix**:
```css
/* Remove problematic spacing */
.main-content {
  padding-top: 0;
  margin-top: 0;
}

/* Check for double margins */
.header + .content {
  margin-top: 1rem; /* Not 2rem */
}
```

### Content Not Showing on Desktop
**Problem**: Sidebar taking full width

**Fix**:
```typescript
// Ensure SidebarInset is a div, not main
<div data-sidebar-inset className="flex-1 min-w-0">
  {children}
</div>
```

## 🗄️ Database Issues

### Missing organization_id
**Problem**: Queries failing due to RLS

**Fix**:
```sql
-- Add organization_id to existing records
UPDATE clients 
SET organization_id = user_id 
WHERE organization_id IS NULL;

-- Ensure new records have organization_id
ALTER TABLE clients 
ALTER COLUMN organization_id SET NOT NULL;
```

### Slow Queries
**Problem**: Timeouts on large datasets

**Fix**:
```sql
-- Add indexes
CREATE INDEX idx_jobs_organization_date 
ON jobs(organization_id, created_at DESC);

CREATE INDEX idx_clients_organization_status 
ON clients(organization_id, status);

-- Use pagination
LIMIT 50 OFFSET 0
```

### RLS Policy Errors
**Problem**: "new row violates row-level security policy"

**Fix**:
```sql
-- Check current user
SELECT auth.uid();

-- View active policies
SELECT * FROM pg_policies 
WHERE tablename = 'your_table';

-- Simple policy fix
CREATE POLICY "Users can view own data" ON clients
FOR SELECT USING (organization_id = auth.uid());
```

## 🎯 Performance Issues

### Slow Initial Load
**Fix**:
```typescript
// Lazy load routes
const ClientsPage = lazy(() => import('./pages/ClientsPage'));

// Preload critical data
const prefetchClients = () => {
  queryClient.prefetchQuery({
    queryKey: ['clients'],
    queryFn: fetchClients
  });
};
```

### Memory Leaks
**Fix**:
```typescript
useEffect(() => {
  let mounted = true;
  
  const fetchData = async () => {
    const data = await loadData();
    if (mounted) {
      setData(data);
    }
  };
  
  fetchData();
  
  return () => {
    mounted = false;
  };
}, []);
```

### Too Many Re-renders
**Fix**:
```typescript
// Memoize expensive computations
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data);
}, [data]);

// Memoize components
const MemoizedComponent = memo(ExpensiveComponent);

// Debounce rapid updates
const debouncedUpdate = useDeboounce(value, 500);
```

## 🔌 API/Edge Function Issues

### Edge Function Not Found
**Problem**: "Edge function 'xyz' not found"

**Check**:
1. Function is deployed: `supabase functions list`
2. Correct function name in code
3. Function has proper permissions

**Common function names**:
- `mailgun-email` (not `send-email`)
- `telnyx-sms` (not `send-sms`)
- `portal-data` (not `get-portal-data`)

### CORS Errors
**Fix**:
```typescript
// In edge function
return new Response(JSON.stringify(data), {
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }
});
```

## 🎨 Styling Issues

### Tailwind Classes Not Working
**Fix**:
```typescript
// ❌ Dynamic classes don't work
className={`text-${color}-500`}

// ✅ Use complete classes
const colorClasses = {
  red: 'text-red-500',
  blue: 'text-blue-500'
};
className={colorClasses[color]}
```

### Dark Mode Issues
**Fix**:
```typescript
// Use CSS variables
className="bg-background text-foreground"

// Not hardcoded colors
className="bg-white text-black" // ❌
```

## 🚀 Build & Deploy Issues

### Build Failures
**Common fixes**:
```bash
# Clear cache
rm -rf node_modules package-lock.json
npm install

# Check for type errors
npm run type-check

# Fix lint errors
npm run lint:fix
```

### Environment Variables
**Fix**:
```typescript
// Always prefix with VITE_
VITE_SUPABASE_URL=https://...
VITE_SUPABASE_ANON_KEY=eyJ...

// Access in code
const url = import.meta.env.VITE_SUPABASE_URL;
```

## 📱 Mobile Issues

### Viewport Issues
**Fix**:
```html
<!-- In index.html -->
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
```

### Touch Targets Too Small
**Fix**:
```typescript
// Minimum 44px touch targets
<Button className="min-h-[44px] min-w-[44px]">
  Click Me
</Button>
```

### Horizontal Scroll
**Fix**:
```css
/* Prevent overflow */
body {
  overflow-x: hidden;
}

/* Use break-words */
.text-content {
  word-break: break-word;
}
```

## 🔍 Debugging Tips

### Enable Debug Mode
```javascript
// In console
localStorage.setItem('debug', 'true');

// In code
const DEBUG = localStorage.getItem('debug') === 'true';
if (DEBUG) console.log('Debug:', data);
```

### Check React Query State
```javascript
// In React DevTools console
$r.queryClient.getQueryCache().getAll()
```

### Monitor Supabase Queries
```javascript
// Log all queries
const { data, error } = await supabase
  .from('table')
  .select('*')
  .then(result => {
    console.log('Query:', { table: 'table', result });
    return result;
  });
```

---

*Keep this document updated with new issues and solutions as they're discovered.*
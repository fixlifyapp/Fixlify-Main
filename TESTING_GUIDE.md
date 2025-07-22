# Safe Optimization Testing Guide

## Pre-Optimization Checklist

### 1. Create Backup
```bash
# Create a backup branch
git checkout -b pre-optimization-backup
git add .
git commit -m "Backup before optimization"
git push origin pre-optimization-backup

# Return to main
git checkout main
```

### 2. Baseline Metrics
Run and record these metrics BEFORE changes:

```bash
# Build and measure
npm run build

# Record:
# - Total build time: _____ seconds
# - Main bundle size: _____ MB
# - Number of chunks: _____
# - Largest chunk: _____
```

### 3. Test Critical Paths
Test these features work correctly:
- [ ] Login/Logout
- [ ] Create new job
- [ ] Edit client
- [ ] Send SMS
- [ ] View schedule
- [ ] Generate invoice
- [ ] View reports

## Phase 1: Safe Import Fixes

### Step 1: Fix Sonner Imports
1. Search for all toast usage:
```bash
grep -r "toast\." src/ --include="*.ts" --include="*.tsx"
```

2. Ensure all imports are static:
```typescript
// Good:
import { toast } from 'sonner'

// Bad:
const { toast } = await import('sonner')
```

### Step 2: Test After Each Change
After fixing each file:
1. Save the file
2. Check browser console for errors
3. Test the specific feature
4. Commit if working

### Step 3: Fix Supabase Client Imports
Similar process for supabase imports.

## Testing Commands

### Quick Test
```bash
# Development test
npm run dev
# Open http://localhost:8080
# Check console for errors
```

### Full Test
```bash
# Type check
npx tsc --noEmit

# Lint check  
npm run lint

# Build test
npm run build

# Preview production build
npm run preview
```

## Rollback Plan

If anything breaks:
```bash
# Revert to backup
git checkout pre-optimization-backup

# Or revert specific file
git checkout main -- path/to/file.tsx
```

## Success Criteria
- ✅ No console errors
- ✅ All features working
- ✅ Build succeeds
- ✅ Bundle size reduced
- ✅ No visual changes

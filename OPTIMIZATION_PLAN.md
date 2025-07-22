# Code Optimization Plan - Fixlify

## Overview
This plan addresses build warnings and performance issues without breaking functionality or design.

## Phase 1: Fix Mixed Import Patterns (Safe)

### 1.1 Sonner Toast Imports
**Issue**: Mixed static/dynamic imports
**Solution**: Standardize to static imports only

#### Files to Update:
- `src/components/ui/sonner.tsx` - Main component
- `src/hooks/use-toast.ts` - Toast hook
- All files using toast notifications

#### Implementation:
```typescript
// Instead of dynamic imports:
// const { toast } = await import('sonner')

// Use static imports:
import { toast } from 'sonner'
```

### 1.2 Supabase Client Imports
**Issue**: Mixed import patterns for `supabase/client.ts`
**Solution**: Use static imports consistently

#### Files to Check:
- `src/utils/auth-fix.ts`
- `src/components/schedule/modal/useScheduleJobSubmit.ts`

### 1.3 ID Generation Imports
**Issue**: Mixed imports for `idGeneration.ts`
**Solution**: Static imports only

## Phase 2: Bundle Size Optimization (Medium Risk)

### 2.1 Route-Based Code Splitting
**Current**: All routes loaded at once
**Solution**: Lazy load routes

#### Implementation:
```typescript
// src/App.tsx
import { lazy, Suspense } from 'react'

// Lazy load heavy pages
const JobsPage = lazy(() => import('./pages/JobsPageOptimized'))
const ClientsPage = lazy(() => import('./pages/ClientsPage'))
const SchedulePage = lazy(() => import('./pages/SchedulePage'))

// Wrap with Suspense
<Suspense fallback={<LoadingSpinner />}>
  <Route path="/jobs" element={<JobsPage />} />
</Suspense>
```

### 2.2 Component-Level Code Splitting
**Target**: Large components that aren't immediately needed

#### Components to Split:
1. **AI Components** (not used on all pages):
   - `AIAgentWidget`
   - `VoiceDispatchInterface`
   - `AIAutomationBuilder`

2. **Reports & Analytics**:
   - `AdvancedReportsPanel`
   - `ReportScheduler`

3. **Settings Pages**:
   - All settings subpages

### 2.3 Vite Configuration Optimization

#### Create Manual Chunks:
```javascript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom', 'react-router-dom'],
          'supabase': ['@supabase/supabase-js'],
          'ui': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          'charts': ['recharts', 'd3'],
          'forms': ['react-hook-form', '@hookform/resolvers', 'zod'],
          'utils': ['date-fns', 'lodash-es']
        }
      }
    }
  }
})
```

## Phase 3: Performance Monitoring

### 3.1 Add Bundle Analyzer
```bash
npm install --save-dev rollup-plugin-visualizer
```

### 3.2 Measure Before/After
- Current bundle: 2.28 MB
- Target: < 1.5 MB main bundle
- Goal: 200-300 KB per lazy chunk

## Implementation Order

### Week 1: Safe Changes
1. Fix all mixed imports (Phase 1)
2. Test thoroughly
3. Deploy

### Week 2: Code Splitting
1. Implement route-based splitting
2. Test all routes
3. Monitor performance

### Week 3: Advanced Optimization
1. Component-level splitting
2. Manual chunks configuration
3. Final optimization

## Testing Checklist
- [ ] All pages load correctly
- [ ] Navigation works smoothly
- [ ] No flash of unstyled content
- [ ] Toast notifications work
- [ ] Supabase auth works
- [ ] All forms submit properly
- [ ] No console errors

## Rollback Plan
1. Git commit before each phase
2. Tag releases: `pre-optimization`, `phase-1-complete`, etc.
3. Test in staging first
4. Monitor error rates in production

## Success Metrics
- Bundle size reduction: 30-40%
- Initial load time: < 3 seconds
- Time to interactive: < 4 seconds
- Lighthouse score: > 90

# Fixlify Project Rules & Guidelines

## 🎯 Core Principles
1. **User First** - Every decision should improve user experience
2. **Mobile First** - Design for mobile, enhance for desktop
3. **Performance Matters** - Fast loading, smooth interactions
4. **Consistency** - Same patterns everywhere
5. **Maintainability** - Code others can understand

## 📱 Responsive Design Rules

### Breakpoints
- **Mobile**: 320px - 767px
- **Tablet**: 768px - 1023px  
- **Desktop**: 1024px+
- **Wide**: 1280px+

### Touch Targets
- Minimum 44x44px for all clickable elements
- Add padding not margin for click areas
- Space between targets: minimum 8px

### Mobile Specific
```typescript
// Always test these on mobile:
- Form inputs (keyboard doesn't cover)
- Modals (scrollable, closeable)
- Tables (horizontal scroll or responsive)
- Navigation (thumb-reachable)
- Buttons (not too small)
```

## 🎨 UI Consistency Rules

### Color Usage
- **Primary Actions**: `bg-fixlyfy` (purple)
- **Success**: `bg-green-600`
- **Danger**: `bg-red-600`
- **Warning**: `bg-orange-600`
- **Info**: `bg-blue-600`

### Spacing System
```
p-2 = 0.5rem (8px)
p-3 = 0.75rem (12px)
p-4 = 1rem (16px)
p-6 = 1.5rem (24px)
p-8 = 2rem (32px)
```

### Typography
- **Headings**: font-semibold or font-bold
- **Body**: text-base (16px)
- **Small**: text-sm (14px)
- **Tiny**: text-xs (12px)

### Card Design
```typescript
// Standard card
<Card className="border-fixlyfy-border shadow-sm hover:shadow-md transition-shadow">
  <CardHeader className="pb-2">
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
</Card>
```

## 💾 Data Management Rules

### State Updates
1. **Optimistic Updates** for better UX
2. **Rollback** on server errors
3. **Sync** with real-time subscriptions
4. **Cache** for 5 minutes by default
5. **Invalidate** related queries

### Form Handling
```typescript
// Required for all forms:
1. Loading state during submission
2. Disable form while submitting
3. Show success/error messages
4. Reset form on success
5. Focus first error field
```

### Data Fetching
- **Paginate** lists over 50 items
- **Prefetch** next page on hover
- **Show skeletons** while loading
- **Handle errors** gracefully
- **Provide retry** options

## 🔐 Security Rules

### Input Validation
```typescript
// Client side
- Zod schemas for all forms
- Sanitize HTML content
- Validate file uploads

// Server side
- Never trust client data
- Check permissions
- Validate against schemas
- SQL injection prevention
```

### Authentication Flow
1. Check token expiry
2. Refresh if needed
3. Redirect if failed
4. Clear on logout
5. Persist selection optional

## 🏗️ Component Rules

### Component Size
- **Small**: < 100 lines
- **Medium**: 100-200 lines
- **Large**: > 200 lines → Split it!

### Props Rules
```typescript
// ✅ Good
interface Props {
  id: string;
  onSuccess?: () => void;
  className?: string;
}

// ❌ Bad
interface Props {
  data: any;
  // 20+ props...
}
```

### Composition
- Prefer composition over inheritance
- Use compound components for complex UI
- Extract reusable logic to hooks
- Keep components focused

## 📊 Performance Rules

### Images
```typescript
// Always
- Lazy load below fold
- Use proper dimensions
- Compress before upload
- Provide alt text
- Use next-gen formats
```

### Animations
```typescript
// CSS over JS animations
className="transition-all duration-300"

// Use transform for animations
transform: translateX(0);

// Avoid animating layout properties
// ❌ width, height, padding
// ✅ transform, opacity
```

### Bundle Size
- Check bundle impact before adding libraries
- Use dynamic imports for large components
- Tree-shake unused code
- Minimize CSS

## 🧪 Testing Rules

### Manual Testing Checklist
- [ ] All screen sizes
- [ ] Keyboard navigation
- [ ] Screen reader
- [ ] Slow network
- [ ] Error scenarios
- [ ] Edge cases
- [ ] Different browsers

### Console Rules
- **NO** errors in production
- **NO** warnings in production
- **Minimal** logs in production
- **Debug mode** for development

## 📝 Documentation Rules

### Code Comments
```typescript
// Why, not what
// ❌ Increment counter by 1
// ✅ Offset by 1 due to zero-indexing

// Document complex logic
/**
 * Calculates commission based on tiered structure
 * @param amount - Total sale amount
 * @param tier - Agent tier level
 * @returns Commission amount
 */
```

### File Headers
```typescript
/**
 * ClientsList Component
 * 
 * Displays paginated list of clients with search/filter
 * Used in: ClientsPage, Dashboard
 * 
 * Features:
 * - Bulk selection
 * - Real-time updates
 * - Grid/List view toggle
 */
```

## 🔄 Update Rules

### When Updating Components
1. Check where it's used
2. Test all use cases
3. Update TypeScript types
4. Update documentation
5. Check mobile view
6. Test error states

### Database Changes
1. Write migration
2. Update types
3. Update RLS policies
4. Test locally
5. Document changes

## 🚀 Deployment Rules

### Pre-deployment
- [ ] No console errors
- [ ] All forms working
- [ ] Mobile tested
- [ ] Types checking passes
- [ ] Build successful

### Post-deployment
- [ ] Check live site
- [ ] Test critical paths
- [ ] Monitor errors
- [ ] Check performance
- [ ] Update documentation

## 🆘 Emergency Rules

### If Something Breaks
1. **DON'T PANIC**
2. Check recent changes
3. Revert if critical
4. Fix forward if possible
5. Document what happened
6. Add to COMMON_FIXES.md

### Hotfix Process
1. Create minimal fix
2. Test critical paths
3. Deploy immediately
4. Full fix later
5. Document in knowledge

---

*These rules ensure consistent, high-quality development. When in doubt, ask!*
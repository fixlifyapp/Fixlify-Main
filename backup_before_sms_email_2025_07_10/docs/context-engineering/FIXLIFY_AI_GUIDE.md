# Fixlify AI Context System - Quick Start Guide

## 🚀 Quick Commands

### Context Commands
- **"check context engineering"** → Reviews all context files and current setup
- **"apply fixlify context"** → Loads context and prepares for work
- **"check patterns for [feature]"** → Shows relevant patterns
- **"check fixes for [error]"** → Searches for known solutions
- **"update context with [learning]"** → Adds new knowledge
- **"document this fix"** → Updates PROJECT_KNOWLEDGE.md

### Analysis Commands
- **"analyze component [name]"** → Reviews component for issues
- **"check performance"** → Looks for optimization opportunities
- **"review security"** → Checks for security issues
- **"mobile check"** → Verifies mobile responsiveness

### Implementation Commands
- **"implement using patterns"** → Follows established patterns
- **"fix using context"** → Applies context rules to fix issues
- **"refactor to patterns"** → Updates code to match patterns

## 🚀 How to Use This System

### Starting a New Session
1. **Load Context Files** in this order:
   - `FIXLIFY_CONTEXT.md` - Understand the rules and behavior
   - `FIXLIFY_PROJECT_KNOWLEDGE.md` - Learn what's been done
   - `FIXLIFY_PATTERNS.md` - See how to implement
   - `FIXLIFY_COMMON_FIXES.md` - Know what to avoid

### Working on a Task
```
1. CHECK: Has this been done before?
   → Look in PROJECT_KNOWLEDGE.md
   
2. UNDERSTAND: What are the rules?
   → Follow CONTEXT.md guidelines
   
3. IMPLEMENT: How should I build it?
   → Use patterns from PATTERNS.md
   
4. AVOID: What are the pitfalls?
   → Check COMMON_FIXES.md
   
5. DOCUMENT: What did I change?
   → Update PROJECT_KNOWLEDGE.md
```

## 📋 Quick Reference Card

### File Operations
- **Always use**: Desktop Commander
- **Never use**: Direct file system access
- **Chunk size**: 25-30 lines max

### Database Operations  
- **Always use**: Supabase MCP
- **Never forget**: organization_id
- **Use**: .maybeSingle() not .single()

### Testing Requirements
- [ ] Mobile (320px+)
- [ ] Tablet (768px+)  
- [ ] Desktop (1024px+)
- [ ] No console errors
- [ ] Loading states work
- [ ] Error handling works

### Common Commands
```bash
npm run dev          # Start development
npm run build        # Build production
npm run type-check   # Check TypeScript
```

### Emergency Fixes
```javascript
// Blank page fix
localStorage.clear();
window.location.href = '/login';

// Clear React Query
queryClient.clear();

// Debug mode
localStorage.setItem('debug', 'true');
```

## 🎯 Decision Tree

```
Is it a UI component?
  → Check PATTERNS.md for component patterns
  
Is it a database query?
  → Check PATTERNS.md for Supabase patterns
  
Is it broken?
  → Check COMMON_FIXES.md first
  → Then check PROJECT_KNOWLEDGE.md
  
Is it a new feature?
  → Follow CONTEXT.md workflow
  → Use PATTERNS.md templates
  → Document in PROJECT_KNOWLEDGE.md
```

## 🔄 Update Cycle

After every change:
1. **Test** on all devices
2. **Document** in PROJECT_KNOWLEDGE.md
3. **Add** new patterns if created
4. **Record** new fixes if discovered
5. **Update** context if rules change

---

*This system ensures consistent, high-quality development across all AI sessions.*
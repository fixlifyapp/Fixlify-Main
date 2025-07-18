# 🤖 Fixlify AI Context Guide

## Optimal Context Usage

### 1. **Initial Context Load**
When starting a new conversation, provide:
```
Project: Fixlify AI Automate
Location: C:\Users\petru\Downloads\TEST FIX SITE\3\Fixlify-Main-main
Tools: Desktop Commander (local files), Supabase MCP (database)
Reference: FIXLIFY_PROJECT_KNOWLEDGE.md for project details
```

### 2. **Task-Specific Context**

#### For Bug Fixes:
```
Issue: [Describe the issue]
Affected Area: [e.g., Client Management, Jobs, Automations]
Error Messages: [Any console errors]
Steps to Reproduce: [How to trigger the bug]
Reference: Check FIXLIFY_COMMON_FIXES.md first
```

#### For New Features:
```
Feature: [Feature name]
Module: [Which module it belongs to]
Database Changes: [Yes/No]
UI Changes: [Yes/No]
Reference: Follow patterns in FIXLIFY_PATTERNS.md
```

#### For Database Work:
```
Operation: [Create/Update/Delete]
Tables Affected: [List tables]
RLS Required: [Yes/No]
Migration Needed: [Yes/No]
Use: Supabase MCP for all database operations
```

### 3. **Context Preservation**

When conversation gets long, summarize progress:
```
Progress Summary:
✅ Completed: [What was done]
🔄 Current: [What we're doing now]
📋 Next: [What needs to be done]
```

### 4. **Error Prevention Context**

Always include these rules:
- No duplicate files/systems
- Test on all devices (PC, tablet, mobile)
- Update knowledge base after fixes
- Deep analyze if problems repeat
- Ask before removing large systems

### 5. **Performance Context**

For performance-sensitive operations:
```
Performance Requirements:
- File chunks: ≤30 lines for writes
- Query timeout: 10 seconds max
- Batch operations: Use when >100 items
- Indexes: Check before adding queries
```

## Context Templates

### Bug Fix Template
```markdown
## Bug Fix: [Issue Name]

**Context**: Working on Fixlify app at [location]
**Issue**: [Describe the problem]
**Impact**: [Who/what is affected]
**Priority**: [High/Medium/Low]

**Investigation**:
1. Check error logs
2. Review recent changes
3. Test in different environments

**Solution**: [Proposed fix]

**Testing**: [How to verify the fix]
```

### Feature Implementation Template
```markdown
## Feature: [Feature Name]

**Context**: Adding to Fixlify [module]
**Requirements**:
- [ ] Requirement 1
- [ ] Requirement 2

**Technical Approach**:
- Frontend: [React components needed]
- Backend: [Database changes]
- API: [New endpoints]

**Dependencies**: [External libraries/services]
```

### Database Migration Template
```sql
-- Migration: [migration_name]
-- Purpose: [What this migration does]
-- Date: [Current date]

-- Add your migration SQL here

-- Rollback (if needed):
-- SQL to undo this migration
```

## Best Practices

1. **Start Small**: Don't dump entire codebase as context
2. **Be Specific**: Provide relevant files/sections only
3. **Update Regularly**: Keep context documents current
4. **Use References**: Point to existing documentation
5. **Preserve State**: Summarize long conversations

## Quick Reference Commands

```bash
# Validate context
npm run validate-context

# Update knowledge base
npm run update-knowledge

# Generate report
npm run context-report

# Check recent fixes
ls -la FIX_*.md | tail -10

# Find context files
find . -name "*CONTEXT*" -o -name "*KNOWLEDGE*"
```

## Common Context Mistakes to Avoid

1. ❌ Providing entire file contents when only a function is needed
2. ❌ Forgetting to mention which tools are available
3. ❌ Not updating context after significant changes
4. ❌ Missing error messages or console output
5. ❌ Vague problem descriptions without reproduction steps

## Context Optimization Tips

1. **Use Anchors**: Reference specific sections in documentation
2. **Layer Context**: Start general, add specifics as needed
3. **Version Context**: Include framework/library versions
4. **Environment Context**: Specify dev/staging/production
5. **Historical Context**: Reference previous fixes for similar issues

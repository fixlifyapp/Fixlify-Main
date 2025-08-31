# Context Engineering System Guide

## 🎯 Purpose
The Context Engineering Specialist manages all documentation, ensuring knowledge is preserved, accessible, and current.

## 📚 Your Context Library (Key Files)

### Primary Knowledge Base
- **FIXLIFY_PROJECT_KNOWLEDGE.md** - Main project overview
- **CONTEXT_SEND_ESTIMATE_INVOICE.md** - Estimate/Invoice system documentation
- **FIXLIFY_AUTOMATION_SYSTEM_PLAN.md** - Complete automation architecture

### System Documentation (150+ files)
```
Categories:
├── CONTEXT_*.md (5 files) - Feature-specific contexts
├── *_SUMMARY.md (25 files) - Implementation summaries  
├── *_GUIDE.md (15 files) - How-to guides
├── *_PLAN.md (10 files) - Architecture plans
├── *_FIX*.md (20 files) - Fix documentation
├── *_TEST*.md (8 files) - Testing guides
└── *_DEPLOYMENT*.md (5 files) - Deployment docs
```

## 🔍 How to Use Context Engineering

### 1. Finding Information
```bash
# General queries
"context-specialist: How does the SMS system work?"
"context-specialist: What was fixed in the automation system?"
"context-specialist: Show me the estimate sending process"

# Specific searches
"context-specialist: Find all email-related documentation"
"context-specialist: What's the current status of AI dispatcher?"
"context-specialist: Show recent fixes from last week"
```

### 2. Updating Documentation
```bash
# After fixes
"context-specialist: Document that SMS is now working with Telnyx"
"context-specialist: Update automation guide with new workflow steps"

# After new features
"context-specialist: Create documentation for subscription billing"
"context-specialist: Add customer portal to main knowledge base"
```

### 3. Validation & Maintenance
```bash
# Check accuracy
"context-specialist: Validate automation docs match current code"
"context-specialist: Find outdated guides that need updating"

# Cleanup
"context-specialist: Archive old SMS fix attempts"
"context-specialist: Consolidate duplicate documentation"
```

## 📋 Context File Structure

### Standard Template
```markdown
# Context Engineering: [Feature Name]

## Overview
Brief description of what this feature/system does

## Current Status
✅ Working | 🚧 In Progress | ❌ Broken | 📅 Last Updated: [Date]

## Key Components
- Component 1: Description
- Component 2: Description

## How It Works
1. Step-by-step explanation
2. Of the process
3. With details

## Technical Implementation
- Database tables used
- Edge functions involved
- API endpoints
- Frontend components

## Testing
How to test this feature:
1. Test step 1
2. Test step 2

## Common Issues & Solutions
- **Issue**: Description
  **Solution**: How to fix

## Related Documents
- Link to related context files
- Link to code files
- Link to guides

## Change History
- [Date]: What changed
- [Date]: What was fixed
```

## 🔄 Context Workflow

### When Code Changes
```mermaid
Code Change → Integration Guardian Detects
           → Context Specialist Updates Docs
           → Orchestra Uses Updated Context
           → All Agents Have Current Info
```

### Documentation Process
1. **Detect Change** - Monitor for system changes
2. **Analyze Impact** - Determine what docs need updating
3. **Update Context** - Modify relevant documentation
4. **Validate** - Ensure docs match reality
5. **Distribute** - Make available to all agents

## 📊 Current Documentation Status

### ✅ Well Documented
- SMS/Email system (25+ docs)
- Automation system (15+ docs)
- Job management (10+ docs)
- Edge functions (20+ docs)

### 🚧 Needs Update
- AI Dispatcher (partial docs)
- Portal system (basic docs)
- Payment processing (minimal)

### ❌ Missing Documentation
- Subscription billing
- Analytics system
- Some edge functions

## 💡 Best Practices

### Do's
- ✅ Update docs within 24 hours of changes
- ✅ Include code examples in guides
- ✅ Add troubleshooting sections
- ✅ Link related documents
- ✅ Date all updates

### Don'ts
- ❌ Leave docs outdated
- ❌ Create duplicate documentation
- ❌ Use unclear terminology
- ❌ Forget to update status
- ❌ Skip validation

## 🎯 Quick Commands

### Most Used
```bash
# Get system overview
"context-specialist: Show project knowledge"

# Find specific info
"context-specialist: How do estimates work?"

# Update after fix
"context-specialist: Document the email fix"

# Check status
"context-specialist: What's broken right now?"

# Create new docs
"context-specialist: Document new feature X"
```

## 📈 Metrics

### Documentation Coverage
- **Features Documented**: 85%
- **Guides Available**: 15+ complete guides
- **Fix Documentation**: 20+ issues documented
- **Average Update Time**: < 24 hours

### Quality Metrics
- **Accuracy**: Validated monthly
- **Completeness**: 90% have all sections
- **Accessibility**: All findable via search
- **Currency**: 80% updated in last 30 days

## 🔗 Integration with Other Agents

### Information Providers
- **Orchestra Conductor** - Uses context for delegation
- **Integration Guardian** - Validates against documentation
- **All Agents** - Reference context for their work

### Information Sources
- **Supabase Architect** - Provides schema updates
- **Frontend Specialist** - Documents UI components
- **Functions Inspector** - Documents edge functions
- **Customer Success** - Provides user perspective

## 🚀 Power Commands

### Full Documentation Audit
```bash
"context-specialist: Run complete documentation audit and report what needs updating"
```

### Generate Missing Docs
```bash
"context-specialist: Find undocumented features and create basic documentation"
```

### Consolidate Knowledge
```bash
"context-specialist: Merge duplicate docs and create single source of truth"
```

## The Context Engineering Specialist is your knowledge guardian, ensuring nothing is lost and everything is findable!
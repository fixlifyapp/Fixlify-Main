# FIXLIFY CONTEXT ENGINEERING UPDATE
**Date:** January 2025
**Version:** 2.0

## 🎯 Context Engineering Overview

This document defines how context files should be used and maintained in the Fixlify project.

## 📋 Active Context Files

### 1. **FIXLIFY_PROJECT_KNOWLEDGE.md** (Primary Documentation)
- **Purpose**: Central source of truth for project knowledge
- **Updates**: After every significant fix or feature
- **Contains**: 
  - Technical stack details
  - Architecture decisions
  - Fix documentation
  - Feature implementations
  - Known issues and solutions

### 2. **FIXLIFY_CONTEXT.md** (Development Guidelines)
- **Purpose**: Quick reference for development rules
- **Updates**: When patterns or rules change
- **Contains**:
  - Development commands
  - Coding standards
  - Business logic rules
  - UI/UX guidelines
  - Testing requirements

### 3. **FIXLIFY_PATTERNS.md** (Code Patterns)
- **Purpose**: Reusable code patterns and examples
- **Updates**: When new patterns emerge
- **Contains**:
  - Component templates
  - Hook patterns
  - API integration patterns
  - State management patterns

### 4. **FIXLIFY_COMMON_FIXES.md** (Solution Library)
- **Purpose**: Quick fixes for common issues
- **Updates**: After solving recurring problems
- **Contains**:
  - Error solutions
  - Performance fixes
  - Browser-specific fixes
  - Deployment issues

## 🔄 Update Protocol

### When to Update Context:
1. **After Major Fixes**: Document in PROJECT_KNOWLEDGE.md
2. **New Patterns**: Add to PATTERNS.md with examples
3. **Recurring Issues**: Add solution to COMMON_FIXES.md
4. **Rule Changes**: Update CONTEXT.md guidelines

### Update Template:
```markdown
## 🔧 [Feature/Fix Name] (Date)

### Problem
Brief description of the issue

### Solution
What was implemented

### Key Changes
- File 1: Change description
- File 2: Change description

### Learnings
What to remember for future

### Related Files
- List of affected files
```

## 📐 Context Best Practices

### 1. **Keep It Current**
- Update immediately after changes
- Remove outdated information
- Mark deprecated sections

### 2. **Be Specific**
- Include file paths
- Show code examples
- Document error messages

### 3. **Make It Searchable**
- Use consistent headings
- Include keywords
- Add tags for categories

### 4. **Version Important Changes**
- Date all updates
- Keep changelog at bottom
- Link to related commits

## 🚀 Quick Context Commands

```bash
# Update main knowledge base
echo "## New Section" >> FIXLIFY_PROJECT_KNOWLEDGE.md

# Search for patterns
grep -r "pattern" *.md

# Check last updates
git log -p FIXLIFY_*.md

# Create context backup
cp FIXLIFY_*.md backup/
```

## 📊 Context Health Metrics

### Good Context:
- ✅ Updated within last week
- ✅ Clear section organization
- ✅ Working code examples
- ✅ Accurate file paths
- ✅ Linked related sections

### Poor Context:
- ❌ Outdated information
- ❌ Missing recent fixes
- ❌ Broken examples
- ❌ No update dates
- ❌ Conflicting information

## 🔍 Context Search Strategy

When looking for information:
1. **Start with**: FIXLIFY_PROJECT_KNOWLEDGE.md
2. **Check rules**: FIXLIFY_CONTEXT.md
3. **Find patterns**: FIXLIFY_PATTERNS.md
4. **Quick fixes**: FIXLIFY_COMMON_FIXES.md
5. **Recent changes**: Git history

## 🎨 Layout & Responsive Design Context

### Current State (After Latest Pull):
- Removed conflicting CSS files (critical-layout-fix.css, layout-fix.css)
- Added unified responsive-layout.css
- Improved container system with proper breakpoints
- Fixed spacing scale for different devices

### Key Principles:
1. **Mobile First**: Design for smallest screen, enhance upward
2. **Container Based**: Use .container-responsive for content width
3. **Semantic Spacing**: Use space-mobile/tablet/desktop/wide classes
4. **Breakpoint Consistency**: 640px, 768px, 1024px, 1280px

### Common Issues & Solutions:
1. **Mobile Sidebar**: Background color must be explicitly set
2. **Content Width**: Always use max-width on desktop
3. **Touch Targets**: Minimum 44px on mobile
4. **Padding Scale**: 1rem → 1.5rem → 2rem → 3rem

---

## 📝 Changelog

### 2025-01-07
- Added comprehensive context engineering guide
- Documented active context files and their purposes
- Added update protocol and best practices
- Included layout/responsive design context
- Created quick reference commands

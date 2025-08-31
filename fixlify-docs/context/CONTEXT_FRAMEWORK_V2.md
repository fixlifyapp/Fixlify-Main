# 🚀 Fixlify Context Engineering Framework v2.0

## Overview
The Fixlify Context Engineering Framework provides advanced tools for managing, analyzing, and optimizing project documentation and AI context.

## New Features

### 1. Context Versioning System
Track changes to documentation with git-like functionality.

```bash
# Create a snapshot
npm run context:version snapshot "Before major refactor"

# List all versions
npm run context:version list

# Compare versions
npm run context:version diff <versionId> <filename>

# Restore a version
npm run context:version restore <versionId> [filename]
```

### 2. Context Search Tool
Full-text search across all documentation.

```bash
# Interactive search mode
npm run context:search

# Direct search
npm run context:search "job revenue"

# Rebuild search index
npm run context:search rebuild
```

### 3. Interactive Context Browser
Web-based documentation viewer.

```bash
# Open browser
npm run context:browser
```

### 4. Context Quality Metrics
Analyze documentation quality and get improvement suggestions.

```bash
# Run quality analysis
npm run context:quality
```

Quality metrics include:
- **Readability Score**: Based on sentence complexity
- **Coverage Score**: Checks for required sections
- **Freshness Score**: Based on last update time
- **Structure Score**: Analyzes document organization

### 5. AI Context Optimizer
Automatically extract relevant context for specific tasks.

```bash
# Interactive mode
npm run context:optimize

# Direct optimization
npm run context:optimize "fix job revenue tracking"
```

The optimizer:
- Classifies task type (bugfix, feature, database, etc.)
- Selects relevant documentation
- Extracts key sections
- Generates compressed context

## Quick Commands

```bash
# Validate all context files
npm run context:validate

# Update knowledge base
npm run context:update

# Generate comprehensive report
npm run context:report

# Run all context tools
npm run context:all
```

## File Structure

```
📁 Context Framework
├── 📄 Core Documentation
│   ├── FIXLIFY_PROJECT_KNOWLEDGE.md - Main knowledge base
│   ├── FIXLIFY_RULES.md - Development rules
│   ├── FIXLIFY_PATTERNS.md - Design patterns
│   └── CONTEXT_INDEX.md - Documentation index
├── 📁 Scripts
│   ├── validate-context.js - Validation tool
│   ├── update-knowledge.js - Auto-updater
│   ├── context-report.js - Report generator
│   ├── context-version.js - Version control
│   ├── context-search.js - Search engine
│   ├── context-quality.js - Quality analyzer
│   └── context-optimizer.js - AI optimizer
└── 📄 Generated Files
    ├── .context-versions/ - Version snapshots
    ├── .context-search-index.json - Search index
    └── context-quality-report.json - Quality report
```

## Best Practices

### 1. Regular Updates
```bash
# Weekly maintenance
npm run context:all

# Before major changes
npm run context:version snapshot "Pre-release backup"
```

### 2. Quality Standards
- Keep readability score above 70
- Update documentation within 30 days
- Include all required sections
- Fix hierarchy issues promptly

### 3. Search Optimization
- Use descriptive headers
- Include keywords in content
- Tag documents appropriately
- Rebuild index after major updates

### 4. AI Context Usage
```javascript
// Optimal context for bug fixes
Project: Fixlify AI Automate
Task: Fix [specific issue]
Reference: Run `npm run context:optimize "fix [issue]"`
Tools: Desktop Commander, Supabase MCP
```

## Troubleshooting

### Context validation fails
```bash
# Check which files are missing
npm run context:validate

# Generate missing files from templates
cp TEMPLATE_*.md [missing_file].md
```

### Search not finding content
```bash
# Rebuild search index
npm run context:search rebuild

# Check if file is indexed
npm run context:search tags
```

### Quality score too low
```bash
# Get specific recommendations
npm run context:quality

# Focus on top issues first
# - Readability: Shorten sentences
# - Coverage: Add missing sections
# - Freshness: Update old content
```

## Integration with AI

### Before Starting Task
1. Run optimizer: `npm run context:optimize "your task"`
2. Copy suggested context load
3. Include relevant files in conversation
4. Reference specific sections as needed

### During Development
1. Search for similar fixes: `npm run context:search "similar issue"`
2. Check patterns: Review FIXLIFY_PATTERNS.md
3. Follow rules: Reference FIXLIFY_RULES.md

### After Completion
1. Update knowledge: `npm run context:update`
2. Create snapshot: `npm run context:version snapshot "Fixed X"`
3. Run quality check: `npm run context:quality`

## Future Enhancements
- [ ] Auto-generate context from git commits
- [ ] AI-powered documentation writer
- [ ] Context sharing between team members
- [ ] Integration with IDEs
- [ ] Real-time collaboration features

---

For more information, see [CONTEXT_INDEX.md](./CONTEXT_INDEX.md)

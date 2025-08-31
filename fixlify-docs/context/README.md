# 🧠 Context Engineering Documentation

> AI context management, patterns, and knowledge base for Fixlify

## Core Context Documents

### Master Knowledge Base
- **[FIXLIFY_PROJECT_KNOWLEDGE.md](/docs/context-engineering/FIXLIFY_PROJECT_KNOWLEDGE.md)** - Comprehensive project knowledge
- **[PROJECT_OVERVIEW_MASTER.md](/docs/context-engineering/PROJECT_OVERVIEW_MASTER.md)** - Master project overview
- **[FIXLIFY_CONTEXT.md](/docs/context-engineering/FIXLIFY_CONTEXT.md)** - Core context information

### Context Engineering Framework
- **[CONTEXT_ENGINEERING_GUIDE.md](/docs/context-engineering/CONTEXT_ENGINEERING_GUIDE.md)** - Engineering principles
- **[CONTEXT_FRAMEWORK_V2.md](/docs/context-engineering/CONTEXT_FRAMEWORK_V2.md)** - Framework version 2
- **[CONTEXT_CHECK_PROTOCOL.md](/docs/context-engineering/CONTEXT_CHECK_PROTOCOL.md)** - Validation protocol
- **[CONTEXT_INDEX.md](/docs/context-engineering/CONTEXT_INDEX.md)** - Context index

### AI Integration Guides
- **[FIXLIFY_AI_GUIDE.md](/docs/context-engineering/FIXLIFY_AI_GUIDE.md)** - AI implementation guide
- **[FIXLIFY_AI_CONTEXT_GUIDE.md](/docs/context-engineering/FIXLIFY_AI_CONTEXT_GUIDE.md)** - AI context management

### Patterns & Best Practices
- **[FIXLIFY_PATTERNS.md](/docs/context-engineering/FIXLIFY_PATTERNS.md)** - Development patterns
- **[FIXLIFY_LAYOUT_PATTERNS.md](/docs/context-engineering/FIXLIFY_LAYOUT_PATTERNS.md)** - UI layout patterns
- **[FIXLIFY_RULES.md](/docs/context-engineering/FIXLIFY_RULES.md)** - Development rules

### Quick Reference
- **[FIXLIFY_QUICK_REFERENCE.md](/docs/context-engineering/FIXLIFY_QUICK_REFERENCE.md)** - Quick lookup guide

### General Guides
- **[CONTEXT_ENGINEERING_GUIDE.md](/CONTEXT_ENGINEERING_GUIDE.md)** - Root context guide

## Context Structure

### 1. Project Context
```yaml
Project: Fixlify
Type: Repair Shop Management System
Stack: React, TypeScript, Supabase
Architecture: Multi-tenant SaaS
```

### 2. Technical Context
```yaml
Frontend:
  - Framework: React 18
  - Language: TypeScript
  - Styling: Tailwind CSS
  - Components: shadcn/ui
  
Backend:
  - Database: PostgreSQL (Supabase)
  - Functions: Edge Functions (Deno)
  - Auth: Supabase Auth
  - Storage: Supabase Storage
```

### 3. Business Context
```yaml
Domain: Repair Shop Management
Features:
  - Client Management
  - Job Tracking
  - Invoice/Estimates
  - Inventory Management
  - Team Collaboration
  - Automation Workflows
```

## Context Engineering Principles

### 1. Clarity
- Clear, unambiguous language
- Structured information
- Consistent terminology
- Explicit relationships

### 2. Completeness
- All necessary information
- No missing dependencies
- Full error scenarios
- Edge cases covered

### 3. Relevance
- Task-specific context
- Filtered information
- Priority indicators
- Version awareness

### 4. Maintainability
- Regular updates
- Version control
- Change tracking
- Documentation

## AI Context Management

### Context Loading
```typescript
// Load project context
const context = await loadContext({
  project: 'fixlify',
  modules: ['database', 'frontend', 'automation'],
  depth: 'detailed'
});
```

### Context Validation
```typescript
// Validate context completeness
const validation = validateContext(context, {
  required: ['database_schema', 'api_endpoints', 'ui_components'],
  optional: ['performance_metrics', 'analytics']
});
```

### Context Updates
```typescript
// Update context with new information
updateContext({
  module: 'automation',
  changes: {
    added: ['new_trigger_type'],
    modified: ['workflow_engine'],
    removed: ['deprecated_action']
  }
});
```

## Knowledge Base Structure

### Core Knowledge
1. **System Architecture**
   - Database schema
   - API structure
   - Component hierarchy
   - Service dependencies

2. **Business Logic**
   - Workflows
   - Validation rules
   - Calculations
   - State machines

3. **Integration Points**
   - External APIs
   - Webhooks
   - Event systems
   - Real-time subscriptions

### Pattern Library
1. **UI Patterns**
   - Form handling
   - Data tables
   - Navigation
   - Modals/dialogs

2. **Data Patterns**
   - CRUD operations
   - Pagination
   - Filtering
   - Sorting

3. **Integration Patterns**
   - API calls
   - Error handling
   - Retry logic
   - Caching

## Context Check Protocol

### Pre-Development Check
- [ ] Requirements understood
- [ ] Dependencies identified
- [ ] Patterns selected
- [ ] Risks assessed

### During Development
- [ ] Context alignment
- [ ] Pattern compliance
- [ ] Documentation updates
- [ ] Knowledge capture

### Post-Development
- [ ] Context validation
- [ ] Knowledge base update
- [ ] Pattern documentation
- [ ] Lessons learned

## Best Practices

### 1. Context Documentation
- Keep context files updated
- Document decisions
- Track changes
- Version control

### 2. Knowledge Sharing
- Share patterns
- Document solutions
- Create examples
- Update guides

### 3. Context Evolution
- Regular reviews
- Incorporate feedback
- Refine patterns
- Improve structure

## Quick Reference

### Common Contexts
```typescript
// Database context
const dbContext = {
  tables: ['clients', 'jobs', 'invoices'],
  relationships: 'one-to-many',
  policies: 'RLS enabled'
};

// UI context
const uiContext = {
  framework: 'React',
  styling: 'Tailwind',
  components: 'shadcn/ui',
  state: 'Zustand'
};

// Business context
const businessContext = {
  domain: 'repair_shop',
  workflows: ['job_creation', 'invoicing'],
  rules: ['validation', 'authorization']
};
```

### Context Templates
```yaml
Feature Context:
  Name: [Feature Name]
  Module: [Module Name]
  Dependencies: [List]
  Patterns: [Applicable Patterns]
  Risks: [Identified Risks]
  
Integration Context:
  Service: [Service Name]
  Protocol: [HTTP/WebSocket/etc]
  Authentication: [Method]
  Rate Limits: [Limits]
  Error Handling: [Strategy]
```

---

*For AI agent orchestration with context, see [Agent Documentation](/fixlify-docs/agents/)*
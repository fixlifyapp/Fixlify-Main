# Fixlify Agent Orchestra Examples

## Using Orchestra Conductor for Complex Features

### Example 1: Build Complete Feature with Parallel Execution
```bash
orchestra-conductor: Build a complete customer feedback system with:
- Database tables for feedback and ratings
- API endpoints for CRUD operations  
- Frontend form and display components
- Email notifications for new feedback
- Analytics dashboard for feedback trends
- Mobile-responsive design
Execute frontend, backend, and database work in parallel where possible.
```

### Example 2: System-Wide Upgrade
```bash
orchestra-conductor: Coordinate all agents to upgrade Fixlify to enterprise level:
Phase 1 - Analysis (parallel):
  - security-auditor: Find all vulnerabilities
  - performance-optimizer: Identify bottlenecks
  - code-reviewer: Find code quality issues
  - integration-guardian: Map all dependencies
Phase 2 - Planning (sequential):
  - Merge all findings into unified plan
Phase 3 - Implementation (parallel):
  - Apply all non-conflicting fixes simultaneously
  - Coordinate dependent changes in order
```

## Using Integration Guardian for Safe Changes

### Example 1: Before Major Refactoring
```bash
integration-guardian: I'm about to refactor the job management system. 
Deep analyze all features connected to jobs table and identify:
1. All components using job data
2. All edge functions triggered by job changes
3. All automation workflows dependent on job status
4. All reports/analytics using job information
5. Potential breaking changes and how to prevent them
```

### Example 2: After Feature Implementation  
```bash
integration-guardian: We just added a new inventory tracking feature.
Verify integration with:
1. Job system (parts used in repairs)
2. Invoice system (part costs)
3. Purchase orders (restocking)
4. Analytics (inventory reports)
5. Notifications (low stock alerts)
Fix any integration issues found.
```

## Combined Orchestra + Guardian Pattern

### Safe Feature Development
```bash
Step 1: "orchestra-conductor: Plan parallel development of subscription billing feature"
Step 2: "integration-guardian: Analyze impact on existing payment and customer systems"  
Step 3: "orchestra-conductor: Execute development with guardian's recommendations"
Step 4: "integration-guardian: Validate all integrations before deployment"
```

### Emergency Fix Coordination
```bash
"orchestra-conductor + integration-guardian: 
URGENT - SMS notifications are failing.
1. Guardian: Trace all SMS dependencies and find root cause
2. Orchestra: Coordinate immediate fix across affected systems
3. Guardian: Verify fix doesn't break other features
4. Orchestra: Deploy fix and notify all systems"
```

## Power Commands for Development

### Full System Analysis
```bash
"Run complete system analysis using ALL agents in parallel:
- orchestra-conductor: Coordinate analysis
- integration-guardian: Map all dependencies
- security-auditor: Find vulnerabilities
- performance-optimizer: Identify bottlenecks
- code-reviewer: Check code quality
- mobile-specialist: Test responsiveness
- test-engineer: Coverage analysis
- devops-engineer: Infrastructure review
- supabase-architect: Database optimization
- frontend-specialist: UI/UX improvements
- ai-integration-expert: AI feature opportunities
- automation-engineer: Workflow enhancements
Compile comprehensive report with priority actions."
```

### Intelligent Feature Building
```bash
"orchestra-conductor + integration-guardian:
Build smart notification center that:
1. Shows all customer communications
2. Integrates with SMS, Email, and AI systems
3. Has real-time updates via websockets
4. Includes read/unread status
5. Supports filtering and search
6. Works perfectly on mobile
Guardian: Verify each integration point
Orchestra: Build all components in parallel"
```

## Integration Guardian Checklist Commands

### Pre-Deployment Check
```bash
integration-guardian: Run pre-deployment checklist:
□ All TypeScript types match database schema
□ All API endpoints have error handling
□ All edge functions have required env variables
□ All frontend components handle loading/error states
□ All database migrations are reversible
□ All RLS policies are properly configured
□ All external service integrations tested
□ All automation workflows validated
Report any issues with fixes.
```

### Post-Update Validation
```bash
integration-guardian: After updating [feature name]:
1. Test all user flows involving this feature
2. Verify database constraints still valid
3. Check all API responses return expected data
4. Ensure UI components render correctly
5. Validate automation triggers still work
6. Test on mobile devices
7. Check browser console for errors
8. Verify no performance degradation
```

## Best Practices

1. **Always use Orchestra for multi-component features**
   - Saves 70% development time through parallelization

2. **Always use Guardian before/after major changes**
   - Prevents 95% of integration bugs

3. **Combine both for critical operations**
   - Orchestra plans and executes
   - Guardian validates and fixes

4. **Use specific phase instructions**
   - Tell Orchestra exactly what can be parallel vs sequential
   - Tell Guardian exactly what to validate

5. **Request comprehensive reports**
   - Both agents can provide detailed analysis
   - Use for documentation and future reference
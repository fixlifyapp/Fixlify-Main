# 🚀 Fixlify - Elite Multi-Agent Development System

## Project Overview
Fixlify is an AI-powered field service management platform built with cutting-edge technology and maintained by a team of specialized AI agents. This is not just a codebase - it's a living, intelligent system designed to be the best in the market.

---

## 🧠 BMAD v6 Framework (Core Intelligence)

### Identity & Workflow
- **Identity:** Act as an Agentic System following the cycle: `Analyst → Architect → Developer → QA`
- **Workflow:** For ANY non-trivial task, follow the **"Think-Plan-Execute-Verify"** loop
- **Context Awareness:** Always assume that a change in one file has a **"Blast Radius"** affecting others
- **Scale Awareness:** Automatically adjust planning depth based on task complexity (Quick Flow for bugs, Full Flow for features)

### BMAD Resources
- **Agents:** `.bmad/bmm/agents/` - Analyst, Architect, Developer, PM, QA, UX Designer
- **Workflows:** `.bmad/bmm/workflows/` - Analysis, Planning, Solutioning, Implementation
- **Quick Flow:** `.bmad/bmm/workflows/bmad-quick-flow/` - For rapid 2-hour cycles

---

## 🔍 Dependency & Impact Rules (MANDATORY)

### Search Before Edit
Before modifying ANY function, type, hook, or component:
1. Use `Grep` to find ALL call sites and imports across the entire codebase
2. Map the full dependency tree of affected files
3. Document the "Blast Radius" before making changes

### Cascade Fixes
If a change modifies a signature, type, or API contract:
- **YOU MUST** proactively update ALL dependent files in the SAME task
- Never leave broken imports or type mismatches
- Fix the entire chain, not just the source file

### Dependency Mapping
- Check `package.json` for version conflicts when adding/updating libraries
- Verify Supabase types match database schema after migrations
- Ensure RLS policies align with frontend permission checks

### No Orphaned Logic
When removing code:
- Remove ALL specific imports referencing it
- Remove associated tests
- Remove related type definitions
- Clean up any dead code paths

---

## ✅ Verification Protocol (Auto-Check)

### Post-Change Verification
After EVERY significant edit:
```bash
# 1. Type check
npx tsc --noEmit

# 2. If migration was added
npx supabase gen types typescript --project-id mqppvcrlvsgrsqelglod > src/integrations/supabase/types.ts

# 3. Build check (for production readiness)
npm run build
```

### Self-Correction Loop
If the build/type-check fails due to a missed dependency:
1. Analyze the error message
2. Find the affected file(s)
3. Fix immediately WITHOUT being asked
4. Re-run verification until clean

### Quality Gates
- ❌ NEVER mark a task complete with TypeScript errors
- ❌ NEVER leave console errors in the browser
- ❌ NEVER skip RLS policy updates when adding organization_id
- ✅ ALWAYS run `tsc --noEmit` before finishing code changes

---

## 🏢 Multi-Tenant Architecture (Organization-Based)

### Data Isolation Rules
- ALL data queries MUST filter by `organization_id`
- Use `useOrganization()` hook to get current org context
- Fallback to `user_id` only for single-user orgs (backward compat)

### Role-Based Access
```
Roles: admin | manager | dispatcher | technician | custom
- admin: Full access, can manage org settings
- manager: Can manage jobs, clients, team
- dispatcher: Can create/assign jobs, limited editing
- technician: Can view/update assigned jobs only
```

### Key Organization Files
- `src/components/auth/RBACProvider.tsx` - Permission system
- `src/hooks/usePermissions.ts` - 40+ permission checks
- `src/services/organizationContext.ts` - Org context service
- `src/hooks/use-organization.tsx` - Organization hook

---

## 🎯 Auto-Selection: Skills & Agents Decision Matrix

### When to Use Skills (Slash Commands)
Skills are invoked with `/command` syntax. Use them for **specific, well-defined tasks**:

| Trigger Keywords | Skill | Use When |
|-----------------|-------|----------|
| "commit", "save changes", "git commit" | `/commit` | After completing code changes, ready to commit |
| "create PR", "pull request", "merge" | `/create-pr` | Feature complete, ready for review |
| "deploy", "push to prod", "release" | `/deploy` | Ready to deploy to staging/production |
| "run tests", "test this", "check tests" | `/test` | Need to run test suite |
| "fix issue #", "github issue" | `/fix-issue` | Working on a specific GitHub issue |
| "database change", "add column", "schema" | `/migrate` | Any database schema modification |
| "security check", "vulnerability" | `/audit` | Security review needed |
| "new release", "version bump" | `/release` | Creating a new version release |

### When to Use Skill Activators (Auto-Activated)
These skills activate automatically based on context:

| Context/Keywords | Skill | Auto-Activates When |
|-----------------|-------|---------------------|
| Database, migration, schema, RLS, index | `db-migration` | Discussing database changes |
| Deploy, CI/CD, Vercel, infrastructure | `deploy-ops` | Deployment discussions |
| New feature, component, page, user story | `feature-builder` | Building new functionality |
| UI, design, component, interface, styling | `frontend-design` | Any UI/UX implementation |
| Bug, fix, urgent, production issue | `hotfix-handler` | Critical bug fixing |
| Test, QA, coverage, unit test, e2e | `qa-expert` | Testing discussions |
| Security, auth, OWASP, vulnerability | `security-audit` | Security-related work |

### When to Use Agents
Agents are specialized AI workers. Use them for **complex, multi-step domain tasks**:

| Task Type | Agent | Use When |
|-----------|-------|----------|
| **Database & Backend** | | |
| Schema design, RLS policies, migrations | `supabase-architect` | Any Supabase/PostgreSQL work |
| Edge functions, Deno runtime issues | `supabase-functions-inspector` | Edge function debugging |
| **Frontend Development** | | |
| React components, hooks, UI state | `frontend-specialist` | Component development |
| Mobile responsive, PWA, touch UI | `mobile-specialist` | Mobile-specific features |
| **Quality & Testing** | | |
| Unit tests, integration tests, E2E | `test-engineer` | Test creation/fixing |
| Code review, best practices, refactor | `code-reviewer` | After significant changes |
| Security review, penetration testing | `security-auditor` | Security assessment |
| **Performance & Operations** | | |
| Speed optimization, caching, lazy load | `performance-optimizer` | Performance issues |
| CI/CD, Docker, deployment, monitoring | `devops-engineer` | Infrastructure tasks |
| **AI & Automation** | | |
| OpenAI/Claude API, prompts, LLM features | `ai-integration-expert` | AI-powered features |
| Workflows, business automation | `automation-engineer` | Process automation |

### Auto-Selection Rules (For Claude)

**Rule 1: Keyword Matching**
```
IF user mentions "commit" OR "save changes" → Use /commit
IF user mentions "deploy" OR "production" → Use /deploy
IF user mentions "database" OR "migration" OR "schema" → Use db-migration skill
IF user mentions "UI" OR "component" OR "design" → Use frontend-design skill
```

**Rule 2: Task Complexity**
```
Simple task (1-2 steps) → Use skill/command directly
Complex task (3+ steps) → Spawn appropriate agent
Multi-domain task → Spawn multiple agents in parallel
```

**Rule 3: Domain Detection**
```
Supabase/Database mentions → supabase-architect agent
React/Component mentions → frontend-specialist agent
Test/Coverage mentions → test-engineer agent
Security/Auth mentions → security-auditor agent
Speed/Performance mentions → performance-optimizer agent
```

**Rule 4: Proactive Usage**
```
After writing code → Proactively use test-engineer
Before deployment → Proactively use security-auditor
After database changes → Proactively use /migrate
After feature complete → Proactively use code-reviewer
```

### Agent Combination Patterns

**New Feature Development:**
```
1. supabase-architect → Database schema (if needed)
2. frontend-specialist → UI components
3. test-engineer → Tests
4. code-reviewer → Final review
```

**Bug Fix Flow:**
```
1. hotfix-handler skill → Quick diagnosis
2. Appropriate agent → Fix implementation
3. test-engineer → Regression tests
4. /commit → Save changes
```

**Performance Issue:**
```
Run in parallel:
├── performance-optimizer → Frontend analysis
├── supabase-architect → Query optimization
└── devops-engineer → Infrastructure check
```

**Security Audit:**
```
1. security-auditor → Full assessment
2. supabase-architect → RLS policy review
3. code-reviewer → Code security patterns
```

---

## 🤖 Your AI Agent Team

You have access to 10 specialized agents, each an expert in their domain. Use them like you would consult with senior engineers:

### Core Development Team
1. **supabase-architect** - Database & backend expert
2. **frontend-specialist** - React/UI development master
3. **ai-integration-expert** - AI/LLM implementation specialist

### Quality & Security Team
4. **security-auditor** - Security vulnerability hunter
5. **test-engineer** - Quality assurance automation
6. **code-reviewer** - Code quality guardian

### Operations Team
7. **devops-engineer** - Infrastructure & deployment
8. **performance-optimizer** - Speed & efficiency expert
9. **automation-engineer** - Workflow automation architect

### Special Agent (You can create more as needed)
10. **[Custom Agent]** - Create specialized agents for specific needs

## 📋 Agent Usage Patterns

### Sequential Workflow
```
Feature Development Flow:
1. supabase-architect → Design database schema
2. frontend-specialist → Build UI components
3. ai-integration-expert → Add intelligent features
4. test-engineer → Create comprehensive tests
5. code-reviewer → Review implementation
6. devops-engineer → Deploy to production
```

### Parallel Execution
```
Performance Audit:
├── performance-optimizer → Frontend analysis
├── supabase-architect → Database optimization
└── devops-engineer → Infrastructure review
```

### Specialized Tasks
```
Security Audit:
security-auditor → Complete vulnerability assessment

Automation Design:
automation-engineer → Workflow implementation
```

## 🏗️ Project Structure

```
Fixlify-Main-main/
├── src/
│   ├── components/     # React components (shadcn/ui based)
│   ├── pages/          # Page components
│   ├── hooks/          # Custom React hooks
│   ├── integrations/   # Supabase & third-party integrations
│   ├── types/          # TypeScript type definitions
│   └── utils/          # Utility functions
├── supabase/
│   ├── functions/      # Edge Functions (Deno)
│   └── migrations/     # Database migrations
├── public/            # Static assets
├── .claude/
│   └── agents/        # AI agent configurations
└── docs/             # Documentation
```

## 🔧 Technology Stack

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Library**: shadcn/ui (Radix UI)
- **State Management**: Zustand
- **Forms**: react-hook-form + zod
- **Routing**: react-router-dom

### Backend
- **Database**: Supabase (PostgreSQL 15)
- **Auth**: Supabase Auth
- **Edge Functions**: Deno runtime
- **Real-time**: Supabase Realtime
- **Storage**: Supabase Storage

### Integrations
- **SMS**: Telnyx (+14375249932)
- **Email**: Mailgun (mg.fixlify.app)
- **Payments**: Stripe
- **AI**: OpenAI GPT-4, Claude API
- **Phone**: AI Dispatcher system

### DevOps
- **Hosting**: Vercel (Frontend)
- **Database**: Supabase Cloud
- **Monitoring**: Sentry
- **CI/CD**: GitHub Actions

## 🎯 Development Guidelines

### Code Quality Standards
- **TypeScript**: Relaxed mode (noImplicitAny: false, strictNullChecks: false) - but always use proper types, avoid `any`
- **Testing**: Minimum 80% coverage
- **Security**: OWASP compliance
- **Performance**: Core Web Vitals targets met
- **Accessibility**: WCAG 2.1 AA compliance

## 🚨 EXTREMELY IMPORTANT: Code Quality Checks

**MANDATORY: Run diagnostics before completing ANY code task:**

**YOU MUST ALWAYS:**
1. Check for linting and type errors using IDE diagnostics
2. Run diagnostics on ALL files you create or modify
3. Fix any errors found before considering the task complete
4. NEVER skip this step - it is CRITICAL for code quality

**This applies to:**
- Every file creation
- Every file modification
- Every code review
- Every deployment preparation

**NO EXCEPTIONS - This is a non-negotiable requirement**

### Git Workflow
```bash
# Feature development
git checkout -b feature/your-feature
# Make changes with agents
# Commit with conventional commits
git commit -m "feat: add new feature"
# Push and create PR
git push origin feature/your-feature
```

### Commit Convention
- `feat:` New feature
- `fix:` Bug fix
- `perf:` Performance improvement
- `refactor:` Code refactoring
- `test:` Test updates
- `docs:` Documentation
- `chore:` Maintenance

## 🚨 Critical Information

### Environment Variables
```env
VITE_SUPABASE_URL=https://mqppvcrlvsgrsqelglod.supabase.co
VITE_SUPABASE_ANON_KEY=[your-anon-key]
TELNYX_API_KEY=[in-supabase-secrets]
MAILGUN_API_KEY=[in-supabase-secrets]
OPENAI_API_KEY=[in-supabase-secrets]
```

### Known Issues & Solutions
1. **Edge Function module imports**: Use `@supabase/supabase-js@2` not `@2.7.1`
2. **Phone number formatting**: Always use E.164 format (+1XXXXXXXXXX)
3. **RLS policies**: All tables must have proper policies
4. **Performance**: Lazy load all routes and heavy components

### Recent Fixes (Check FIXLIFY_PROJECT_KNOWLEDGE.md)
- ✅ Job system type consolidation
- ✅ SMS/Email edge functions
- ✅ AI Dispatcher implementation
- ✅ Authentication flows

## 🎨 UI/UX Principles

### Design System
- **Colors**: Purple (#8A4DD5) as primary brand color (fixlyfy theme)
- **Typography**: Inter font family
- **Spacing**: 4px base unit (Tailwind default)
- **Components**: shadcn/ui for consistency
- **Icons**: Lucide React icons

### Responsive Design
- Mobile-first approach
- Breakpoints: sm(640px), md(768px), lg(1024px), xl(1280px)
- Touch-friendly interfaces
- Optimized for tablets

## 📊 Business Logic

### Core Entities
1. **Clients**: Customer management
2. **Jobs**: Service/repair tracking
3. **Invoices**: Billing and payments
4. **Inventory**: Parts and supplies
5. **Team**: Employee management
6. **Automations**: Workflow automation

### Key Features
- Multi-location support
- Real-time updates
- AI-powered communications
- Automated invoicing
- Smart scheduling
- Performance analytics

## 🧪 Testing Strategy

### Test Levels
1. **Unit Tests**: Components and utilities
2. **Integration Tests**: API and database
3. **E2E Tests**: Critical user flows
4. **Performance Tests**: Load and stress testing
5. **Security Tests**: Vulnerability scanning

### Test Commands
```bash
npm test              # Run all tests
npm run test:unit    # Unit tests only
npm run test:e2e     # E2E tests
npm run test:coverage # Coverage report
```

## 🚀 Deployment Process

### Staging
1. All PRs auto-deploy to preview
2. Run automated tests
3. Manual QA verification
4. Security scanning

### Production
1. Merge to main branch
2. Automated deployment via Vercel
3. Database migrations via Supabase
4. Monitor error rates
5. Rollback if needed

## 💡 Pro Tips for Agent Usage

### Thinking Modes
- Use "think" for standard analysis
- Use "think hard" for complex problems
- Use "think harder" for critical decisions
- Use "ultrathink" for architectural changes

### Parallel Processing
```
# Analyze entire codebase efficiently
Use 4 parallel tasks to explore:
- Task 1: Analyze frontend architecture
- Task 2: Review database schema
- Task 3: Check security vulnerabilities
- Task 4: Audit performance metrics
```

### Context Management
- Each agent has its own context window
- Use project-specific agents for specialized tasks
- Agents can coordinate without context pollution

## 🎯 Mission: Build the Best App in the Market

Our goal is to create a flawless, feature-rich application that:
- **Never crashes** - Robust error handling
- **Blazingly fast** - Sub-second response times
- **Beautifully designed** - Intuitive and modern UI
- **Highly secure** - Bank-level security
- **Fully automated** - Intelligent workflows
- **Scales infinitely** - Cloud-native architecture

## 📝 Remember

You're not just writing code - you're architecting the future of field service management. Every line of code should be:
- **Purposeful** - Solves a real problem
- **Elegant** - Simple and maintainable
- **Tested** - Proven to work
- **Documented** - Easy to understand
- **Optimized** - Fast and efficient
- **Secure** - Protected from threats

## 🎉 Let's Build Something Amazing!

With this elite team of AI agents at your disposal, you have the power of a full development team. Use them wisely, let them collaborate, and together we'll create the best AI-powered field service management platform in the market.

**Remember**: You're the conductor of this orchestra. The agents are your instruments. Make beautiful music (code) together! 🎵

---
*"Code like a team of 10 senior engineers, deliver like a unicorn startup"* - Fixlify Development Philosophy
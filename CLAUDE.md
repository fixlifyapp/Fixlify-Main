# Fixlify - AI-Powered Field Service Management

## Quick Reference
- **Stack**: React 18 + TypeScript + Vite + Tailwind + shadcn/ui + Supabase
- **Supabase Project ID**: `mqppvcrlvsgrsqelglod`
- **Design**: Purple (#8A4DD5) primary, Inter font, Lucide icons

## Project Structure
```
src/components/     # React components (shadcn/ui)
src/pages/          # Page components
src/hooks/          # Custom hooks
src/integrations/   # Supabase client
supabase/functions/ # Edge Functions (Deno)
supabase/migrations/# Database migrations
.claude/agents/     # AI agent configs
.claude/skills/     # Skill definitions
.bmad/              # BMAD v6 workflows
```

---

## 🚨 MANDATORY RULES (NO EXCEPTIONS)

### 1. Migration Auto-Execute
After creating ANY migration file, IMMEDIATELY run:
```bash
npx supabase db push
npx supabase gen types typescript --project-id mqppvcrlvsgrsqelglod > src/integrations/supabase/types.ts
```

### 2. Type Check Before Done
```bash
npx tsc --noEmit  # Must pass before marking task complete
```

### 3. Multi-Tenant Data Isolation
- ALL queries MUST filter by `organization_id`
- Use `useOrganization()` hook for org context
- Roles: `admin | manager | dispatcher | technician | custom`

### 4. Dependency Cascade
Before modifying ANY function/type/hook:
1. `Grep` all call sites across codebase
2. Fix ALL dependent files in same task
3. Never leave broken imports

### 5. No Orphaned Code
When removing code: delete imports, tests, types, dead paths

---

## 🤖 Agent & Skill Auto-Selection

**Claude automatically selects based on keywords:**

| Keywords | Agent/Skill |
|----------|-------------|
| database, table, RLS, migration | `supabase-architect` + `db-migration` |
| component, UI, form, modal | `frontend-specialist` + `frontend-design` |
| test, coverage, jest | `test-engineer` + `qa-expert` |
| security, auth, permission | `security-auditor` + `security-audit` |
| slow, optimize, cache | `performance-optimizer` |
| deploy, prod, CI/CD | `devops-engineer` + `deploy-ops` |
| AI, GPT, LLM, prompt | `ai-integration-expert` |
| bug, urgent, broken | `hotfix-handler` |

**Task Size → Approach:**
- 0-1 files: Execute directly
- 2-5 files: Use skill + agent
- 6-15 files: Use `quick-spec` workflow first
- 15+ files: Use `create-epics-and-stories` workflow

**Slash Commands:** `/commit`, `/deploy`, `/test`, `/migrate`, `/audit`, `/create-pr`, `/release`, `/fix-issue`

---

## 🔧 Key Files

### Organization & Auth
- `src/components/auth/RBACProvider.tsx` - Permission system
- `src/hooks/usePermissions.ts` - 40+ permission checks
- `src/services/organizationContext.ts` - Org context
- `src/hooks/use-organization.tsx` - Organization hook

### Integrations
- SMS: Telnyx (+14375249932)
- Email: Mailgun (mg.fixlify.app)
- Payments: Stripe
- AI: OpenAI GPT-4, Claude API

---

## 📋 Common Commands
```bash
npm run dev          # Start dev server
npm run build        # Production build
npm test             # Run tests
npx tsc --noEmit     # Type check
npx supabase db push # Apply migrations
npx supabase gen types typescript --project-id mqppvcrlvsgrsqelglod > src/integrations/supabase/types.ts
```

## ⚠️ Known Issues
1. Edge Function imports: Use `@supabase/supabase-js@2` not `@2.7.1`
2. Phone numbers: E.164 format (+1XXXXXXXXXX)
3. All tables need RLS policies

---

## 📚 Detailed Documentation
- **Agents**: `.claude/agents/` - Full agent configurations
- **Skills**: `.claude/skills/` - Skill definitions
- **BMAD Workflows**: `.bmad/bmm/workflows/` - Planning & execution workflows
- **Project Knowledge**: `docs/project-context.md` - Architecture decisions

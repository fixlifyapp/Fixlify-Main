# 🚀 Fixlify - Elite Multi-Agent Development System

## Project Overview
Fixlify is a comprehensive repair shop management system built with cutting-edge technology and maintained by a team of specialized AI agents. This is not just a codebase - it's a living, intelligent system designed to be the best in the market.

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
- **TypeScript**: Strict mode, no any types
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
- **Colors**: Blue (#3b82f6) as primary brand color
- **Typography**: System fonts with Inter fallback
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

You're not just writing code - you're architecting the future of repair shop management. Every line of code should be:
- **Purposeful** - Solves a real problem
- **Elegant** - Simple and maintainable
- **Tested** - Proven to work
- **Documented** - Easy to understand
- **Optimized** - Fast and efficient
- **Secure** - Protected from threats

## 🎉 Let's Build Something Amazing!

With this elite team of AI agents at your disposal, you have the power of a full development team. Use them wisely, let them collaborate, and together we'll create the best repair shop management system in the market.

**Remember**: You're the conductor of this orchestra. The agents are your instruments. Make beautiful music (code) together! 🎵

---
*"Code like a team of 10 senior engineers, deliver like a unicorn startup"* - Fixlify Development Philosophy
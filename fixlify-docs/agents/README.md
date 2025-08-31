# 🤖 AI Agents Documentation

> Elite AI agents for specialized development tasks in Fixlify

## Available Agents

### Core Development Agents

#### 📊 supabase-architect
Database and backend architecture specialist
- Database schema design
- RLS policies implementation
- Edge Functions development
- Migration management
- Performance optimization

#### 🎨 frontend-specialist
React/TypeScript UI development expert
- Component architecture
- State management
- UI/UX implementation
- Performance optimization
- Responsive design

#### 🔒 security-auditor
Security vulnerability assessment specialist
- Code security review
- Vulnerability scanning
- Authentication/authorization
- Data protection
- OWASP compliance

### Quality & Operations Agents

#### ⚡ performance-optimizer
Speed and efficiency expert
- Frontend optimization
- Database query optimization
- Bundle size reduction
- Caching strategies
- Load time improvements

#### 🧪 test-engineer
Quality assurance automation specialist
- Unit test creation
- Integration testing
- E2E test automation
- Coverage analysis
- Test strategy design

#### 🚀 devops-engineer
Infrastructure and deployment specialist
- CI/CD pipelines
- Docker configuration
- Cloud deployment
- Monitoring setup
- Infrastructure as code

### Specialized Agents

#### 🤖 ai-integration-expert
AI/LLM implementation specialist
- OpenAI/Claude integration
- Prompt engineering
- AI feature development
- Model optimization
- Intelligent automation

#### ⚙️ automation-engineer
Workflow automation architect
- Business process automation
- Integration development
- Workflow optimization
- Event-driven systems
- Scheduled tasks

#### 📱 mobile-specialist
Mobile development expert
- Responsive design
- PWA implementation
- React Native development
- Mobile performance
- Touch interfaces

#### 👨‍💻 code-reviewer
Code quality guardian
- Code review automation
- Best practices enforcement
- Architecture consistency
- Performance analysis
- Security review

#### 📋 fixlify-project-manager
Project coordination specialist
- Sprint planning
- Task management
- Blocker resolution
- Team coordination
- Progress tracking

## Agent Documentation Files

### Core Agents
- [supabase-architect.md](/.claude/agents/supabase-architect.md) - Database architecture guide
- [frontend-specialist.md](/.claude/agents/frontend-specialist.md) - Frontend development patterns
- [security-auditor.md](/.claude/agents/security-auditor.md) - Security best practices
- [performance-optimizer.md](/.claude/agents/performance-optimizer.md) - Optimization strategies
- [test-engineer.md](/.claude/agents/test-engineer.md) - Testing methodology

### Specialized Agents
- [ai-integration-expert.md](/.claude/agents/ai-integration-expert.md) - AI integration guide
- [automation-engineer.md](/.claude/agents/automation-engineer.md) - Automation patterns
- [devops-engineer.md](/.claude/agents/devops-engineer.md) - DevOps practices
- [mobile-specialist.md](/.claude/agents/mobile-specialist.md) - Mobile development
- [code-reviewer.md](/.claude/agents/code-reviewer.md) - Code review standards

### Project Management
- [fixlify-project-manager.md](/.claude/agents/fixlify-project-manager.md) - Project management
- [orchestra-conductor.md](/.claude/agents/orchestra-conductor.md) - Agent orchestration

### Support Documentation
- [AGENT_ORCHESTRA_EXAMPLES.md](/AGENT_ORCHESTRA_EXAMPLES.md) - Usage examples
- [AGENT_RECOMMENDATIONS.md](/AGENT_RECOMMENDATIONS.md) - Best practices
- [AGENT_ORCHESTRATION_PLAYBOOK.md](/docs/AGENT_ORCHESTRATION_PLAYBOOK.md) - Orchestration guide
- [AGENT_SUCCESS_PATTERNS.md](/docs/AGENT_SUCCESS_PATTERNS.md) - Success patterns

## Usage Patterns

### Sequential Development
```
1. supabase-architect → Design schema
2. frontend-specialist → Build UI
3. test-engineer → Create tests
4. code-reviewer → Review code
5. devops-engineer → Deploy
```

### Parallel Analysis
```
Launch simultaneously:
- security-auditor → Security scan
- performance-optimizer → Performance audit
- code-reviewer → Code quality check
```

### Specialized Tasks
```
For mobile features:
- mobile-specialist → Mobile optimization

For AI features:
- ai-integration-expert → AI implementation

For automation:
- automation-engineer → Workflow design
```

## Best Practices

1. **Use the right agent for the job** - Each agent is specialized
2. **Combine agents for complex tasks** - Orchestrate multiple agents
3. **Let agents work in parallel** - Maximize efficiency
4. **Review agent outputs** - Validate recommendations
5. **Update agent instructions** - Keep context current

## Agent Communication

Agents can:
- Work independently on assigned tasks
- Share context through structured outputs
- Coordinate without direct communication
- Maintain separate context windows
- Produce complementary results

## Creating Custom Agents

To create a new specialized agent:
1. Define clear responsibilities
2. Specify required expertise
3. Set interaction patterns
4. Document usage examples
5. Test in isolation and orchestration

---

*For detailed agent orchestration patterns, see [ORCHESTRA_CONDUCTOR_GUIDE.md](/ORCHESTRA_CONDUCTOR_GUIDE.md)*
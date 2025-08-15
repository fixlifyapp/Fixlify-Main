# Claude Code Agents for Fixlify

## Installation
1. Install Claude Code extension in VS Code
2. Open this folder in VS Code
3. Use `@workspace` or `@file:agent-name` in Claude Code

## Available Agents

### 🚀 Deployment Agent
Safe production deployments with rollback
```
@file:deployment-agent.ts deploy to production
```

### 📊 Monitoring Agent
Real-time error and performance tracking
```
@file:monitoring-agent.ts check system health
```

### 💰 Cost Agent
Track Supabase, Telnyx, AI costs
```
@file:cost-agent.ts analyze monthly costs
```

### 👥 UX Agent
User experience and performance metrics
```
@file:ux-agent.ts check user satisfaction
```

### 💾 Backup Agent
Automated backups and recovery
```
@file:backup-agent.ts create backup
```

### 🔍 Code Review Agent
Security and quality checks
```
@file:code-review-agent.ts review code
```

### 📈 Analytics Agent
Business metrics and growth
```
@file:analytics-agent.ts generate revenue report
```

### 🔧 Maintenance Agent
Database cleanup and optimization
```
@file:maintenance-agent.ts run maintenance
```

## Master Controller
```typescript
// Use all agents together
@file:agent-controller.ts run daily checks
@file:agent-controller.ts deploy to production
@file:agent-controller.ts generate full report
```

## CLI Commands
```bash
# Daily tasks
node agents/claude-code/agent-controller.js daily

# Weekly maintenance
node agents/claude-code/agent-controller.js weekly

# Deploy to production
node agents/claude-code/agent-controller.js deploy

# Full system report
node agents/claude-code/agent-controller.js report
```

## Example Claude Code Prompts

"Check if we're ready for production using @file:deployment-agent.ts"

"Monitor errors from last 24 hours with @file:monitoring-agent.ts"

"How much are we spending on AI calls? Use @file:cost-agent.ts"

"Create a backup before deployment using @file:backup-agent.ts"

"Review security issues in @workspace using @file:code-review-agent.ts"

## Automated Schedule
Add to crontab or GitHub Actions:
```yaml
schedule:
  - cron: '0 2 * * *' # Daily at 2 AM
    run: node agent-controller.js daily
  - cron: '0 3 * * 0' # Weekly on Sunday
    run: node agent-controller.js weekly
```
# 🚀 Claude Code + MCP Supabase Setup Guide for VS Code

## 📋 Prerequisites

1. **VS Code** installed
2. **Node.js** 18+ installed
3. **Claude API Key** from Anthropic

## 🔧 One-Time Setup

### Step 1: Install Claude Code

Open PowerShell as Administrator and run:
```powershell
# Install Claude Code globally
npm install -g @anthropic-ai/claude-code

# Install MCP server for Supabase
npm install -g @modelcontextprotocol/server-supabase
```

### Step 2: Set Your API Keys

Create a `.env` file in your project root:
```env
ANTHROPIC_API_KEY=your_claude_api_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
```

**To get your Supabase Service Role Key:**
1. Go to https://supabase.com/dashboard/project/mqppvcrlvsgrsqelglod/settings/api
2. Copy the "service_role" key (keep this secret!)

### Step 3: Install Agents

Run the setup script:
```powershell
# Option 1: Use PowerShell script
.\setup-claude-code.ps1

# Option 2: Use batch file
.\launch-fixlify-claude.bat
```

### Step 4: VS Code Extension

1. Open VS Code
2. Press `Ctrl+Shift+X` to open Extensions
3. Search for "Claude Code"
4. Install the official Anthropic extension
5. Reload VS Code

## 🎯 How to Use Claude Code in VS Code

### Method 1: Integrated Terminal (Recommended)

1. Open VS Code in your project
2. Open terminal (`Ctrl+` ` )
3. Run:
```bash
# Launch with all features
claude --dangerously-skip-permissions

# Or use the batch file
.\launch-fixlify-claude.bat
```

### Method 2: VS Code Command Palette

1. Press `Ctrl+Shift+P`
2. Type "Claude"
3. Select "Claude Code: Open Chat"

### Method 3: Keyboard Shortcuts

- `Ctrl+Shift+C` - Open Claude chat
- `Ctrl+Shift+A` - Run agent command
- `Ctrl+Shift+L` - List all agents
- `Escape` - Stop current execution

## 🤖 Using Your 10 Agents

### List Available Agents
```bash
/agents list
```

### Call Specific Agent
```bash
# Database optimization
"supabase-architect: optimize our database queries and add missing indexes"

# Frontend development
"frontend-specialist: create a responsive dashboard for job analytics"

# Mobile optimization
"mobile-specialist: make our app work offline with service workers"

# Security audit
"security-auditor: check for vulnerabilities in our authentication"

# Performance boost
"performance-optimizer: make our app load in under 2 seconds"
```

### Parallel Agent Execution
```bash
"Run 5 parallel tasks:
Task 1: supabase-architect - optimize database
Task 2: frontend-specialist - improve UI
Task 3: mobile-specialist - add PWA features
Task 4: security-auditor - security scan
Task 5: performance-optimizer - speed analysis"
```

## 🔌 Using MCP Supabase

### Database Operations
```bash
# Query data
"Query the jobs table for all active jobs"

# Insert data
"Insert a test client into the clients table"

# Update records
"Update job status to completed where id = 'xyz'"

# Call Edge Functions
"Invoke the ai-dispatcher-handler edge function"
```

### File Operations (via MCP)
```bash
# Read files
"Read the package.json file"

# Create components
"Create a new React component for customer reviews"

# Update configuration
"Update our Supabase configuration"
```

## 💡 Pro Tips

### 1. Thinking Modes
- `think` - Quick analysis
- `think hard` - Complex problems
- `think harder` - Critical decisions
- `ultrathink` - Architectural changes

### 2. Speed Optimization
```bash
# Slow (sequential)
"First do X, then do Y, then do Z"

# Fast (parallel)
"Do X, Y, and Z in parallel using 3 tasks"
```

### 3. Agent Combinations
```bash
# Full feature development
"Build invoice management:
1. supabase-architect: design schema
2. frontend-specialist: build UI
3. mobile-specialist: mobile optimization
4. test-engineer: write tests
5. Deploy to production"
```

## 🎮 Quick Test Commands

Copy and run these to test your setup:

```bash
# Test 1: Agent availability
/agents list

# Test 2: Database connection
"supabase-architect: list all our database tables"

# Test 3: Code analysis
"code-reviewer: analyze our JobCard component"

# Test 4: Parallel execution
"Run 3 tasks: analyze security, check performance, review code quality"

# Test 5: MCP Supabase
"Query the phone_numbers table and show all records"
```

## 🔍 Troubleshooting

### Issue: "Claude Code not found"
```powershell
npm install -g @anthropic-ai/claude-code
```

### Issue: "Agents not loading"
```powershell
# Copy agents to user directory
xcopy /s /y ".claude\agents\*" "%USERPROFILE%\.claude\agents\"
```

### Issue: "MCP not connecting"
1. Check your `.env` file has correct keys
2. Verify Supabase URL is correct
3. Ensure service role key is valid

### Issue: "Permission denied"
Always use the flag: `--dangerously-skip-permissions`

## 📊 Your Agent Team

| Agent | Expertise | Use For |
|-------|-----------|---------|
| **supabase-architect** | Database, Backend | Schema design, queries, migrations |
| **frontend-specialist** | React, UI | Components, layouts, interactions |
| **mobile-specialist** | Mobile, PWA | Responsive design, offline, touch |
| **ai-integration-expert** | AI, LLM | Smart features, automation |
| **security-auditor** | Security | Vulnerabilities, auth, encryption |
| **test-engineer** | Testing | Unit tests, E2E, coverage |
| **devops-engineer** | Infrastructure | Deployment, CI/CD, monitoring |
| **performance-optimizer** | Speed | Optimization, caching, loading |
| **code-reviewer** | Quality | Best practices, refactoring |
| **automation-engineer** | Workflows | Business automation, integrations |

## 🚀 Start Building!

You're now ready to use Claude Code with:
- ✅ 10 specialized agents
- ✅ Supabase MCP integration
- ✅ VS Code integration
- ✅ Parallel execution
- ✅ Full project context

**Your first command:**
```bash
"Hello team! All 10 agents: introduce yourselves and tell me what part of Fixlify you'll improve first"
```

## 📚 Resources

- [Claude Code Docs](https://docs.anthropic.com/claude-code)
- [MCP Protocol](https://modelcontextprotocol.io)
- [Agent Orchestration Playbook](./docs/AGENT_ORCHESTRATION_PLAYBOOK.md)
- [Success Patterns](./docs/AGENT_SUCCESS_PATTERNS.md)

---

**Need help?** Just ask any agent: "How do I..."

**Ready to build the best repair shop management app in the world!** 🎉
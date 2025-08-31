# VS Code + Supabase + GitHub Integration Guide

## Important Note
**MCP (Model Context Protocol) is NOT available in Claude Code CLI**
- MCP only works with Claude Desktop (GUI app)
- Claude Code CLI uses built-in tools instead

## VS Code Extensions Setup

### 1. Install Required Extensions

Open VS Code and install these extensions:

```bash
# Via command palette (Ctrl+Shift+P) or terminal:
code --install-extension supabase.supabase-vscode
code --install-extension github.vscode-pull-request-github
code --install-extension mtxr.sqltools
code --install-extension mtxr.sqltools-driver-pg
code --install-extension denoland.vscode-deno
```

### 2. Configure Supabase Extension

#### Method 1: Extension Settings (Recommended)
1. Open VS Code
2. Press `Ctrl+Shift+P`
3. Type "Supabase: Configure Project"
4. Enter your project details:
   - Project URL: `https://mqppvcrlvsgrsqelglod.supabase.co`
   - Anon Key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xcHB2Y3JsdnNncnNxZWxnbG9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1OTE3MDUsImV4cCI6MjA2MzE2NzcwNX0.My-KiqG1bCMqzUru4m59d4v18N3WGxNoNtFPOFAmhzg`

#### Method 2: Workspace Settings
Create/update `.vscode/settings.json`:

```json
{
  // Deno for Edge Functions
  "deno.enable": true,
  "deno.lint": true,
  "deno.unstable": true,
  "deno.enablePaths": [
    "supabase/functions"
  ],
  
  // Supabase Extension Settings
  "supabase.projectUrl": "https://mqppvcrlvsgrsqelglod.supabase.co",
  "supabase.anonKey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xcHB2Y3JsdnNncnNxZWxnbG9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1OTE3MDUsImV4cCI6MjA2MzE2NzcwNX0.My-KiqG1bCMqzUru4m59d4v18N3WGxNoNtFPOFAmhzg",
  
  // TypeScript
  "typescript.tsdk": "node_modules/typescript/lib",
  
  // Format on Save
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  
  // SQL Tools
  "sqltools.connections": [
    {
      "name": "Supabase - Fix App",
      "driver": "PostgreSQL",
      "server": "db.mqppvcrlvsgrsqelglod.supabase.co",
      "port": 5432,
      "database": "postgres",
      "username": "postgres",
      "askForPassword": true,
      "connectionTimeout": 30
    }
  ]
}
```

### 3. Configure GitHub Extension

1. Sign in to GitHub:
   - Press `Ctrl+Shift+P`
   - Type "GitHub: Sign in"
   - Follow authentication flow

2. Set up repository:
   ```bash
   # If not already initialized
   git init
   git remote add origin YOUR_GITHUB_REPO_URL
   ```

### 4. Create VS Code Tasks

Create `.vscode/tasks.json`:

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Supabase: Deploy Database",
      "type": "shell",
      "command": "supabase db push",
      "group": "build",
      "presentation": {
        "reveal": "always",
        "panel": "new"
      }
    },
    {
      "label": "Supabase: Deploy Functions",
      "type": "shell",
      "command": "supabase functions deploy",
      "group": "build",
      "presentation": {
        "reveal": "always",
        "panel": "new"
      }
    },
    {
      "label": "Supabase: Status",
      "type": "shell",
      "command": "supabase status",
      "group": "test",
      "presentation": {
        "reveal": "always",
        "panel": "new"
      }
    },
    {
      "label": "Supabase: Local Start",
      "type": "shell",
      "command": "supabase start",
      "group": "test",
      "presentation": {
        "reveal": "always",
        "panel": "new"
      }
    },
    {
      "label": "GitHub: Push to Main",
      "type": "shell",
      "command": "git push origin main",
      "group": "none",
      "presentation": {
        "reveal": "always",
        "panel": "new"
      }
    }
  ]
}
```

### 5. Create Launch Configuration

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Test Supabase Connection",
      "program": "${workspaceFolder}/test-supabase-connection.js",
      "skipFiles": ["<node_internals>/**"]
    },
    {
      "type": "chrome",
      "request": "launch",
      "name": "Launch Chrome against localhost",
      "url": "http://localhost:8080",
      "webRoot": "${workspaceFolder}"
    }
  ]
}
```

## VS Code Supabase Extension Features

### 1. IntelliSense & Auto-completion
- SQL auto-completion in `.sql` files
- TypeScript types for database tables
- Edge Function snippets

### 2. Database Explorer
- View tables, views, functions in sidebar
- Execute queries directly
- View table data

### 3. Migration Management
- Create new migrations from UI
- View migration history
- Deploy migrations

### 4. Edge Functions
- Create new functions from template
- Deploy functions
- View function logs

## Keyboard Shortcuts

Add to `.vscode/keybindings.json`:

```json
[
  {
    "key": "ctrl+shift+d ctrl+shift+b",
    "command": "workbench.action.tasks.runTask",
    "args": "Supabase: Deploy Database"
  },
  {
    "key": "ctrl+shift+d ctrl+shift+f",
    "command": "workbench.action.tasks.runTask",
    "args": "Supabase: Deploy Functions"
  },
  {
    "key": "ctrl+shift+d ctrl+shift+s",
    "command": "workbench.action.tasks.runTask",
    "args": "Supabase: Status"
  }
]
```

## GitHub Integration Features

### 1. Pull Requests
- Create, review, and merge PRs in VS Code
- View PR comments and reviews
- Check CI/CD status

### 2. Issues
- Create and manage GitHub issues
- Link commits to issues
- View issue details

### 3. Actions
- View GitHub Actions workflows
- Monitor build status
- Debug failed workflows

## Working with Claude Code CLI

When using Claude Code CLI with VS Code open:

1. **File Changes**: Claude Code edits are immediately visible in VS Code
2. **Git Integration**: VS Code shows git changes made by Claude Code
3. **Terminal**: Run Claude Code commands from VS Code terminal
4. **Live Reload**: VS Code auto-refreshes when Claude Code modifies files

## Workflow Example

1. **In Claude Code CLI**:
   ```
   You: "Create supabase table user_preferences"
   Claude Code: Creates migration file and deploys
   ```

2. **In VS Code**:
   - See new migration file appear
   - View changes in Source Control panel
   - Use Supabase extension to verify deployment

3. **GitHub Integration**:
   - Commit changes via VS Code
   - Create PR if on feature branch
   - Push to GitHub

## Troubleshooting

### Supabase Extension Not Connecting
1. Check project URL and anon key in settings
2. Verify Supabase CLI is logged in: `supabase status`
3. Restart VS Code

### GitHub Extension Issues
1. Re-authenticate: `GitHub: Sign out` then `GitHub: Sign in`
2. Check git remote: `git remote -v`
3. Verify repository permissions

### Deno/Edge Functions Not Working
1. Ensure Deno extension is enabled
2. Check `deno.enablePaths` includes `supabase/functions`
3. Restart Deno Language Server

## Important Notes

1. **VS Code extensions enhance the development experience** but don't change how Claude Code works
2. **Claude Code CLI cannot directly use VS Code extensions** - it uses CLI tools instead
3. **Keep VS Code open** while using Claude Code for best experience
4. **Extensions provide visualization** of what Claude Code is doing

Last Updated: 2025-08-06
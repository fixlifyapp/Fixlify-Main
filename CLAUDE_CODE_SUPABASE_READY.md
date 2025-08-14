# 🚀 Claude Code + Supabase MCP Complete Setup

## ✅ Your Credentials (Already Retrieved!)

```env
# Supabase Connection Details
SUPABASE_URL=https://mqppvcrlvsgrsqelglod.supabase.co
SUPABASE_PROJECT_REF=mqppvcrlvsgrsqelglod
SUPABASE_ACCESS_TOKEN=sbp_cb907e8566ebad6a7f369a8359e96dc5c8a768fb
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xcHB2Y3JsdnNncnNxZWxnbG9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1OTE3MDUsImV4cCI6MjA2MzE2NzcwNX0.My-KiqG1bCMqzUru4m59d4v18N3WGxNoNtFPOFAmhzg
```

## 📋 Quick Setup Steps

### 1. Install Dependencies (if not already installed)
```bash
npm install -g @modelcontextprotocol/server-supabase
npm install -g @anthropic-ai/claude-code
```

### 2. Create .env file
Copy `.env.example` to `.env` and add your Anthropic API key

### 3. Launch Claude Code with Supabase
Double-click: `launch-claude-with-supabase.bat`

Or manually:
```bash
set SUPABASE_ACCESS_TOKEN=sbp_cb907e8566ebad6a7f369a8359e96dc5c8a768fb
claude --dangerously-skip-permissions --mcp-server supabase="mcp-server-supabase --project-ref=mqppvcrlvsgrsqelglod"
```

## 🎯 What You Can Do Now

### Database Operations
```bash
# Query tables
"Show me all jobs from the jobs table"
"List all clients with their phone numbers"
"Get phone_numbers table structure"

# Insert data
"Insert a new client named John Doe"
"Create a new job for client ID xyz"

# Update data
"Update job status to completed for job 123"
"Enable AI dispatcher for phone number +1234567890"

# Complex queries
"Find all jobs created this week with status in_progress"
"Show revenue by month for the last 6 months"
```

### Edge Functions
```bash
# Deploy functions
"Deploy a new edge function for webhook handling"
"Update the ai-dispatcher-handler function"

# Manage secrets
"Add OPENAI_API_KEY to edge function secrets"
"List all edge function environment variables"
```

### Schema Management
```bash
# Create tables
"Create a new table for customer_feedback with ratings"

# Migrations
"Add a priority column to jobs table"
"Create indexes for performance optimization"

# RLS Policies
"Add RLS policy for user data isolation"
"Check current RLS policies on jobs table"
```

## 🔧 Test Commands for Claude Code

### Basic Test
```bash
"Query the jobs table and show me 5 recent jobs"
```

### Advanced Test
```bash
"Orchestra: Create a complete notification system with:
1. Database table for notifications
2. Edge function for sending
3. Frontend component for display
Use supabase-architect for database work"
```

### Agent + MCP Test
```bash
"supabase-architect: Create a new table called test_claude with columns id, name, and created_at, then insert a test record"
```

## 📊 Your Database Structure

### Main Tables Available:
- **profiles** - User profiles and settings
- **clients** - Customer information
- **jobs** - Repair jobs and services
- **phone_numbers** - Phone numbers with AI settings
- **products** - Inventory items
- **tags** - Classification tags
- **automations** - Workflow automation
- **ai_dispatcher_configs** - AI phone settings

### Edge Functions Available:
- send-sms
- mailgun-email
- ai-dispatcher-handler
- automation-executor
- generate-with-ai

## 🎭 Using Agents with Supabase

### Orchestra Commands
```bash
"Orchestra: Build complete invoice system with database tables, API, and UI"
→ Automatically uses supabase-architect for database work

"Orchestra: Add email notifications to all job status changes"
→ Coordinates database triggers and edge functions
```

### Direct Agent Commands
```bash
"supabase-architect: Optimize database performance with indexes"
"data-migration-specialist: Safely add currency field to all money columns"
"integration-guardian: Verify all SMS functions connect properly"
```

## 🚨 Important Notes

1. **Service Role Key**: You need to get this from your Supabase dashboard:
   - Go to: https://supabase.com/dashboard/project/mqppvcrlvsgrsqelglod/settings/api
   - Copy the `service_role` secret key
   - Add to `.env` file

2. **MCP Server**: The MCP server uses your access token for management operations

3. **Agents**: All agents can use Supabase through the MCP integration

## ✅ Verification Checklist

- [ ] Claude Code installed: `npm install -g @anthropic-ai/claude-code`
- [ ] MCP Server installed: `npm install -g @modelcontextprotocol/server-supabase`
- [ ] Access token configured: `sbp_cb907e8566ebad6a7f369a8359e96dc5c8a768fb`
- [ ] Test connection working: Run `node test-supabase-connection.mjs`
- [ ] Agents can access Supabase: Test with a query command

## 🔥 You're Ready!

Launch Claude Code and start building with:
- 15 specialized agents
- Full Supabase database access
- Edge function deployment
- Real-time subscriptions
- Storage operations

Just run: `launch-claude-with-supabase.bat` 🚀
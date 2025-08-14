# Claude Code Supabase Setup Guide

## 🔑 Supabase Credentials (From Your MCP Config)

Your Supabase project details:
- **Project Ref**: mqppvcrlvsgrsqelglod
- **Project URL**: https://mqppvcrlvsgrsqelglod.supabase.co
- **Access Token**: sbp_cb907e8566ebad6a7f369a8359e96dc5c8a768fb

## 🚀 Setup Methods

### Method 1: Environment Variables (Recommended)

1. Create `.env` file in your project root:

```bash
# Supabase Configuration
SUPABASE_URL=https://mqppvcrlvsgrsqelglod.supabase.co
SUPABASE_ACCESS_TOKEN=sbp_cb907e8566ebad6a7f369a8359e96dc5c8a768fb
SUPABASE_PROJECT_REF=mqppvcrlvsgrsqelglod

# Get these from Supabase Dashboard
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

2. Get the missing keys from Supabase Dashboard:
   - Go to: https://supabase.com/dashboard/project/mqppvcrlvsgrsqelglod/settings/api
   - Copy the `anon` public key
   - Copy the `service_role` secret key

### Method 2: Claude Code MCP Configuration

Update your `claude-mcp-config.json`:

```json
{
  "mcpServers": {
    "supabase": {
      "command": "mcp-server-supabase",
      "args": [
        "--project-ref=mqppvcrlvsgrsqelglod"
      ],
      "env": {
        "SUPABASE_ACCESS_TOKEN": "sbp_cb907e8566ebad6a7f369a8359e96dc5c8a768fb"
      }
    }
  }
}
```

### Method 3: Direct Configuration in Code

For development, you can configure directly in your code:

```typescript
// supabase-config.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://mqppvcrlvsgrsqelglod.supabase.co'
const supabaseAnonKey = 'YOUR_ANON_KEY' // Get from dashboard
const supabaseServiceKey = 'YOUR_SERVICE_ROLE_KEY' // Get from dashboard

// For client-side operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// For server-side operations (more permissions)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
```

## 🔐 Getting Your Missing Keys

To get the anon and service role keys:

1. Open: https://supabase.com/dashboard/project/mqppvcrlvsgrsqelglod/settings/api
2. You'll see:
   - `anon` `public` - Safe for client-side
   - `service_role` `secret` - Server-side only (full access)
3. Copy both keys

## 🎯 Quick Test Script

Once you have the keys, test the connection:

```javascript
// test-supabase.js
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://mqppvcrlvsgrsqelglod.supabase.co'
const supabaseKey = 'YOUR_ANON_KEY_HERE'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  const { data, error } = await supabase
    .from('jobs')
    .select('id')
    .limit(1)
  
  if (error) {
    console.error('Connection failed:', error)
  } else {
    console.log('✅ Supabase connected successfully!')
    console.log('Sample data:', data)
  }
}

testConnection()
```

## 🤖 Claude Code Integration

When Claude Code is running with MCP configured, agents can use Supabase like this:

```typescript
// In agent commands
"supabase-architect: Query the jobs table for today's repairs"

// The agent will have access to:
- Database queries
- Edge function deployment
- Storage operations
- Auth management
- Realtime subscriptions
```

## 📦 Installation Commands

```bash
# Install MCP server for Supabase
npm install -g @modelcontextprotocol/server-supabase

# Install Supabase CLI (optional but useful)
npm install -g supabase

# Login to Supabase CLI
supabase login --token sbp_cb907e8566ebad6a7f369a8359e96dc5c8a768fb
```

## 🔧 Complete Setup Script

```bash
#!/bin/bash
# setup-supabase-claude.sh

# Set environment variables
export SUPABASE_URL="https://mqppvcrlvsgrsqelglod.supabase.co"
export SUPABASE_ACCESS_TOKEN="sbp_cb907e8566ebad6a7f369a8359e96dc5c8a768fb"
export SUPABASE_PROJECT_REF="mqppvcrlvsgrsqelglod"

# Install dependencies
npm install -g @modelcontextprotocol/server-supabase
npm install -g @anthropic-ai/claude-code

# Create config directory
mkdir -p ~/.claude

# Launch Claude Code with MCP
claude --mcp-server supabase="mcp-server-supabase --project-ref=mqppvcrlvsgrsqelglod"
```

## ⚠️ Security Notes

1. **Never commit** the `.env` file to git
2. **Service role key** should only be used server-side
3. **Anon key** is safe for client-side
4. **Access token** is for management API

## 🎯 Next Steps

1. Get the missing keys from Supabase dashboard
2. Create `.env` file with all credentials
3. Update `claude-mcp-config.json`
4. Test connection with the script
5. Launch Claude Code with `--mcp-config` flag

Your Supabase MCP is already configured in Claude Desktop, so we have the access token. You just need to get the anon and service role keys from your Supabase dashboard!
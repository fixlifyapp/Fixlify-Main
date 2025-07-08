# Supabase MCP Edge Function Management Guide

## Overview
The Supabase MCP (Model Context Protocol) provides built-in functions for managing edge functions directly through Claude. This guide documents how to use these functions.

## Available MCP Functions for Edge Functions

### 1. List Edge Functions
```
Use the Supabase MCP to list all edge functions in the project
```

### 2. Deploy Edge Function
```
Use the Supabase MCP to deploy edge function [function-name] with the following code:
[your function code]
```

### 3. Delete Edge Function
```
Use the Supabase MCP to delete edge function [function-name]
```

### 4. Get Edge Function Details
```
Use the Supabase MCP to get details for edge function [function-name]
```

### 5. Update Edge Function
```
Use the Supabase MCP to update edge function [function-name] with new code:
[updated function code]
```

### 6. List Secrets
```
Use the Supabase MCP to list all edge function secrets
```

### 7. Set Secret
```
Use the Supabase MCP to set secret [SECRET_NAME] with value [value]
```

### 8. Delete Secret
```
Use the Supabase MCP to delete secret [SECRET_NAME]
```

### 9. Get Function Logs
```
Use the Supabase MCP to get logs for edge function [function-name]
```

## Example Usage in Claude

### Deploying a New Edge Function
```
Deploy a new edge function called "hello-world" with this code:

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  return new Response(
    JSON.stringify({ message: "Hello from Edge Function!" }),
    { headers: { "Content-Type": "application/json" } }
  )
})
```

### Managing Secrets
```
1. List all current secrets:
   "Show me all edge function secrets"

2. Set a new secret:
   "Set edge function secret API_KEY with value sk_test_123"

3. Delete a secret:
   "Delete edge function secret OLD_API_KEY"
```

### Function Management
```
1. List all functions:
   "List all edge functions in my Supabase project"

2. Get function details:
   "Show me details for the send-email edge function"

3. Update a function:
   "Update the send-sms edge function with this new code: [code]"

4. Delete a function:
   "Delete the old-webhook edge function"
```

## MCP Configuration Requirements

Your Claude Desktop should already be configured with the Supabase MCP. The configuration looks like this:

```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": [
        "-y",
        "@supabase/mcp-server-supabase@latest",
        "--project-ref=mqppvcrlvsgrsqelglod"
      ],
      "env": {
        "SUPABASE_ACCESS_TOKEN": "your-personal-access-token"
      }
    }
  }
}
```

## Security Notes

1. **Personal Access Token**: Required for authentication
2. **Project Reference**: Links to your specific Supabase project
3. **Permissions**: The MCP uses your PAT permissions

## Troubleshooting

### MCP Not Working
1. Check if Claude Desktop is restarted after config changes
2. Verify your Personal Access Token is valid
3. Ensure project reference is correct

### Function Deployment Fails
1. Check function syntax (must be valid Deno/TypeScript)
2. Verify secret dependencies are set
3. Check for naming conflicts

### Secret Management Issues
1. Secret names must be uppercase with underscores
2. Some secrets are reserved (SUPABASE_URL, etc.)
3. Secrets are project-wide, not function-specific

## Best Practices

1. **Test Locally First**: Use `supabase functions serve` for local testing
2. **Version Control**: Keep function code in your repository
3. **Secret Rotation**: Regularly update API keys and secrets
4. **Monitoring**: Check function logs regularly
5. **Error Handling**: Always include try-catch blocks

## Common Edge Function Operations

### 1. Create Email Function
```
Create an edge function called "send-email" that sends emails using Resend API
```

### 2. Create Webhook Handler
```
Create an edge function called "stripe-webhook" to handle Stripe webhooks
```

### 3. Create Scheduled Function
```
Create an edge function called "daily-cleanup" that runs on a schedule
```

### 4. Create API Proxy
```
Create an edge function called "api-proxy" that forwards requests to external APIs
```

## Integration with Your Project

The Supabase MCP integrates with your existing project structure:

1. **Edge Functions**: Located in `supabase/functions/`
2. **Secrets**: Managed via MCP or CLI
3. **Deployment**: Automatic through MCP
4. **Logs**: Accessible via MCP queries

## Summary

The Supabase MCP provides comprehensive edge function management capabilities directly within Claude. You can:

- Deploy, update, and delete edge functions
- Manage environment secrets
- View function logs and debug issues
- All without leaving the Claude interface

Simply ask Claude to perform these operations using natural language, and the MCP will handle the underlying API calls to Supabase.

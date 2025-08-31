# 🚀 Telnyx Remote MCP Server Setup for Fixlify AI Dispatcher

## Understanding MCP (Model Context Protocol)
MCP is Anthropic's open standard that allows AI models to interact with external services. Telnyx has implemented both Local and Remote MCP servers. You want the **Remote MCP** which is hosted by Telnyx and connects directly to your application.

## The Problem with the UI
The Telnyx MCP Server creation UI has a bug where the API Key dropdown isn't populating correctly. Here's how to work around it:

## Solution 1: Direct API Setup (Recommended)

Since the UI isn't working, let's create the MCP Server using Telnyx API directly:

```javascript
// Run this in your browser console or create a Node.js script
async function createTelnyxMCPServer() {
  const TELNYX_API_KEY = 'KEY0197FA2410DD8BC7BF6A6EFA96E32B2'; // Your actual API key
  
  const response = await fetch('https://api.telnyx.com/v2/mcp_servers', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${TELNYX_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: 'Fixlify AI Voice Assistant',
      type: 'HTTP',
      webhook_url: 'https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/telnyx-mcp-handler',
      integration_secrets: [
        {
          identifier: 'mcp_webhook_secret',
          value: 'mcp_xY9kL2mN8pQ4rS7tU1vW3zA5bC6dE8fG0hJ2'
        }
      ],
      api_key_id: 'YOUR_API_KEY_ID' // We need to find this
    })
  });
  
  const result = await response.json();
  console.log('MCP Server created:', result);
  return result;
}
```

## Solution 2: Alternative UI Approach

If the dropdown shows your API keys but you can't select them:

1. **Open Browser Developer Tools** (F12)
2. **Inspect the API Key dropdown element**
3. **Manually set the value** in console:
```javascript
// Find the select element
const apiKeySelect = document.querySelector('[name="api_key"]'); // Adjust selector as needed
// Set your API key value
apiKeySelect.value = 'KEY0197FA2410DD8BC7BF6A6EFA96E32B2';
// Trigger change event
apiKeySelect.dispatchEvent(new Event('change', { bubbles: true }));
```

## Solution 3: SSE Configuration (What Telnyx Actually Uses)

Based on the documentation, Telnyx Remote MCP uses SSE (Server-Sent Events). Let's configure it properly:

### Step 1: Update Edge Function for SSE Support
```typescript
// Add SSE handling to your edge function
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  const url = new URL(req.url);
  
  // Handle SSE endpoint
  if (url.pathname === '/v1/telnyx-mcp-handler/sse') {
    const headers = new Headers({
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    });
    
    const body = new ReadableStream({
      start(controller) {
        // Send initial connection event
        controller.enqueue(new TextEncoder().encode('event: connected\ndata: {"status": "ready"}\n\n'));
        
        // Keep connection alive
        const interval = setInterval(() => {
          controller.enqueue(new TextEncoder().encode(':keepalive\n\n'));
        }, 30000);
        
        // Clean up on close
        req.signal.addEventListener('abort', () => {
          clearInterval(interval);
          controller.close();
        });
      }
    });
    
    return new Response(body, { headers });
  }
  
  // Handle regular HTTP webhooks
  // ... rest of your existing code
});
```

### Step 2: Configure MCP for Your Use Case

The MCP Server should handle:
1. **Incoming calls** → Route to AI based on company settings
2. **Voice transcription** → Using Whisper API
3. **AI responses** → Based on company's custom prompts
4. **Call routing** → To specific departments/agents

## The Correct MCP Server Configuration

```yaml
MCP Server Settings (What it SHOULD be):
─────────────────────────────────────────
Name: Fixlify AI Voice Assistant
Type: SSE (for real-time streaming)
URL: https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/telnyx-mcp-handler
Integration Secret: mcp_webhook_secret = mcp_xY9kL2mN8pQ4rS7tU1vW3zA5bC6dE8fG0hJ2
API Key: [Should be selectable from dropdown - KEY0197FA2410DD8BC7BF6A6EFA96E32B2]
```

## Working Around the UI Bug

Since the API Key dropdown isn't working, try this:

### Option A: Contact Telnyx Support
Email support@telnyx.com with:
```
Subject: MCP Server Creation - API Key Dropdown Issue

I'm trying to create a Remote MCP Server but the API Key dropdown is not showing my available API keys. Instead, it's showing "mcp_webhook_secret" which is causing an error.

My API Key: KEY0197FA2410DD8BC7BF6A6EFA96E32B2
Desired MCP Server Name: Fixlify AI Voice Assistant
Webhook URL: https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/telnyx-mcp-handler

Please help create this MCP Server or fix the dropdown issue.
```

### Option B: Use Telnyx CLI
```bash
# Install Telnyx CLI
npm install -g @telnyx/cli

# Login
telnyx login --api-key KEY0197FA2410DD8BC7BF6A6EFA96E32B2

# Create MCP Server
telnyx mcp-servers create \
  --name "Fixlify AI Voice Assistant" \
  --type HTTP \
  --url "https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/telnyx-mcp-handler" \
  --secret-identifier "mcp_webhook_secret" \
  --secret-value "mcp_xY9kL2mN8pQ4rS7tU1vW3zA5bC6dE8fG0hJ2"
```

## How MCP Will Work with Your App

```mermaid
graph TD
    A[Customer Calls +14375249932] --> B[Telnyx MCP Server]
    B --> C[Your Edge Function]
    C --> D[Check Company Settings]
    D --> E[Load AI Config]
    E --> F[Process with OpenAI]
    F --> G[Generate Response]
    G --> H[Speak to Customer]
    H --> I[Log Interaction]
```

## Integration with Fixlify Features

Your MCP handler will:
1. **Identify the company** from the phone number called
2. **Load company-specific AI settings** from `ai_dispatcher_configs`
3. **Use custom prompts** based on business type
4. **Route calls** to appropriate departments
5. **Create tickets** for service requests
6. **Schedule appointments** directly
7. **Send SMS confirmations** after calls

## Testing Your MCP Setup

Once created, test with:

```javascript
// Test MCP connection
async function testMCPConnection() {
  const response = await fetch('https://api.telnyx.com/mcp/sse', {
    headers: {
      'Authorization': 'Bearer KEY0197FA2410DD8BC7BF6A6EFA96E32B2',
      'Accept': 'text/event-stream'
    }
  });
  
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    console.log('MCP Event:', decoder.decode(value));
  }
}
```

## Expected Outcome

When properly configured, your AI Dispatcher will:
- Answer calls instantly (< 500ms)
- Understand context from company settings
- Handle multiple languages
- Transfer to humans when needed
- Log all interactions for analytics
- Learn from each conversation

This is the future of customer service - fully automated, AI-powered, and customizable per company!
# Telnyx MCP Server - Exact Configuration Settings

## 🎯 Step-by-Step Setup

### Screen 1: Main MCP Server Settings

```yaml
Name: Fixlify AI Voice Assistant

Type: HTTP (Select HTTP, not SSE)

URL: https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/telnyx-mcp-handler

API Key: [Leave empty for now - we'll get this]
```

### Screen 2: Integration Secret (When you click "+ Append integration secret")

```yaml
Identifier: SUPABASE_WEBHOOK_SECRET

Secret Value: [Generate a secure random string, e.g.: mcp_secret_xY9kL2mN8pQ4rS7tU1vW3zA5bC6dE8fG0]
```

## 📋 Complete Configuration

### 1. First, Get Your Telnyx API Key

Go to Telnyx Dashboard → API Keys → Create or Copy existing key

Your Telnyx API keys are likely one of these:
- **Live API Key**: `KEY0123456789ABCDEF...` (use this for production)
- **Test API Key**: `KEYTEST123456789...` (use for testing)

### 2. Fill in the MCP Server Form

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Create MCP Server

Name: [Fixlify AI Voice Assistant]

Type: [HTTP] [SSE]  ← Select HTTP

URL: [https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/telnyx-mcp-handler]

+ Append integration secret ← Click this

API Key: [Select your Telnyx API Key from dropdown]
         ↓
    Your options will be:
    - Your main API key (KEY...)
    - Test API key if you have one
    - Select the one you use for SMS

[Cancel] [Save]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 3. Integration Secret Settings (Popup)

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
New Integration Secret

Identifier: [SUPABASE_WEBHOOK_SECRET]

Secret Value: [mcp_secret_xY9kL2mN8pQ4rS7tU1vW3zA5bC6dE8fG0]

[Cancel] [Save]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## 🔐 Generate a Secure Secret

Use this command to generate a secure secret:
```bash
# Windows PowerShell
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | % {[char]$_})

# Or use this online generator:
# https://passwordsgenerator.net/ (set to 32 characters, alphanumeric)
```

## 🚀 After Creating MCP Server

You'll receive:
```json
{
  "mcp_server_id": "mcp_xxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "webhook_url": "https://mcp.telnyx.com/v2/servers/[mcp_server_id]",
  "status": "active"
}
```

## 📦 Deploy the Handler Function

Create this edge function to handle MCP requests:

```typescript
// supabase/functions/telnyx-mcp-handler/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const WEBHOOK_SECRET = Deno.env.get('SUPABASE_WEBHOOK_SECRET'); // Same as integration secret

serve(async (req) => {
  // Verify the webhook signature
  const signature = req.headers.get('telnyx-signature');
  const timestamp = req.headers.get('telnyx-timestamp');
  
  if (!verifyWebhook(await req.text(), signature, timestamp, WEBHOOK_SECRET)) {
    return new Response('Unauthorized', { status: 401 });
  }

  const event = await req.json();
  console.log('MCP Event:', event);

  // Handle different event types
  switch(event.data.event_type) {
    case 'call.initiated':
      return handleCallInitiated(event);
    case 'call.answered':
      return handleCallAnswered(event);
    case 'call.speak.ended':
      return handleSpeakEnded(event);
    default:
      return new Response(JSON.stringify({ status: 'ok' }), {
        headers: { 'Content-Type': 'application/json' }
      });
  }
});

function handleCallInitiated(event) {
  // Start the conversation
  return new Response(JSON.stringify({
    action: 'speak',
    payload: {
      text: 'Hello! This is Fixlify AI Assistant. How can I help you today?',
      voice: 'Polly.Joanna',
      language: 'en-US'
    }
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

function handleCallAnswered(event) {
  // Call was answered, start AI interaction
  return new Response(JSON.stringify({
    action: 'gather_using_speak',
    payload: {
      text: 'Please tell me how I can help you with your service needs.',
      voice: 'Polly.Joanna',
      language: 'en-US',
      valid_digits: '1234567890#',
      timeout_millis: 5000,
      inter_digit_timeout_millis: 3000
    }
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

function handleSpeakEnded(event) {
  // Process what the caller said
  const transcript = event.data.payload.transcript;
  
  // Generate AI response based on transcript
  const aiResponse = generateAIResponse(transcript);
  
  return new Response(JSON.stringify({
    action: 'speak',
    payload: {
      text: aiResponse,
      voice: 'Polly.Joanna',
      language: 'en-US'
    }
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

function verifyWebhook(payload, signature, timestamp, secret) {
  // Implement Telnyx signature verification
  const crypto = require('crypto');
  const expectedSig = crypto
    .createHmac('sha256', secret)
    .update(`${timestamp}.${payload}`)
    .digest('hex');
  return signature === `v1=${expectedSig}`;
}
```

## 🔄 Deploy Steps

1. **Save the secret in Supabase:**
```bash
supabase secrets set SUPABASE_WEBHOOK_SECRET=mcp_secret_xY9kL2mN8pQ4rS7tU1vW3zA5bC6dE8fG0
```

2. **Deploy the function:**
```bash
supabase functions deploy telnyx-mcp-handler
```

3. **Test the endpoint:**
```bash
curl -X POST https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/telnyx-mcp-handler \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

## ✅ Summary of Exact Values

| Field | Value |
|-------|-------|
| **Name** | Fixlify AI Voice Assistant |
| **Type** | HTTP |
| **URL** | https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/telnyx-mcp-handler |
| **Integration Secret Identifier** | SUPABASE_WEBHOOK_SECRET |
| **Integration Secret Value** | [Generate 32-char random string] |
| **API Key** | [Select your Telnyx API key from dropdown] |

## 🎯 What API Key to Select?

In the API Key dropdown, you'll see your Telnyx API keys. Select:
- **Your Production Key** (starts with KEY...) for live system
- **Your Test Key** (starts with KEYTEST...) for testing

This is the same API key you're currently using for SMS in your edge functions!

## Need Your Current Telnyx API Key?

Check your Supabase edge function secrets:
1. Go to Supabase Dashboard
2. Edge Functions → Secrets
3. Look for `TELNYX_API_KEY`
4. That's the one to select in the dropdown!
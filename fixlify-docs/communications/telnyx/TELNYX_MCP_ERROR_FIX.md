# 🚨 IMPORTANT: How to Fix the Telnyx MCP Server Error

## The Problem:
You're seeing "Error listing tools from MCP server" because the API Key field is expecting you to SELECT an existing Telnyx API key from a dropdown, but `mcp_webhook_secret` is appearing instead.

## The Solution:

### Step 1: Clear and Reset
1. Click **Cancel** on the Integration Secret dialog if it's open
2. In the main MCP Server form, **clear** the API Key field

### Step 2: Understanding the Fields

#### Integration Secret (✅ You already added this correctly):
- **Identifier**: `mcp_webhook_secret`
- **Secret Value**: `mcp_xY9kL2mN8pQ4rS7tU1vW3zA5bC6dE8fG0hJ2`
- This is for webhook verification between Telnyx and your edge function

#### API Key Field (❌ This is the problem):
- This should be a **dropdown selector** showing your Telnyx API keys
- You need to SELECT your key: `KEY0197FA2410DD8BC7BF6A6EFA96E32B2`
- NOT type anything manually

### Step 3: The Correct Setup

Since the dropdown isn't working properly, try this alternative approach:

## Alternative Solution - Use Call Control Application Instead:

1. **Cancel** the current MCP Server creation

2. **Create a Call Control Application** instead:
   - Go to Telnyx Dashboard → Voice → Call Control Applications
   - Click "Create Application"
   - Name: `Fixlify AI Dispatcher`
   - Webhook URL: `https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/telnyx-mcp-handler`
   - Enable "Send webhooks for"
     - ✅ call.initiated
     - ✅ call.answered
     - ✅ call.hangup
     - ✅ call.speak.ended
     - ✅ call.gather.ended

3. **Assign your phone number** to this application:
   - Go to Phone Numbers
   - Click on `+14375249932`
   - Under Voice, select your new Call Control Application
   - Save

## Why This Works Better:

The MCP Server feature in Telnyx seems to be having issues with the API key selector. Using a Call Control Application achieves the same result - it will send webhooks to your edge function when calls come in, and your AI dispatcher will handle them.

## Test Your Setup:

Once configured, test with this browser console script:

```javascript
// Test the webhook handler directly
async function testWebhook() {
  const testEvent = {
    data: {
      event_type: 'call.initiated',
      payload: {
        call_control_id: 'test-' + Date.now(),
        from: '+1234567890',
        to: '+14375249932',
        direction: 'inbound'
      }
    }
  };
  
  const response = await fetch('https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/telnyx-mcp-handler', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(testEvent)
  });
  
  console.log('Test result:', await response.json());
}

testWebhook();
```

## Summary:

1. The MCP Server UI in Telnyx has a bug with the API key selector
2. Use Call Control Applications instead - it's more reliable
3. Your edge function is ready and will work with either approach
4. The webhook secret is only needed if you want signature verification (optional)
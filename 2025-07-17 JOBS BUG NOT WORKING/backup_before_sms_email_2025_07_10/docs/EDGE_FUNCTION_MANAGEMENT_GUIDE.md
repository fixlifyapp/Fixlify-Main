# Edge Function Management Guide for Supabase MCP

## Overview

The Supabase MCP (Model Context Protocol) provides built-in functions for managing edge functions in your Fixlify project. This guide explains how to use these functions effectively.

## Available Supabase MCP Functions

### 1. List Edge Functions
```javascript
// To list all edge functions in your project
supabase-v2:list_edge_functions
```

This returns an array of edge functions with details like:
- `id`: Unique identifier
- `slug`: Function name/path
- `name`: Display name
- `status`: ACTIVE/INACTIVE
- `version`: Current version number
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp

### 2. Deploy Edge Function
```javascript
// To deploy a new edge function or update existing one
supabase-v2:deploy_edge_function({
  name: "function-name",
  files: [
    {
      name: "index.ts",
      content: "// Your function code here"
    }
  ],
  entrypoint_path: "index.ts", // Optional, defaults to index.ts
  import_map_path: "import_map.json" // Optional
})
```

### 3. Execute SQL (for function-related database operations)
```javascript
// To execute SQL queries related to edge functions
supabase-v2:execute_sql({
  query: "SELECT * FROM edge_function_logs WHERE function_name = 'my-function'"
})
```

### 4. Get Logs
```javascript
// To get logs for edge functions
supabase-v2:get_logs({
  service: "edge-function"
})
```

## Current Edge Functions in Your Project

Based on the list, you have the following edge functions:

1. **generate-with-ai** - AI text generation using OpenAI
2. **test-openai** - OpenAI API testing
3. **notifications** - SMS/Email notification handling
4. **automation-executor** - Automation workflow execution
5. **send-email** - Email sending via Mailgun
6. **send-team-invitation** - Team member invitation emails
7. **telnyx-sms** - SMS sending via Telnyx
8. **portal-data** - Client portal data retrieval
9. **send-estimate** - Estimate email sending
10. **send-invoice** - Invoice email sending
11. **mailgun-email** - Generic Mailgun email handler

## How to Use Edge Functions

### Invoking Edge Functions from Frontend

```typescript
// Example: Send an email
const { data, error } = await supabase.functions.invoke('send-email', {
  body: {
    to: 'customer@example.com',
    subject: 'Your Invoice',
    html: '<h1>Invoice Details</h1>',
    text: 'Invoice Details'
  }
});

// Example: Get AI-generated content
const { data, error } = await supabase.functions.invoke('generate-with-ai', {
  body: {
    prompt: 'Generate a professional estimate email',
    context: 'HVAC service business',
    fetchBusinessData: true,
    userId: user.id
  }
});
```

### Creating New Edge Functions

1. **Create the function code**:
```typescript
// Example edge function structure
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Your function logic here
    const { param1, param2 } = await req.json();
    
    // Process the request
    const result = await processRequest(param1, param2);
    
    return new Response(
      JSON.stringify({ success: true, data: result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
```

2. **Deploy using Supabase MCP**:
```javascript
// Deploy the function
await deployEdgeFunction({
  name: "my-new-function",
  files: [{
    name: "index.ts",
    content: functionCode
  }]
});
```

## Environment Variables

Edge functions can access environment variables set in your Supabase project:

```typescript
// In your edge function
const apiKey = Deno.env.get('MY_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
```

## Best Practices

1. **Error Handling**: Always wrap your code in try-catch blocks
2. **CORS Headers**: Include proper CORS headers for browser compatibility
3. **Authentication**: Verify user tokens when needed
4. **Logging**: Use console.log for debugging (visible in Supabase logs)
5. **Response Format**: Always return JSON responses with appropriate status codes

## Common Use Cases

### 1. Email/SMS Notifications
```typescript
// Send notification when job status changes
await supabase.functions.invoke('notifications', {
  body: {
    type: 'job_update',
    phoneNumber: client.phone,
    data: {
      jobId: job.id,
      status: 'completed',
      message: 'Your service job has been completed'
    }
  }
});
```

### 2. AI-Powered Features
```typescript
// Generate AI insights for business
await supabase.functions.invoke('generate-with-ai', {
  body: {
    prompt: 'Analyze my business performance this month',
    fetchBusinessData: true,
    userId: currentUser.id
  }
});
```

### 3. Automation Triggers
```typescript
// Execute automation workflow
await supabase.functions.invoke('automation-executor', {
  body: {
    workflowId: 'workflow-123',
    triggeredBy: 'job_completed',
    entityId: job.id,
    entityType: 'job',
    context: { clientId: job.client_id }
  }
});
```

## Monitoring and Debugging

### View Function Logs
```javascript
// Get recent logs for a specific function
const logs = await supabase.functions.invoke('get_logs', {
  body: {
    service: 'edge-function',
    functionName: 'send-email',
    limit: 100
  }
});
```

### Check Function Status
Monitor your edge functions through:
1. Supabase Dashboard > Functions
2. Using the `list_edge_functions` MCP command
3. Checking logs with `get_logs` command

## Security Considerations

1. **API Keys**: Store sensitive keys as environment variables
2. **Authentication**: Always verify user tokens for protected endpoints
3. **Rate Limiting**: Implement rate limiting for public endpoints
4. **Input Validation**: Validate all incoming data
5. **Error Messages**: Don't expose sensitive information in error responses

## Troubleshooting

### Common Issues:

1. **CORS Errors**: Ensure CORS headers are properly set
2. **Authentication Failures**: Check token validity and format
3. **Timeout Issues**: Edge functions have a 25-second timeout limit
4. **Missing Environment Variables**: Verify all required env vars are set

### Debug Steps:
1. Check function logs using `get_logs`
2. Test locally using Supabase CLI
3. Verify environment variables
4. Check network requests in browser DevTools

This guide should help you effectively manage edge functions in your Fixlify project using the Supabase MCP.

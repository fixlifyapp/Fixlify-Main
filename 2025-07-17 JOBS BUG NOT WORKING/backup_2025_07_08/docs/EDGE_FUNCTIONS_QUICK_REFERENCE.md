# Edge Function Management Quick Reference

## Supabase MCP Commands

### List Edge Functions
```javascript
// Via Supabase client
const functions = await supabase.functions.list();

// Via MCP directly
supabase-v2:list_edge_functions
```

### Deploy Edge Function
```javascript
// Via Supabase client
await supabase.functions.deploy('my-function', {
  files: [{
    name: 'index.ts',
    content: functionCode
  }]
});

// Via MCP directly
supabase-v2:deploy_edge_function({
  name: "my-function",
  files: [{
    name: "index.ts",
    content: functionCode
  }]
})
```

### Invoke Edge Function
```javascript
// Via Supabase client
const { data, error } = await supabase.functions.invoke('my-function', {
  body: { param1: 'value1' }
});
```

### Get Function Logs
```javascript
// Via MCP
supabase-v2:get_logs({
  service: "edge-function"
})
```

## Common Edge Functions in Fixlify

### Send Email
```javascript
await supabase.functions.invoke('send-email', {
  body: {
    to: 'customer@example.com',
    subject: 'Your Invoice',
    html: '<h1>Invoice</h1>',
    text: 'Invoice details'
  }
});
```

### Send SMS
```javascript
await supabase.functions.invoke('telnyx-sms', {
  body: {
    recipientPhone: '+1234567890',
    message: 'Your appointment is confirmed',
    userId: currentUser.id
  }
});
```

### Generate AI Content
```javascript
await supabase.functions.invoke('generate-with-ai', {
  body: {
    prompt: 'Generate estimate email',
    context: 'HVAC service',
    fetchBusinessData: true,
    userId: currentUser.id
  }
});
```

### Execute Automation
```javascript
await supabase.functions.invoke('automation-executor', {
  body: {
    workflowId: 'workflow-id',
    triggeredBy: 'job_completed',
    entityId: jobId,
    entityType: 'job',
    context: { clientId, userId }
  }
});
```

## Environment Variables Available
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`
- `MAILGUN_API_KEY`
- `TELNYX_API_KEY`

## Error Handling Pattern
```javascript
try {
  const { data, error } = await supabase.functions.invoke('function-name', {
    body: payload
  });
  
  if (error) throw error;
  return data;
} catch (error) {
  console.error('Edge function error:', error);
  // Handle error appropriately
}
```

## CLI Commands (for reference)
```bash
# Deploy function
supabase functions deploy function-name

# Set secret
supabase secrets set KEY_NAME=value

# View logs
supabase functions logs function-name

# Delete function
supabase functions delete function-name
```

## Resources
- Full Guide: `/docs/EDGE_FUNCTION_MANAGEMENT_GUIDE.md`
- Examples: `/src/utils/edge-function-examples.ts`
- Supabase Docs: https://supabase.com/docs/guides/functions

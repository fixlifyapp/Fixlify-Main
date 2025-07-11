# Two-Way SMS Setup Guide for Fixlify

## Overview
This guide explains how to set up two-way SMS messaging in the Fixlify messages center using Telnyx webhooks.

## Current Status
- **Outbound SMS**: ✅ Working (via `telnyx-sms` edge function)
- **Inbound SMS**: ❌ Not implemented (needs webhook setup)

## What Needs to Be Done

### 1. Create Webhook Edge Function
Deploy an edge function to handle incoming SMS messages from Telnyx:

```typescript
// Edge function: telnyx-webhook
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  try {
    const payload = await req.json();
    
    if (payload.data.event_type === 'message.received') {
      const { from, to, text, id } = payload.data.payload;
      
      // Find or create conversation
      const { data: conversation } = await supabase
        .from('message_conversations')
        .select('*')
        .eq('client_phone', from.phone_number)
        .single();
      
      if (conversation) {
        // Add message to conversation
        await supabase.from('messages').insert({
          conversation_id: conversation.id,
          content: text,
          direction: 'inbound',
          phone_number: from.phone_number,
          external_id: id,
          metadata: payload.data
        });
      }
    }
    
    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    });
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500
    });
  }
});
```

### 2. Configure Telnyx Webhook
In the Telnyx dashboard:
1. Go to Messaging > Messaging Profiles
2. Select your messaging profile
3. Add webhook URL: `https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/telnyx-webhook`
4. Enable "Inbound Message" events

### 3. Update Database Schema
Add fields to handle two-way messaging:

```sql
-- Add to messages table
ALTER TABLE messages ADD COLUMN IF NOT EXISTS external_id TEXT;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS metadata JSONB;

-- Create index for webhook lookups
CREATE INDEX IF NOT EXISTS idx_messages_external_id ON messages(external_id);
```

### 4. Update Frontend Components
The messages center components need to:
- Subscribe to real-time updates for incoming messages
- Display message direction (inbound/outbound)
- Show delivery status

## Implementation Steps

1. **Deploy the webhook edge function** using Supabase MCP
2. **Configure Telnyx** to send webhooks to your edge function
3. **Update database** with new columns
4. **Test** by sending an SMS to your Telnyx number

## Testing Two-Way SMS

1. Send a test SMS from the messages center
2. Reply to that SMS from a phone
3. Check if the reply appears in the messages center
4. Verify the conversation thread is maintained

## Security Considerations

- Validate webhook signatures from Telnyx
- Rate limit incoming messages
- Filter spam/unwanted messages
- Store phone numbers securely

## Troubleshooting

### Messages not appearing
- Check edge function logs: `supabase functions logs telnyx-webhook`
- Verify webhook is configured in Telnyx
- Check database permissions

### Webhook errors
- Ensure edge function is deployed and active
- Verify Supabase URL is correct
- Check for rate limiting

## Future Enhancements

1. **MMS Support** - Handle image/media messages
2. **Auto-responses** - Set up automated replies
3. **Message Templates** - Quick responses for common queries
4. **Analytics** - Track message volume and response times

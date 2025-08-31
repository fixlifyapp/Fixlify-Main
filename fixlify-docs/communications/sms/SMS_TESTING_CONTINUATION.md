# SMS System Testing Guide

## Current Setup Status

Based on the screenshots, you have a test script (`test-incoming-sms.js`) that simulates an incoming SMS from an unknown number. The test is designed to:

1. Simulate an incoming SMS from `+19999999999` (unknown number)
2. Send it to your Telnyx number `+14377476737`
3. Check if a new client was created
4. Verify a conversation was created
5. Confirm the message was logged
6. Attempt to send a reply back

## What We Need to Continue

### 1. Get Your Service Role Key

To run the test script, you need your Supabase service role key:

1. Go to: https://supabase.com/dashboard/project/mqppvcrlvsgrsqelglod/settings/api
2. Find the "service_role" key (it's a long JWT starting with `eyJ...`)
3. Copy it for use in testing

### 2. Test Without Service Role Key (Browser Method)

If you can't access the service role key right now, use this browser-based test:

```javascript
// Run this in your browser console at http://localhost:8081 when logged in
(async () => {
  console.log('🚀 Testing SMS System...');
  
  // Get current user
  const { data: { user } } = await window.supabase.auth.getUser();
  if (!user) {
    console.error('❌ Not logged in');
    return;
  }
  
  // Check phone numbers
  const { data: phones } = await window.supabase
    .from('phone_numbers')
    .select('*')
    .eq('user_id', user.id);
  console.log('📱 Your phone numbers:', phones);
  
  // Check existing conversations
  const { data: conversations } = await window.supabase
    .from('sms_conversations')
    .select('*, client:clients(*)')
    .eq('user_id', user.id)
    .order('last_message_at', { ascending: false });
  console.log('💬 Conversations:', conversations);
  
  // Check recent messages
  const { data: messages } = await window.supabase
    .from('sms_messages')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);
  console.log('📨 Recent messages:', messages);
  
  // Create a test conversation if none exist
  if (!conversations || conversations.length === 0) {
    console.log('Creating test conversation...');
    
    // First create a test client
    const { data: testClient } = await window.supabase
      .from('clients')
      .insert({
        name: 'Test Client',
        phone: '+15555551234',
        email: 'test@example.com',
        user_id: user.id,
        type: 'individual',
        status: 'lead'
      })
      .select()
      .single();
    
    if (testClient) {
      // Create conversation
      const { data: newConv } = await window.supabase
        .from('sms_conversations')
        .insert({
          user_id: user.id,
          client_id: testClient.id,
          client_phone: testClient.phone,
          status: 'active',
          unread_count: 0
        })
        .select()
        .single();
      
      console.log('✅ Created test conversation:', newConv);
    }
  }
  
  console.log('\n✅ SMS system check complete!');
  console.log('Go to /communications to see the Connect Center');
})();
```

### 3. Manual Database Test

Run these SQL queries in Supabase SQL Editor to verify the system:

```sql
-- Check all SMS-related tables
SELECT table_name, 
       (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
AND table_name IN ('phone_numbers', 'clients', 'sms_conversations', 'sms_messages', 'communication_logs')
ORDER BY table_name;

-- Check if you have a phone number configured
SELECT * FROM phone_numbers WHERE phone_number = '+14377476737';

-- Check recent SMS activity
SELECT 
  m.id,
  m.created_at,
  m.direction,
  m.from_number,
  m.to_number,
  m.content,
  m.status,
  c.name as client_name
FROM sms_messages m
LEFT JOIN sms_conversations conv ON m.conversation_id = conv.id
LEFT JOIN clients c ON conv.client_id = c.id
ORDER BY m.created_at DESC
LIMIT 10;

-- Check for unknown number handling
SELECT * FROM clients WHERE phone LIKE '%999999%' ORDER BY created_at DESC;
```

### 4. Test Sending SMS (With Service Role Key)

Once you have the service role key, create a `.env` file:

```bash
VITE_SUPABASE_URL=https://mqppvcrlvsgrsqelglod.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

Then run:

```bash
node test-incoming-sms.js
```

### 5. Test in the UI

1. Log into the app at http://localhost:8081
2. Navigate to Connect Center (/communications)
3. You should see:
   - SMS Conversations tab
   - Any existing conversations
   - Ability to send new messages

### 6. Verify Unknown Number Handling

The system should automatically:
- Create a new client record for unknown numbers
- Name format: "Unknown (+1XXXXXXXXXX)"
- Create a conversation linked to this client
- Log the incoming message
- Allow you to reply through the UI

## Expected Results

✅ Database tables exist and have proper structure
✅ User has at least one phone number configured
✅ SMS webhook creates clients for unknown numbers
✅ Conversations are created and visible in Connect Center
✅ Messages are logged with proper metadata
✅ Two-way communication works through the UI

## Troubleshooting

If the test isn't working:

1. **Check Edge Functions**: Ensure `send-sms` and `sms-webhook` are deployed
2. **Verify Phone Number**: Make sure you have a phone number in the `phone_numbers` table
3. **Check Logs**: Look at Edge Function logs in Supabase dashboard
4. **Test Webhook URL**: The webhook should be at `https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/sms-webhook`

## Next Steps

1. Complete the test to verify unknown number handling works
2. Test sending replies through the Connect Center UI
3. Verify all messages are properly logged
4. Test with real Telnyx webhooks (configure in Telnyx portal)

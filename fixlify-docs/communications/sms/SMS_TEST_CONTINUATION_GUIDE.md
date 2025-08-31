# SMS Testing - Next Steps Summary

## Current Status
Based on the screenshots, you're implementing a comprehensive SMS test that simulates incoming messages from unknown numbers. The test should:
- Create a new client automatically for unknown numbers
- Create a conversation thread
- Log the message
- Allow replies through the UI

## To Continue Testing:

### Option 1: Get Service Role Key and Run Test
1. **Get your service role key:**
   - Go to: https://supabase.com/dashboard/project/mqppvcrlvsgrsqelglod/settings/api
   - Copy the "service_role" key (long JWT starting with `eyJ...`)

2. **Run the PowerShell test:**
   ```powershell
   .\test-sms-webhook-simple.ps1 -ServiceRoleKey "your_service_role_key_here"
   ```

3. **Or run the Node.js test:**
   ```bash
   # Set environment variable
   export SUPABASE_SERVICE_ROLE_KEY="your_service_role_key_here"
   
   # Run test
   node test-incoming-sms.js
   ```

### Option 2: Test Through Browser (Limited)
1. Open `sms-test-suite.html` in your browser
2. Log in with your credentials
3. Use the test buttons to check system status
4. Note: Full webhook simulation requires service role key

### Option 3: Manual Database Testing
Run these queries in Supabase SQL Editor:

```sql
-- First, get your user ID
SELECT id, email FROM auth.users WHERE email = 'your_email@example.com';

-- Manually create a test scenario (replace USER_ID with your actual ID)
-- 1. Create an unknown client
INSERT INTO clients (name, phone, email, user_id, type, status, notes)
VALUES (
  'Unknown (+19999999999)', 
  '+19999999999', 
  null, 
  'USER_ID', 
  'individual', 
  'lead',
  jsonb_build_object('auto_created', true, 'created_from', 'manual_test', 'timestamp', now())
)
ON CONFLICT (user_id, phone) DO UPDATE
SET notes = clients.notes || jsonb_build_object('last_test', now())
RETURNING *;

-- 2. Create a conversation (use the client_id from above)
INSERT INTO sms_conversations (user_id, client_id, client_phone, status, unread_count)
VALUES ('USER_ID', 'CLIENT_ID_FROM_ABOVE', '+19999999999', 'active', 1)
RETURNING *;

-- 3. Create a test message (use conversation_id from above)
INSERT INTO sms_messages (
  conversation_id, 
  direction, 
  from_number, 
  to_number, 
  content, 
  status,
  telnyx_message_id
)
VALUES (
  'CONVERSATION_ID_FROM_ABOVE',
  'inbound',
  '+19999999999',
  '+14377476737',
  'Hi, I need a plumber for my kitchen sink. Can you help?',
  'delivered',
  'test-' || gen_random_uuid()
)
RETURNING *;

-- 4. Update conversation with last message
UPDATE sms_conversations 
SET 
  last_message_at = now(),
  last_message_preview = 'Hi, I need a plumber for my kitchen sink. Can you help?',
  unread_count = 1
WHERE id = 'CONVERSATION_ID_FROM_ABOVE';
```

## Verify Results
After running any of the tests above:

1. **Check the database:**
   - New client created with name "Unknown (+19999999999)"
   - New conversation linked to this client
   - Message logged with proper metadata

2. **Check the UI:**
   - Log into the app at http://localhost:8081
   - Go to Connect Center (/communications)
   - You should see the new conversation
   - Try sending a reply

3. **Check logs:**
   - Edge Function logs: https://supabase.com/dashboard/project/mqppvcrlvsgrsqelglod/functions
   - Database logs for any errors

## Common Issues and Solutions

### Issue: No phone number configured
**Solution:** Ensure you have a phone number in the `phone_numbers` table:
```sql
INSERT INTO phone_numbers (user_id, phone_number, friendly_name, is_primary, status)
VALUES ('YOUR_USER_ID', '+14377476737', 'Primary Phone', true, 'purchased');
```

### Issue: Edge functions not responding
**Solution:** Check if functions are deployed:
- `send-sms`: For outbound messages
- `sms-webhook`: For inbound messages

### Issue: Messages not appearing in UI
**Solution:** Check:
- User ID matches in all tables
- Conversation status is 'active'
- No RLS policies blocking access

## Success Criteria
✅ Unknown numbers automatically create client records
✅ Conversations are created and linked properly
✅ Messages appear in Connect Center UI
✅ Two-way messaging works
✅ All data is properly logged

## Need Help?
If you encounter issues:
1. Check Edge Function logs
2. Verify database constraints
3. Test with known client first
4. Check browser console for errors

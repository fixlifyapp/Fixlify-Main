# 📱 SMS Testing Instructions for Telnyx Number +1-437-524-9932

## Your Telnyx Setup:
- **Your Telnyx Phone Number**: +1-437-524-9932
- **Account**: petrusenkocorp@gmail.com
- **This number will SEND SMS messages**

## Quick Test Steps:

### 1. First, add your Telnyx number to the database
Go to: https://supabase.com/dashboard/project/mqppvcrlvsgrsqelglod/sql/new

Run this SQL:
```sql
-- Add your Telnyx sending number
INSERT INTO phone_numbers (user_id, phone_number, is_primary, is_active)
VALUES (
  auth.uid(),
  '+14375249932',  -- Your Telnyx number (no dashes!)
  true,
  true
)
ON CONFLICT (phone_number) 
DO UPDATE SET 
  user_id = auth.uid(),
  is_primary = true,
  is_active = true;

-- Verify it was added
SELECT * FROM phone_numbers WHERE user_id = auth.uid();
```

### 2. Test SMS Sending
Go to: http://localhost:8082/sms-test

- **To Phone**: Enter the number where you want to RECEIVE the test SMS
  - This should be YOUR PERSONAL phone number
  - Example: +1234567890 (different from the Telnyx number)
- **Message**: "Test SMS from Fixlify via Telnyx!"
- Click "Send Test SMS"

### 3. What Happens:
- SMS will be sent FROM: +1-437-524-9932 (your Telnyx number)
- SMS will be sent TO: The number you entered in the form
- You should receive the SMS on your personal phone

### 4. Check the logs
```sql
-- See if SMS was sent successfully
SELECT 
  created_at,
  status,
  from_address as from_phone,
  to_address as to_phone,
  content as message,
  error_message
FROM communication_logs 
WHERE user_id = auth.uid() 
AND type = 'sms'
ORDER BY created_at DESC;
```

## Important Notes:
- The Telnyx number (+1-437-524-9932) is for SENDING only
- You need to enter a different phone number to RECEIVE the test SMS
- Make sure TELNYX_API_KEY is set in Supabase edge function secrets
- The recipient phone should be able to receive SMS (not a landline)

## Troubleshooting:
If SMS doesn't send, check:
1. Is your Telnyx account active with credits?
2. Is the API key correct in Supabase?
3. Check the error_message in communication_logs
4. Try sending to a different phone number

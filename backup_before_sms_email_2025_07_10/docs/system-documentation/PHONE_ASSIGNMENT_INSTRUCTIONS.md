# Phone Number Assignment Instructions

## Quick Assignment (Recommended)

1. **Open your Fixlify app** in the browser
2. **Login as petrusenkocorp@gmail.com**
3. **Open browser console** (Press F12)
4. **Copy and paste** the entire contents of `quick-assign-phone.js`
5. **Press Enter**

The script will automatically:
- Check if you already have a phone number
- Assign an existing unassigned number if available
- Create a test phone number if needed
- Activate the number for SMS sending

## What the Script Does

1. **Checks existing numbers** - If there are unassigned numbers, it assigns one to you
2. **Activates your number** - If you already have a number but it's inactive
3. **Creates test number** - If no numbers exist, creates a test number like +15551234567

## After Assignment

Once the phone number is assigned:
1. Go to **Settings > Configuration > Telnyx**
2. Test SMS sending
3. Or try sending an estimate/invoice via SMS

## Manual SQL Method

If you prefer using SQL:
```sql
-- Find your user ID
SELECT id FROM profiles WHERE email = 'petrusenkocorp@gmail.com';

-- Insert a phone number (replace USER_ID with actual ID)
INSERT INTO telnyx_phone_numbers (
  phone_number, 
  user_id, 
  status, 
  capabilities
) VALUES (
  '+15551234567', 
  'USER_ID', 
  'active', 
  '{"sms": true, "voice": true}'::jsonb
);
```

## Important Notes

- For production, you should use a real Telnyx phone number
- Test numbers (+1555xxxxxxx) won't actually send SMS but will work for testing
- Make sure TELNYX_API_KEY is set in Supabase Edge Functions > Secrets
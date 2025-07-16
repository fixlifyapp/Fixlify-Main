# Quick Guide: Add Your Phone Number Now

## Fastest Method - Browser Console

1. Open your Fixlify app in the browser
2. Log in to your account
3. Press F12 to open Developer Console
4. Copy and paste this code:

```javascript
// Replace with your actual phone number
const phoneNumber = '+14165551234'; // Example: your number here

fetch('https://mqppvcrlvsgrsqelglod.supabase.co/rest/v1/telnyx_phone_numbers', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xcHB2Y3JsdnNncnNxZWxnbG9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1OTE3MDUsImV4cCI6MjA2MzE2NzcwNX0.My-KiqG1bCMqzUru4m59d4v18N3WGxNoNtFPOFAmhzg',
    'Authorization': `Bearer ${localStorage.getItem('fixlify-auth-token')?.replace(/['"]/g, '')}`
  },
  body: JSON.stringify({
    phone_number: phoneNumber,
    status: 'available',
    country_code: 'US',
    area_code: phoneNumber.substring(2, 5),
    features: ['sms', 'voice', 'mms'],
    monthly_cost: 0,
    setup_cost: 0,
    purchased_at: new Date().toISOString()
  })
}).then(r => r.json()).then(data => {
  console.log('✅ Phone number added:', data);
}).catch(err => {
  console.error('❌ Error:', err);
});
```

5. Change `+14165551234` to your actual phone number
6. Press Enter to run

## Alternative - Direct SQL in Supabase

1. Go to: https://supabase.com/dashboard/project/mqppvcrlvsgrsqelglod/sql
2. Run this SQL (replace the phone number):

```sql
INSERT INTO telnyx_phone_numbers (
    phone_number, status, country_code, area_code, 
    features, monthly_cost, setup_cost, purchased_at
) VALUES (
    '+14165551234', -- Your phone number here
    'available', 
    'US', 
    '416', -- Extract from your number
    ARRAY['sms', 'voice', 'mms']::text[],
    0.00, 
    0.00, 
    NOW()
) ON CONFLICT (phone_number) DO UPDATE SET status = 'available';
```

## To Verify

Check if your number was added:

```javascript
// Run in console
fetch('https://mqppvcrlvsgrsqelglod.supabase.co/rest/v1/telnyx_phone_numbers', {
  headers: {
    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xcHB2Y3JsdnNncnNxZWxnbG9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1OTE3MDUsImV4cCI6MjA2MzE2NzcwNX0.My-KiqG1bCMqzUru4m59d4v18N3WGxNoNtFPOFAmhzg'
  }
}).then(r => r.json()).then(data => {
  console.log('All numbers:', data);
  data.forEach(n => console.log(`${n.phone_number} - ${n.status}`));
});
```

That's it! Your number should now be in the system and available to claim.

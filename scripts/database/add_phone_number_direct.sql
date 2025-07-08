-- Direct SQL to add a phone number to the database
-- Run this in Supabase SQL Editor

-- Example: Adding a phone number +1 (416) 555-1234
INSERT INTO telnyx_phone_numbers (
    phone_number,
    status,
    country_code,
    area_code,
    locality,
    region,
    features,
    monthly_cost,
    setup_cost,
    user_id,
    purchased_at,
    created_at,
    updated_at
) VALUES (
    '+14165551234',  -- Replace with your actual phone number
    'available',     -- Set as 'available' so it can be claimed
    'US',
    '416',          -- Area code
    'Toronto',      -- City (optional)
    'Ontario',      -- State/Province (optional)
    ARRAY['sms', 'voice', 'mms']::text[],
    0.00,           -- No monthly cost since you already own it
    0.00,           -- No setup cost
    NULL,           -- NULL means available for any user to claim
    NOW(),
    NOW(),
    NOW()
)
ON CONFLICT (phone_number) 
DO UPDATE SET
    status = 'available',
    user_id = NULL,  -- Make it available if it already exists
    updated_at = NOW();

-- To check if it was added successfully:
SELECT * FROM telnyx_phone_numbers WHERE phone_number = '+14165551234';

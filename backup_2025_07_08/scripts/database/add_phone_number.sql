-- Script to add a new phone number to the telnyx_phone_numbers table
-- Replace the placeholder values with your actual phone number details

INSERT INTO telnyx_phone_numbers (
    phone_number,
    status,
    country_code,
    area_code,
    locality,
    region,
    rate_center,
    features,
    connection_id,
    monthly_cost,
    setup_cost,
    user_id,
    purchased_at,
    created_at,
    updated_at
) VALUES (
    '+1XXXXXXXXXX',  -- Replace with your actual phone number (e.g., +14165551234)
    'available',     -- Status: 'available' or 'active'
    'US',           -- Country code
    'XXX',          -- Area code (first 3 digits after +1)
    'City Name',    -- City/locality (optional)
    'State/Province', -- Region (optional)
    NULL,           -- Rate center (optional)
    ARRAY['sms', 'voice', 'mms'],  -- Features available
    NULL,           -- Connection ID from Telnyx (optional)
    0.00,           -- Monthly cost (0 for already owned numbers)
    0.00,           -- Setup cost (0 for already owned numbers)
    NULL,           -- User ID (NULL if available for claiming)
    NOW(),          -- Purchased at timestamp
    NOW(),          -- Created at timestamp
    NOW()           -- Updated at timestamp
)
ON CONFLICT (phone_number) 
DO UPDATE SET
    status = EXCLUDED.status,
    updated_at = NOW();
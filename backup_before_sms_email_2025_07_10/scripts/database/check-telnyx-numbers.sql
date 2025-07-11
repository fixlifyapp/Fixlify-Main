-- Check all Telnyx phone numbers and their assignments
-- This query will show all phone numbers in the system

-- 1. Show all phone numbers with user details
SELECT 
    t.phone_number,
    t.status,
    t.user_id,
    p.email as assigned_to_email,
    t.created_at,
    t.updated_at,
    CASE 
        WHEN t.user_id IS NULL THEN 'UNASSIGNED'
        ELSE 'ASSIGNED'
    END as assignment_status
FROM telnyx_phone_numbers t
LEFT JOIN profiles p ON t.user_id = p.id
ORDER BY t.created_at DESC;

-- 2. Count summary
SELECT 
    COUNT(*) as total_numbers,
    COUNT(CASE WHEN status = 'active' THEN 1 END) as active_numbers,
    COUNT(CASE WHEN user_id IS NOT NULL THEN 1 END) as assigned_numbers,
    COUNT(CASE WHEN user_id IS NULL THEN 1 END) as unassigned_numbers
FROM telnyx_phone_numbers;

-- 3. Show only unassigned numbers (available for auto-assignment)
SELECT 
    phone_number,
    status,
    created_at
FROM telnyx_phone_numbers
WHERE user_id IS NULL
ORDER BY created_at DESC;

-- 4. Show numbers assigned to specific users
SELECT 
    t.phone_number,
    t.status,
    p.email,
    p.full_name,
    t.created_at as assigned_date
FROM telnyx_phone_numbers t
INNER JOIN profiles p ON t.user_id = p.id
WHERE t.user_id IS NOT NULL
ORDER BY p.email;
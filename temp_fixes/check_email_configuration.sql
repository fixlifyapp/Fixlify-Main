// Test script to check email configuration
// Run this in Supabase SQL Editor to check user email settings

-- Check user profiles with company emails
SELECT 
    id,
    name,
    email,
    company_name,
    company_email,
    company_phone,
    CASE 
        WHEN company_email IS NULL OR company_email = '' THEN 'Missing company email'
        WHEN company_email NOT LIKE '%@%' THEN 'Invalid email format'
        ELSE 'Valid'
    END as email_status
FROM profiles
ORDER BY created_at DESC;

-- Check recent email communication logs
SELECT 
    id,
    created_at,
    type,
    direction,
    status,
    from_address,
    to_address,
    subject,
    jsonb_pretty(metadata) as metadata
FROM communication_logs
WHERE type = 'email'
ORDER BY created_at DESC
LIMIT 10;

-- Check estimates sent recently
SELECT 
    e.id,
    e.estimate_number,
    e.status,
    e.created_at,
    j.title as job_title,
    c.name as client_name,
    c.email as client_email
FROM estimates e
JOIN jobs j ON e.job_id = j.id
JOIN clients c ON j.client_id = c.id
WHERE e.status = 'sent'
ORDER BY e.created_at DESC
LIMIT 10;

-- Check if there are any estimates/invoices waiting to be sent
SELECT 
    'Estimates' as document_type,
    COUNT(*) as draft_count
FROM estimates
WHERE status = 'draft'
UNION ALL
SELECT 
    'Invoices' as document_type,
    COUNT(*) as draft_count
FROM invoices
WHERE status = 'draft';

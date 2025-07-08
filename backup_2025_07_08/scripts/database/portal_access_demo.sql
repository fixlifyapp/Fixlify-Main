-- Portal Access System Test Script
-- This script demonstrates how to generate portal access for clients

-- 1. First, let's see what clients we have
SELECT 
    id as client_id,
    name as client_name,
    email as client_email
FROM clients
ORDER BY created_at DESC
LIMIT 5;

-- 2. Generate a portal access token for the first client (Furman Ihor)
SELECT generate_portal_access(
    'C-2000',  -- Furman Ihor's client ID
    jsonb_build_object(
        'view_estimates', true,
        'view_invoices', true,
        'view_jobs', true,
        'pay_invoices', true,
        'approve_estimates', true
    ),
    72  -- 72 hours validity
) as access_token;

-- 3. Check the generated portal access tokens
SELECT 
    cpa.access_token,
    cpa.client_id,
    c.name as client_name,
    cpa.expires_at,
    cpa.created_at,
    jsonb_pretty(cpa.permissions) as permissions
FROM client_portal_access cpa
JOIN clients c ON c.id = cpa.client_id
WHERE cpa.client_id = 'C-2000'
ORDER BY cpa.created_at DESC
LIMIT 5;

-- 4. Check active portal sessions
SELECT 
    ps.access_token,
    ps.client_id,
    c.name as client_name,
    ps.is_active,
    ps.created_at,
    ps.last_accessed_at
FROM portal_sessions ps
JOIN clients c ON c.id = ps.client_id
WHERE ps.is_active = true
ORDER BY ps.created_at DESC
LIMIT 5;

-- 5. Example: Generate portal URLs for all clients
-- Note: In production, run this via the test page at /test-portal-access
SELECT 
    c.id,
    c.name,
    c.email,
    'http://localhost:8080/portal/' || generate_portal_access(
        c.id,
        jsonb_build_object(
            'view_estimates', true,
            'view_invoices', true,
            'view_jobs', true,
            'pay_invoices', true,
            'approve_estimates', true
        ),
        72
    ) as portal_url
FROM clients c
LIMIT 3;

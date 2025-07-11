-- First, let's create the test script for generating portal access tokens
-- This script will:
-- 1. Get all clients in the system
-- 2. Generate portal access tokens for each client
-- 3. Test the portal-data edge function with each token

-- Get all clients
SELECT 
    c.id as client_id,
    c.name as client_name,
    c.email as client_email,
    c.user_id,
    p.organization_id
FROM clients c
LEFT JOIN profiles p ON p.id = c.user_id
WHERE c.deleted_at IS NULL
ORDER BY c.created_at DESC;

-- Generate portal access tokens for each client
-- We'll use the generate_portal_access function
DO $$
DECLARE
    client_record RECORD;
    token_result TEXT;
    portal_url TEXT;
BEGIN
    -- Create temporary table to store results
    CREATE TEMP TABLE IF NOT EXISTS portal_access_results (
        client_id TEXT,
        client_name TEXT,
        client_email TEXT,
        access_token TEXT,
        portal_url TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Loop through all clients
    FOR client_record IN 
        SELECT c.id, c.name, c.email 
        FROM clients c 
        WHERE c.deleted_at IS NULL
    LOOP
        -- Generate portal access token
        token_result := generate_portal_access(
            client_record.id,
            jsonb_build_object(
                'view_estimates', true,
                'view_invoices', true,
                'view_jobs', true,
                'pay_invoices', true,
                'approve_estimates', true
            ),
            72  -- 72 hours validity
        );
        
        -- Build portal URL
        portal_url := 'https://hub.fixlify.app/portal/' || token_result;
        
        -- For local testing
        -- portal_url := 'http://localhost:8080/portal/' || token_result;
        
        -- Store result
        INSERT INTO portal_access_results (client_id, client_name, client_email, access_token, portal_url)
        VALUES (client_record.id, client_record.name, client_record.email, token_result, portal_url);
        
        RAISE NOTICE 'Generated portal access for client: % (%)', client_record.name, client_record.email;
        RAISE NOTICE 'Portal URL: %', portal_url;
        RAISE NOTICE '---';
    END LOOP;
    
    -- Show all generated portal access URLs
    RAISE NOTICE '';
    RAISE NOTICE '=== PORTAL ACCESS URLS FOR ALL CLIENTS ===';
    
    FOR client_record IN 
        SELECT * FROM portal_access_results ORDER BY created_at
    LOOP
        RAISE NOTICE 'Client: % (%)', client_record.client_name, client_record.client_email;
        RAISE NOTICE 'URL: %', client_record.portal_url;
        RAISE NOTICE '';
    END LOOP;
END $$;

-- Show summary of generated portal access tokens
SELECT 
    COUNT(*) as total_clients,
    COUNT(DISTINCT par.client_id) as clients_with_portal_access
FROM clients c
LEFT JOIN portal_access_results par ON par.client_id = c.id
WHERE c.deleted_at IS NULL;

-- Check portal_sessions table
SELECT 
    COUNT(*) as active_sessions,
    COUNT(DISTINCT client_id) as unique_clients_with_sessions
FROM portal_sessions
WHERE is_active = true;

-- Show recent portal access tokens
SELECT 
    cpa.access_token,
    cpa.client_id,
    c.name as client_name,
    cpa.expires_at,
    cpa.created_at,
    jsonb_pretty(cpa.permissions) as permissions
FROM client_portal_access cpa
JOIN clients c ON c.id = cpa.client_id
ORDER BY cpa.created_at DESC
LIMIT 5;

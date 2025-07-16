-- Generate a new test portal token for a client
-- First, get a client ID (replace with an actual client ID from your database)
SELECT id, name, email FROM clients LIMIT 5;

-- Then use this function to generate a portal access token
-- Replace 'your-client-id' with an actual client ID from the query above
SELECT generate_portal_access(
    p_client_id := 'your-client-id',
    p_permissions := jsonb_build_object(
        'view_estimates', true,
        'view_invoices', true,
        'make_payments', true,
        'view_jobs', true
    ),
    p_hours_valid := 72
) as portal_token;
-- Create RPC function to fetch all client data in a single query
-- This eliminates waterfall queries and improves performance significantly

DROP FUNCTION IF EXISTS get_client_complete_data(TEXT);

CREATE OR REPLACE FUNCTION get_client_complete_data(p_client_id TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSON;
  v_user_id UUID;
BEGIN
  -- Get user_id from client for authorization check
  SELECT user_id INTO v_user_id FROM public.clients WHERE id = p_client_id;

  -- Authorization check
  IF v_user_id IS NULL OR v_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  SELECT json_build_object(
    'client', (
      SELECT row_to_json(c.*)
      FROM public.clients c
      WHERE c.id = p_client_id
    ),
    'stats', (
      SELECT json_build_object(
        'total_jobs', COUNT(*)::INTEGER,
        'total_revenue', COALESCE(SUM(COALESCE(j.revenue, 0)), 0)::NUMERIC,
        'avg_job_value', COALESCE(AVG(COALESCE(j.revenue, 0)), 0)::NUMERIC,
        'jobs_this_year', COUNT(*) FILTER (WHERE j.created_at >= date_trunc('year', NOW()))::INTEGER,
        'revenue_this_year', COALESCE(SUM(COALESCE(j.revenue, 0)) FILTER (WHERE j.created_at >= date_trunc('year', NOW())), 0)::NUMERIC,
        'last_service_date', MAX(j.date)::TEXT
      )
      FROM public.jobs j
      WHERE j.client_id = p_client_id
    ),
    'recent_jobs', (
      SELECT COALESCE(json_agg(job_row ORDER BY job_row.created_at DESC), '[]'::JSON)
      FROM (
        SELECT
          j.id,
          j.title,
          j.status,
          j.job_type,
          j.date,
          j.schedule_start,
          j.revenue,
          j.address,
          j.tags,
          j.created_at
        FROM public.jobs j
        WHERE j.client_id = p_client_id
        ORDER BY j.created_at DESC
        LIMIT 5
      ) job_row
    ),
    'recent_payments', (
      SELECT COALESCE(json_agg(payment_row ORDER BY payment_row.payment_date DESC), '[]'::JSON)
      FROM (
        SELECT
          p.id,
          p.amount,
          p.payment_date,
          p.payment_method,
          p.status,
          i.invoice_number,
          i.total as invoice_total,
          j.title as job_title
        FROM public.payments p
        JOIN public.invoices i ON p.invoice_id = i.id
        JOIN public.jobs j ON i.job_id = j.id
        WHERE j.client_id = p_client_id
        ORDER BY p.payment_date DESC
        LIMIT 5
      ) payment_row
    ),
    'properties', (
      SELECT COALESCE(json_agg(prop_row), '[]'::JSON)
      FROM (
        SELECT
          cp.id,
          cp.name,
          cp.address,
          cp.city,
          cp.state,
          cp.zip,
          cp.property_type,
          cp.is_primary,
          cp.notes
        FROM public.client_properties cp
        WHERE cp.client_id = p_client_id
        ORDER BY cp.is_primary DESC, cp.created_at ASC
      ) prop_row
    ),
    'total_jobs_count', (
      SELECT COUNT(*)::INTEGER FROM public.jobs WHERE client_id = p_client_id
    ),
    'total_payments_count', (
      SELECT COUNT(*)::INTEGER
      FROM public.payments p
      JOIN public.invoices i ON p.invoice_id = i.id
      JOIN public.jobs j ON i.job_id = j.id
      WHERE j.client_id = p_client_id
    ),
    'total_revenue', (
      SELECT COALESCE(SUM(p.amount), 0)::NUMERIC
      FROM public.payments p
      JOIN public.invoices i ON p.invoice_id = i.id
      JOIN public.jobs j ON i.job_id = j.id
      WHERE j.client_id = p_client_id
      AND p.status = 'completed'
    )
  ) INTO result;

  RETURN result;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_client_complete_data(TEXT) TO authenticated;

-- Fix exec_sql functions
DROP FUNCTION IF EXISTS exec_sql(TEXT);
DROP FUNCTION IF EXISTS exec_query(TEXT);

CREATE OR REPLACE FUNCTION exec_query(sql TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSONB;
BEGIN
  EXECUTE 'SELECT COALESCE(jsonb_agg(row_to_json(t)), ''[]''::jsonb) FROM (' || sql || ') t' INTO result;
  RETURN result;
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('error', SQLERRM);
END;
$$;

GRANT EXECUTE ON FUNCTION exec_query(TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION exec_query(TEXT) TO authenticated;

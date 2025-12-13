
-- Create an RPC function to execute arbitrary SQL (admin only)
CREATE OR REPLACE FUNCTION public.exec_sql(sql TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
BEGIN
  -- Check if the current user is an admin
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can execute arbitrary SQL';
  END IF;

  -- Execute the SQL
  EXECUTE sql;
  
  -- Return success
  result := jsonb_build_object('success', true);
  RETURN result;
EXCEPTION WHEN OTHERS THEN
  -- Return the error
  result := jsonb_build_object(
    'success', false,
    'error', SQLERRM,
    'detail', SQLSTATE
  );
  RETURN result;
END;
$$;

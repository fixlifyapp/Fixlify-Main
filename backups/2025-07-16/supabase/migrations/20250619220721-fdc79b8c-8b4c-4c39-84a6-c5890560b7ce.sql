
-- Check current RLS policies for estimates table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'estimates';

-- Check if there are any check constraints on estimates status
SELECT conname, pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.estimates'::regclass 
AND contype = 'c';

-- Add proper RLS policy for updating estimates if it doesn't exist
DO $$
BEGIN
  -- Drop existing update policy if it exists
  DROP POLICY IF EXISTS "Users can update estimates" ON public.estimates;
  
  -- Create comprehensive update policy
  CREATE POLICY "Users can update estimates" 
  ON public.estimates 
  FOR UPDATE 
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);
  
  -- Ensure estimates table has proper status constraint
  -- Drop existing constraint if it exists
  ALTER TABLE public.estimates DROP CONSTRAINT IF EXISTS estimates_status_check;
  
  -- Add proper status constraint that includes 'converted'
  ALTER TABLE public.estimates ADD CONSTRAINT estimates_status_check 
  CHECK (status IN ('draft', 'sent', 'approved', 'rejected', 'converted', 'cancelled'));
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error occurred: %', SQLERRM;
END
$$;

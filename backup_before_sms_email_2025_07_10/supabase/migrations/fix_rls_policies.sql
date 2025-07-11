
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view estimates" ON public.estimates;
DROP POLICY IF EXISTS "Users can create estimates" ON public.estimates;
DROP POLICY IF EXISTS "Users can update estimates" ON public.estimates;
DROP POLICY IF EXISTS "Users can delete estimates" ON public.estimates;

DROP POLICY IF EXISTS "Users can view invoices" ON public.invoices;
DROP POLICY IF EXISTS "Users can create invoices" ON public.invoices;
DROP POLICY IF EXISTS "Users can update invoices" ON public.invoices;
DROP POLICY IF EXISTS "Users can delete invoices" ON public.invoices;

-- Create proper policies for estimates
CREATE POLICY "Users can view estimates" 
  ON public.estimates 
  FOR SELECT 
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create estimates" 
  ON public.estimates 
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update estimates" 
  ON public.estimates 
  FOR UPDATE 
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete estimates" 
  ON public.estimates 
  FOR DELETE 
  USING (auth.uid() IS NOT NULL);

-- Create proper policies for invoices
CREATE POLICY "Users can view invoices" 
  ON public.invoices 
  FOR SELECT 
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create invoices" 
  ON public.invoices 
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update invoices" 
  ON public.invoices 
  FOR UPDATE 
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete invoices" 
  ON public.invoices 
  FOR DELETE 
  USING (auth.uid() IS NOT NULL);

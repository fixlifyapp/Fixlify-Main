
-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Public can view pending approvals by token" ON public.document_approvals;
DROP POLICY IF EXISTS "Public can update pending approvals by token" ON public.document_approvals;
DROP POLICY IF EXISTS "Users can view their document approvals" ON public.document_approvals;

-- Create new policies that allow public access to pending approvals
CREATE POLICY "Anyone can view pending approvals by token" 
  ON public.document_approvals 
  FOR SELECT 
  USING (status = 'pending' AND expires_at > now());

-- Allow public updates to pending approvals (for approve/reject actions)
CREATE POLICY "Anyone can update pending approvals" 
  ON public.document_approvals 
  FOR UPDATE 
  USING (status = 'pending' AND expires_at > now())
  WITH CHECK (status IN ('approved', 'rejected', 'expired'));

-- Authenticated users can still view all their approvals
CREATE POLICY "Users can view their document approvals" 
  ON public.document_approvals 
  FOR SELECT 
  USING (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM clients c 
      WHERE c.id = document_approvals.client_id 
      AND c.created_by = auth.uid()
    )
  );

-- Authenticated users can create new approvals
CREATE POLICY "Users can create document approvals" 
  ON public.document_approvals 
  FOR INSERT 
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM clients c 
      WHERE c.id = document_approvals.client_id 
      AND c.created_by = auth.uid()
    )
  );

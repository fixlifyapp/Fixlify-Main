-- Fix RLS policy for clients table - remove overly permissive policy
DROP POLICY IF EXISTS "Allow all operations on clients" ON public.clients;

-- Create proper user isolation policy for clients
CREATE POLICY "Users can manage their own clients" 
ON public.clients 
FOR ALL 
USING (auth.uid() = user_id);

-- Ensure user_id is automatically set when creating clients
CREATE OR REPLACE FUNCTION public.set_client_user_id()
RETURNS TRIGGER AS $$
BEGIN
  NEW.user_id = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically set user_id
DROP TRIGGER IF EXISTS set_client_user_id_trigger ON public.clients;
CREATE TRIGGER set_client_user_id_trigger
  BEFORE INSERT ON public.clients
  FOR EACH ROW
  EXECUTE FUNCTION public.set_client_user_id();
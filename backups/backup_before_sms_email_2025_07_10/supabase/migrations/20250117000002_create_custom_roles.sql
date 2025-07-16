-- Create custom_roles table
CREATE TABLE IF NOT EXISTS public.custom_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  permissions JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(name, created_by)
);

-- Enable RLS
ALTER TABLE public.custom_roles ENABLE ROW LEVEL SECURITY;

-- Create policies for custom_roles
CREATE POLICY "Users can view their custom roles" ON public.custom_roles
  FOR SELECT USING (created_by = auth.uid());

CREATE POLICY "Users can create custom roles" ON public.custom_roles
  FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update their custom roles" ON public.custom_roles
  FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Users can delete their custom roles" ON public.custom_roles
  FOR DELETE USING (created_by = auth.uid());

-- Add custom_role_id to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS custom_role_id UUID REFERENCES public.custom_roles(id) ON DELETE SET NULL;

-- Create index for performance
CREATE INDEX idx_custom_roles_created_by ON public.custom_roles(created_by);
CREATE INDEX idx_profiles_custom_role_id ON public.profiles(custom_role_id);

-- Create trigger for updated_at
CREATE TRIGGER update_custom_roles_updated_at 
  BEFORE UPDATE ON public.custom_roles 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default custom role templates
INSERT INTO public.custom_roles (name, description, permissions, created_by) 
SELECT 
  'Custom Manager',
  'A custom role with manager-level permissions plus additional features',
  '["jobs.view", "jobs.create", "jobs.edit", "clients.view", "clients.create", "estimates.view", "estimates.create", "invoices.view", "schedule.view", "reports.view"]'::jsonb,
  id
FROM auth.users 
WHERE email = 'petrusenkocdasdadadaorp@gmail.com'
ON CONFLICT DO NOTHING;

INSERT INTO public.custom_roles (name, description, permissions, created_by) 
SELECT 
  'Field Supervisor',
  'Technician with additional scheduling and reporting permissions',
  '["jobs.view", "jobs.edit", "schedule.view", "schedule.edit", "reports.view"]'::jsonb,
  id
FROM auth.users 
WHERE email = 'petrusenkocdasdadadaorp@gmail.com'
ON CONFLICT DO NOTHING; 
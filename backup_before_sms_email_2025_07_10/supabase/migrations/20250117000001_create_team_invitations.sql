-- Create team_invitations table
CREATE TABLE IF NOT EXISTS public.team_invitations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'technician',
  service_area TEXT,
  invitation_token TEXT UNIQUE NOT NULL,
  invited_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.team_invitations ENABLE ROW LEVEL SECURITY;

-- Create policies for team_invitations
CREATE POLICY "Users can view invitations they sent" ON public.team_invitations
  FOR SELECT USING (invited_by = auth.uid());

CREATE POLICY "Users can create invitations" ON public.team_invitations
  FOR INSERT WITH CHECK (invited_by = auth.uid());

CREATE POLICY "Users can update invitations they sent" ON public.team_invitations
  FOR UPDATE USING (invited_by = auth.uid());

-- Create index for performance
CREATE INDEX idx_team_invitations_token ON public.team_invitations(invitation_token);
CREATE INDEX idx_team_invitations_email ON public.team_invitations(email);
CREATE INDEX idx_team_invitations_status ON public.team_invitations(status);

-- Update handle_new_user function to check for invitations
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  invitation_record RECORD;
BEGIN
  -- Check if this user was invited
  SELECT * INTO invitation_record
  FROM public.team_invitations
  WHERE email = NEW.email AND status = 'pending'
  ORDER BY created_at DESC
  LIMIT 1;

  IF invitation_record IS NOT NULL THEN
    -- User was invited, use invitation data
    INSERT INTO public.profiles (id, name, email, role, has_completed_onboarding)
    VALUES (
      NEW.id,
      invitation_record.name,
      NEW.email,
      invitation_record.role,
      false  -- Team members don't need onboarding, just admin does
    );
    
    -- Update invitation status
    UPDATE public.team_invitations
    SET status = 'accepted', updated_at = NOW()
    WHERE id = invitation_record.id;
  ELSE
    -- First registration or no invitation found, make them admin
    INSERT INTO public.profiles (id, name, email, role, has_completed_onboarding)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
      NEW.email,
      'admin',
      false  -- Require onboarding for admin users
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create function to automatically expire old invitations
CREATE OR REPLACE FUNCTION public.expire_old_invitations()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.team_invitations
  SET status = 'expired', updated_at = NOW()
  WHERE status = 'pending' AND expires_at < NOW();
END;
$$;

-- Create a trigger to automatically update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_team_invitations_updated_at 
  BEFORE UPDATE ON public.team_invitations 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column(); 
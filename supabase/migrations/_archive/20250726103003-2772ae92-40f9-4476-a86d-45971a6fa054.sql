-- Create telnyx_calls table if it doesn't exist or update it with proper structure
CREATE TABLE IF NOT EXISTS public.telnyx_calls (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  call_control_id text,
  call_leg_id text,
  user_id uuid REFERENCES auth.users,
  client_id text,
  from_number text,
  to_number text,
  direction text CHECK (direction IN ('inbound', 'outbound')),
  status text DEFAULT 'ringing' CHECK (status IN ('ringing', 'active', 'hold', 'completed', 'failed')),
  started_at timestamp with time zone DEFAULT now(),
  answered_at timestamp with time zone,
  ended_at timestamp with time zone,
  duration integer DEFAULT 0,
  recording_url text,
  metadata jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Add missing columns if they don't exist
DO $$ 
BEGIN
  -- Add from_number if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'telnyx_calls' AND column_name = 'from_number') THEN
    ALTER TABLE public.telnyx_calls ADD COLUMN from_number text;
  END IF;
  
  -- Add to_number if it doesn't exist  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'telnyx_calls' AND column_name = 'to_number') THEN
    ALTER TABLE public.telnyx_calls ADD COLUMN to_number text;
  END IF;
  
  -- Add direction if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'telnyx_calls' AND column_name = 'direction') THEN
    ALTER TABLE public.telnyx_calls ADD COLUMN direction text CHECK (direction IN ('inbound', 'outbound'));
  END IF;
  
  -- Add status check constraint if it doesn't exist
  BEGIN
    ALTER TABLE public.telnyx_calls ADD CONSTRAINT telnyx_calls_status_check CHECK (status IN ('ringing', 'active', 'hold', 'completed', 'failed'));
  EXCEPTION
    WHEN duplicate_object THEN NULL;
  END;
END $$;

-- Enable RLS
ALTER TABLE public.telnyx_calls ENABLE ROW LEVEL SECURITY;

-- Create RLS policies if they don't exist
DO $$
BEGIN
  -- Policy for users to see their own calls
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'telnyx_calls' 
    AND policyname = 'Users can view their own calls'
  ) THEN
    CREATE POLICY "Users can view their own calls" 
    ON public.telnyx_calls 
    FOR SELECT 
    USING (auth.uid() = user_id);
  END IF;

  -- Policy for users to insert their own calls
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'telnyx_calls' 
    AND policyname = 'Users can create their own calls'
  ) THEN
    CREATE POLICY "Users can create their own calls" 
    ON public.telnyx_calls 
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);
  END IF;

  -- Policy for users to update their own calls
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'telnyx_calls' 
    AND policyname = 'Users can update their own calls'
  ) THEN
    CREATE POLICY "Users can update their own calls" 
    ON public.telnyx_calls 
    FOR UPDATE 
    USING (auth.uid() = user_id);
  END IF;

  -- Policy for service role to manage all calls (for webhooks)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'telnyx_calls' 
    AND policyname = 'Service role can manage all calls'
  ) THEN
    CREATE POLICY "Service role can manage all calls" 
    ON public.telnyx_calls 
    FOR ALL 
    USING (auth.role() = 'service_role');
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_telnyx_calls_user_id ON public.telnyx_calls(user_id);
CREATE INDEX IF NOT EXISTS idx_telnyx_calls_call_control_id ON public.telnyx_calls(call_control_id);
CREATE INDEX IF NOT EXISTS idx_telnyx_calls_created_at ON public.telnyx_calls(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_telnyx_calls_status ON public.telnyx_calls(status);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION public.update_telnyx_calls_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_telnyx_calls_updated_at_trigger ON public.telnyx_calls;
CREATE TRIGGER update_telnyx_calls_updated_at_trigger
  BEFORE UPDATE ON public.telnyx_calls
  FOR EACH ROW
  EXECUTE FUNCTION public.update_telnyx_calls_updated_at();
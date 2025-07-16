-- Fix RLS policies for messages and conversations tables to allow service role access
-- This is critical for SMS webhook processing from Edge Functions

-- Enable RLS on messages and conversations if not already enabled
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- Drop any existing conflicting policies
DROP POLICY IF EXISTS "Service role can manage messages" ON public.messages;
DROP POLICY IF EXISTS "Authenticated users can manage messages" ON public.messages;
DROP POLICY IF EXISTS "Users can view messages" ON public.messages;
DROP POLICY IF EXISTS "Users can create messages" ON public.messages;
DROP POLICY IF EXISTS "Users can update messages" ON public.messages;
DROP POLICY IF EXISTS "Users can delete messages" ON public.messages;

DROP POLICY IF EXISTS "Service role can manage conversations" ON public.conversations;
DROP POLICY IF EXISTS "Authenticated users can manage conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can view conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can update conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can delete conversations" ON public.conversations;

-- CRITICAL: Allow service role (Edge Functions) to access messages
-- This is required for SMS webhook processing
CREATE POLICY "Service role can manage messages"
ON public.messages
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Allow authenticated users to view and manage their messages
CREATE POLICY "Authenticated users can manage messages"
ON public.messages
FOR ALL
TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- CRITICAL: Allow service role (Edge Functions) to access conversations
-- This is required for SMS webhook processing
CREATE POLICY "Service role can manage conversations"
ON public.conversations
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Allow authenticated users to view and manage their conversations
CREATE POLICY "Authenticated users can manage conversations"
ON public.conversations
FOR ALL
TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Add indexes for better performance if they don't exist
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_direction ON public.messages(direction);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at);
CREATE INDEX IF NOT EXISTS idx_conversations_client_id ON public.conversations(client_id);
CREATE INDEX IF NOT EXISTS idx_conversations_job_id ON public.conversations(job_id);
CREATE INDEX IF NOT EXISTS idx_conversations_status ON public.conversations(status);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message_at ON public.conversations(last_message_at);

-- Ensure the tables exist with proper structure
-- Create messages table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL,
  body text NOT NULL,
  direction text NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  sender text,
  recipient text,
  status text DEFAULT 'delivered',
  message_sid text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create conversations table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id text,
  job_id text,
  status text DEFAULT 'active',
  last_message_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Add foreign key constraints if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'messages_conversation_id_fkey'
  ) THEN
    ALTER TABLE public.messages 
    ADD CONSTRAINT messages_conversation_id_fkey 
    FOREIGN KEY (conversation_id) REFERENCES public.conversations(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add updated_at triggers if they don't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_messages_updated_at ON public.messages;
CREATE TRIGGER update_messages_updated_at 
    BEFORE UPDATE ON public.messages 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_conversations_updated_at ON public.conversations;
CREATE TRIGGER update_conversations_updated_at 
    BEFORE UPDATE ON public.conversations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 
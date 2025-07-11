-- Fix User Data Isolation - Ensure each user can only see their own data
-- This migration adds proper user_id columns and RLS policies to isolate data between accounts
-- APPLIED: This migration has been successfully applied to the database

-- Step 1: Add user_id columns to tables that don't have them
-- Note: Some tables might already have created_by or similar columns

-- Add user_id to jobs table if it doesn't exist
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

-- Update existing jobs to belong to a specific user (for migration purposes)
-- In production, you might want to handle this differently
UPDATE public.jobs SET user_id = created_by WHERE user_id IS NULL AND created_by IS NOT NULL;

-- Add user_id to clients table if it doesn't exist
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

-- Update existing clients
UPDATE public.clients SET user_id = created_by WHERE user_id IS NULL AND created_by IS NOT NULL;

-- Add user_id to estimates table if it doesn't exist
ALTER TABLE public.estimates ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

-- Update existing estimates based on job ownership
UPDATE public.estimates e
SET user_id = j.user_id
FROM public.jobs j
WHERE e.job_id = j.id AND e.user_id IS NULL;

-- Add user_id to invoices table if it doesn't exist
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

-- Update existing invoices based on job ownership
UPDATE public.invoices i
SET user_id = j.user_id
FROM public.jobs j
WHERE i.job_id = j.id AND i.user_id IS NULL;

-- Add user_id to products table if it doesn't exist
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

-- Add user_id to messages table if it doesn't exist
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

-- Update existing messages
UPDATE public.messages SET user_id = sender::uuid WHERE user_id IS NULL AND sender IS NOT NULL AND sender ~* '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$';

-- Add user_id to conversations table if it doesn't exist
ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

UPDATE public.conversations c SET user_id = cl.user_id FROM public.clients cl WHERE c.client_id = cl.id AND c.user_id IS NULL;

-- Add user_id to automations table if it doesn't exist
ALTER TABLE public.automations ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

-- Add user_id to custom_roles table if it doesn't exist
ALTER TABLE public.custom_roles ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

-- Add user_id to telnyx_phone_numbers table if it doesn't exist
ALTER TABLE public.telnyx_phone_numbers ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

-- Step 2: Drop all existing RLS policies to start fresh
DROP POLICY IF EXISTS "Users can view jobs" ON public.jobs;
DROP POLICY IF EXISTS "Users can create jobs" ON public.jobs;
DROP POLICY IF EXISTS "Users can update jobs" ON public.jobs;
DROP POLICY IF EXISTS "Users can delete jobs" ON public.jobs;
DROP POLICY IF EXISTS "Authenticated users can access jobs" ON public.jobs;

DROP POLICY IF EXISTS "Users can view clients" ON public.clients;
DROP POLICY IF EXISTS "Users can create clients" ON public.clients;
DROP POLICY IF EXISTS "Users can update clients" ON public.clients;
DROP POLICY IF EXISTS "Users can delete clients" ON public.clients;
DROP POLICY IF EXISTS "Authenticated users can access clients" ON public.clients;

DROP POLICY IF EXISTS "Users can view estimates" ON public.estimates;
DROP POLICY IF EXISTS "Users can create estimates" ON public.estimates;
DROP POLICY IF EXISTS "Users can update estimates" ON public.estimates;
DROP POLICY IF EXISTS "Users can delete estimates" ON public.estimates;
DROP POLICY IF EXISTS "Authenticated users can access estimates" ON public.estimates;

DROP POLICY IF EXISTS "Users can view invoices" ON public.invoices;
DROP POLICY IF EXISTS "Users can create invoices" ON public.invoices;
DROP POLICY IF EXISTS "Users can update invoices" ON public.invoices;
DROP POLICY IF EXISTS "Users can delete invoices" ON public.invoices;
DROP POLICY IF EXISTS "Authenticated users can access invoices" ON public.invoices;

-- Step 3: Create proper RLS policies that check user ownership

-- Jobs table - users can only see their own jobs
CREATE POLICY "Users can view own jobs" 
  ON public.jobs 
  FOR SELECT 
  USING (auth.uid() = user_id OR auth.uid() = created_by);

CREATE POLICY "Users can create own jobs" 
  ON public.jobs 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id OR auth.uid() = created_by);

CREATE POLICY "Users can update own jobs" 
  ON public.jobs 
  FOR UPDATE 
  USING (auth.uid() = user_id OR auth.uid() = created_by)
  WITH CHECK (auth.uid() = user_id OR auth.uid() = created_by);

CREATE POLICY "Users can delete own jobs" 
  ON public.jobs 
  FOR DELETE 
  USING (auth.uid() = user_id OR auth.uid() = created_by);

-- Clients table - users can only see their own clients
CREATE POLICY "Users can view own clients" 
  ON public.clients 
  FOR SELECT 
  USING (auth.uid() = user_id OR auth.uid() = created_by);

CREATE POLICY "Users can create own clients" 
  ON public.clients 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id OR auth.uid() = created_by);

CREATE POLICY "Users can update own clients" 
  ON public.clients 
  FOR UPDATE 
  USING (auth.uid() = user_id OR auth.uid() = created_by)
  WITH CHECK (auth.uid() = user_id OR auth.uid() = created_by);

CREATE POLICY "Users can delete own clients" 
  ON public.clients 
  FOR DELETE 
  USING (auth.uid() = user_id OR auth.uid() = created_by);

-- Estimates table - users can only see estimates for their jobs
CREATE POLICY "Users can view own estimates" 
  ON public.estimates 
  FOR SELECT 
  USING (
    auth.uid() = user_id OR 
    EXISTS (SELECT 1 FROM public.jobs WHERE jobs.id = estimates.job_id AND (jobs.user_id = auth.uid() OR jobs.created_by = auth.uid()))
  );

CREATE POLICY "Users can create own estimates" 
  ON public.estimates 
  FOR INSERT 
  WITH CHECK (
    auth.uid() = user_id OR 
    EXISTS (SELECT 1 FROM public.jobs WHERE jobs.id = estimates.job_id AND (jobs.user_id = auth.uid() OR jobs.created_by = auth.uid()))
  );

CREATE POLICY "Users can update own estimates" 
  ON public.estimates 
  FOR UPDATE 
  USING (
    auth.uid() = user_id OR 
    EXISTS (SELECT 1 FROM public.jobs WHERE jobs.id = estimates.job_id AND (jobs.user_id = auth.uid() OR jobs.created_by = auth.uid()))
  )
  WITH CHECK (
    auth.uid() = user_id OR 
    EXISTS (SELECT 1 FROM public.jobs WHERE jobs.id = estimates.job_id AND (jobs.user_id = auth.uid() OR jobs.created_by = auth.uid()))
  );

CREATE POLICY "Users can delete own estimates" 
  ON public.estimates 
  FOR DELETE 
  USING (
    auth.uid() = user_id OR 
    EXISTS (SELECT 1 FROM public.jobs WHERE jobs.id = estimates.job_id AND (jobs.user_id = auth.uid() OR jobs.created_by = auth.uid()))
  );

-- Invoices table - users can only see invoices for their jobs
CREATE POLICY "Users can view own invoices" 
  ON public.invoices 
  FOR SELECT 
  USING (
    auth.uid() = user_id OR 
    EXISTS (SELECT 1 FROM public.jobs WHERE jobs.id = invoices.job_id AND (jobs.user_id = auth.uid() OR jobs.created_by = auth.uid()))
  );

CREATE POLICY "Users can create own invoices" 
  ON public.invoices 
  FOR INSERT 
  WITH CHECK (
    auth.uid() = user_id OR 
    EXISTS (SELECT 1 FROM public.jobs WHERE jobs.id = invoices.job_id AND (jobs.user_id = auth.uid() OR jobs.created_by = auth.uid()))
  );

CREATE POLICY "Users can update own invoices" 
  ON public.invoices 
  FOR UPDATE 
  USING (
    auth.uid() = user_id OR 
    EXISTS (SELECT 1 FROM public.jobs WHERE jobs.id = invoices.job_id AND (jobs.user_id = auth.uid() OR jobs.created_by = auth.uid()))
  )
  WITH CHECK (
    auth.uid() = user_id OR 
    EXISTS (SELECT 1 FROM public.jobs WHERE jobs.id = invoices.job_id AND (jobs.user_id = auth.uid() OR jobs.created_by = auth.uid()))
  );

CREATE POLICY "Users can delete own invoices" 
  ON public.invoices 
  FOR DELETE 
  USING (
    auth.uid() = user_id OR 
    EXISTS (SELECT 1 FROM public.jobs WHERE jobs.id = invoices.job_id AND (jobs.user_id = auth.uid() OR jobs.created_by = auth.uid()))
  );

-- Products table - users can only see their own products
CREATE POLICY "Users can view own products" 
  ON public.products 
  FOR SELECT 
  USING (auth.uid() = user_id OR user_id IS NULL); -- Allow viewing shared products

CREATE POLICY "Users can create own products" 
  ON public.products 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update own products" 
  ON public.products 
  FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own products" 
  ON public.products 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Messages table - users can only see their own messages
CREATE POLICY "Users can view own messages" 
  ON public.messages 
  FOR SELECT 
  USING (auth.uid() = user_id OR auth.uid()::text = sender OR auth.uid()::text = recipient);

CREATE POLICY "Users can create own messages" 
  ON public.messages 
  FOR INSERT 
  WITH CHECK (auth.uid()::text = sender);

CREATE POLICY "Users can update own messages" 
  ON public.messages 
  FOR UPDATE 
  USING (auth.uid()::text = sender)
  WITH CHECK (auth.uid()::text = sender);

-- Conversations table - users can only see their own conversations
CREATE POLICY "Users can view own conversations" 
  ON public.conversations 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own conversations" 
  ON public.conversations 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own conversations" 
  ON public.conversations 
  FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own conversations"
  ON public.conversations
  FOR DELETE
  USING (auth.uid() = user_id);

-- Automations table - users can only see their own automations
CREATE POLICY "Users can view own automations" 
  ON public.automations 
  FOR SELECT 
  USING (auth.uid() = user_id OR auth.uid() = created_by);

CREATE POLICY "Users can create own automations" 
  ON public.automations 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id OR auth.uid() = created_by);

CREATE POLICY "Users can update own automations" 
  ON public.automations 
  FOR UPDATE 
  USING (auth.uid() = user_id OR auth.uid() = created_by)
  WITH CHECK (auth.uid() = user_id OR auth.uid() = created_by);

CREATE POLICY "Users can delete own automations" 
  ON public.automations 
  FOR DELETE 
  USING (auth.uid() = user_id OR auth.uid() = created_by);

-- Custom roles table - users can only see their own roles
CREATE POLICY "Users can view own roles" 
  ON public.custom_roles 
  FOR SELECT 
  USING (auth.uid() = user_id OR auth.uid() = created_by);

CREATE POLICY "Users can manage own roles" 
  ON public.custom_roles 
  FOR ALL 
  USING (auth.uid() = user_id OR auth.uid() = created_by)
  WITH CHECK (auth.uid() = user_id OR auth.uid() = created_by);

-- Telnyx phone numbers - users can only see their own numbers
CREATE POLICY "Users can view own phone numbers" 
  ON public.telnyx_phone_numbers 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own phone numbers" 
  ON public.telnyx_phone_numbers 
  FOR ALL 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Step 4: Ensure RLS is enabled on all tables
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estimates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telnyx_phone_numbers ENABLE ROW LEVEL SECURITY;

-- Step 5: Create function to automatically set user_id on insert
CREATE OR REPLACE FUNCTION public.set_user_id()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NEW.user_id IS NULL THEN
    NEW.user_id = auth.uid();
  END IF;
  RETURN NEW;
END;
$$;

-- Create triggers to automatically set user_id
CREATE TRIGGER set_user_id_on_jobs
  BEFORE INSERT ON public.jobs
  FOR EACH ROW EXECUTE FUNCTION public.set_user_id();

CREATE TRIGGER set_user_id_on_clients
  BEFORE INSERT ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.set_user_id();

CREATE TRIGGER set_user_id_on_products
  BEFORE INSERT ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.set_user_id();

CREATE TRIGGER set_user_id_on_messages
  BEFORE INSERT ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.set_user_id();

CREATE TRIGGER set_user_id_on_conversations
  BEFORE INSERT ON public.conversations
  FOR EACH ROW EXECUTE FUNCTION public.set_user_id();

CREATE TRIGGER set_user_id_on_automations
  BEFORE INSERT ON public.automations
  FOR EACH ROW EXECUTE FUNCTION public.set_user_id();

CREATE TRIGGER set_user_id_on_custom_roles
  BEFORE INSERT ON public.custom_roles
  FOR EACH ROW EXECUTE FUNCTION public.set_user_id();

CREATE TRIGGER set_user_id_on_telnyx_phone_numbers
  BEFORE INSERT ON public.telnyx_phone_numbers
  FOR EACH ROW EXECUTE FUNCTION public.set_user_id();

-- Step 6: Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_jobs_user_id ON public.jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON public.clients(user_id);
CREATE INDEX IF NOT EXISTS idx_estimates_user_id ON public.estimates(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON public.invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_products_user_id ON public.products(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_user_id ON public.messages(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON public.conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_automations_user_id ON public.automations(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_roles_user_id ON public.custom_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_telnyx_phone_numbers_user_id ON public.telnyx_phone_numbers(user_id); 
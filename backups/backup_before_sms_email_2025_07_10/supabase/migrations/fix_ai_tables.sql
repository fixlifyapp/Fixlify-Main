
-- Drop existing policies if they exist (ignore errors)
DROP POLICY IF EXISTS "Users can view their own AI configs" ON public.ai_agent_configs;
DROP POLICY IF EXISTS "Users can create their own AI configs" ON public.ai_agent_configs;
DROP POLICY IF EXISTS "Users can update their own AI configs" ON public.ai_agent_configs;
DROP POLICY IF EXISTS "Users can delete their own AI configs" ON public.ai_agent_configs;
DROP POLICY IF EXISTS "Users can view their own Connect calls" ON public.amazon_connect_calls;
DROP POLICY IF EXISTS "Service role can insert Connect calls" ON public.amazon_connect_calls;
DROP POLICY IF EXISTS "Users can update their own Connect calls" ON public.amazon_connect_calls;

-- Создаем таблицу для хранения настроек AI агента (если не существует)
CREATE TABLE IF NOT EXISTS public.ai_agent_configs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  business_niche TEXT NOT NULL DEFAULT 'General Service',
  diagnostic_price NUMERIC NOT NULL DEFAULT 75.00,
  emergency_surcharge NUMERIC NOT NULL DEFAULT 50.00,
  custom_prompt_additions TEXT,
  is_active BOOLEAN DEFAULT true,
  connect_instance_arn TEXT,
  aws_region TEXT DEFAULT 'us-east-1',
  agent_name TEXT DEFAULT 'AI Assistant',
  voice_id TEXT DEFAULT 'alloy',
  greeting_template TEXT DEFAULT 'Hello, my name is {agent_name}. I''m an AI assistant for {company_name}. How can I help you today?',
  company_name TEXT DEFAULT 'our company',
  service_areas JSONB DEFAULT '[]'::jsonb,
  business_hours JSONB DEFAULT '{"friday": {"open": "08:00", "close": "17:00", "enabled": true}, "monday": {"open": "08:00", "close": "17:00", "enabled": true}, "sunday": {"open": "10:00", "close": "14:00", "enabled": false}, "tuesday": {"open": "08:00", "close": "17:00", "enabled": true}, "saturday": {"open": "09:00", "close": "15:00", "enabled": true}, "thursday": {"open": "08:00", "close": "17:00", "enabled": true}, "wednesday": {"open": "08:00", "close": "17:00", "enabled": true}}'::jsonb,
  service_types JSONB DEFAULT '["HVAC", "Plumbing", "Electrical", "General Repair"]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Создаем таблицу для логов звонков Amazon Connect (если не существует)
CREATE TABLE IF NOT EXISTS public.amazon_connect_calls (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contact_id TEXT NOT NULL,
  instance_id TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  client_id TEXT,
  user_id UUID,
  call_status TEXT DEFAULT 'completed',
  call_duration INTEGER,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE,
  ai_transcript TEXT,
  appointment_scheduled BOOLEAN DEFAULT false,
  appointment_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Создаем индексы для оптимизации запросов
CREATE INDEX IF NOT EXISTS idx_ai_agent_configs_user_id ON public.ai_agent_configs(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_agent_configs_active ON public.ai_agent_configs(is_active);
CREATE INDEX IF NOT EXISTS idx_amazon_connect_calls_contact_id ON public.amazon_connect_calls(contact_id);
CREATE INDEX IF NOT EXISTS idx_amazon_connect_calls_user_id ON public.amazon_connect_calls(user_id);
CREATE INDEX IF NOT EXISTS idx_amazon_connect_calls_started_at ON public.amazon_connect_calls(started_at);

-- Включаем Row Level Security для безопасности
ALTER TABLE public.ai_agent_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.amazon_connect_calls ENABLE ROW LEVEL SECURITY;

-- Создаем политики RLS для ai_agent_configs (без IF NOT EXISTS)
CREATE POLICY "Users can view their own AI configs" 
  ON public.ai_agent_configs 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own AI configs" 
  ON public.ai_agent_configs 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own AI configs" 
  ON public.ai_agent_configs 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own AI configs" 
  ON public.ai_agent_configs 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Создаем политики RLS для amazon_connect_calls
CREATE POLICY "Users can view their own Connect calls" 
  ON public.amazon_connect_calls 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert Connect calls" 
  ON public.amazon_connect_calls 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Users can update their own Connect calls" 
  ON public.amazon_connect_calls 
  FOR UPDATE 
  USING (auth.uid() = user_id);

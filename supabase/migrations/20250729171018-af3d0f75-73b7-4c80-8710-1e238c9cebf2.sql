-- Create automation tables and functions

-- Create automation workflows table
CREATE TABLE IF NOT EXISTS public.automation_workflows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID,
  template_config JSONB DEFAULT '{}'::jsonb,
  trigger_type VARCHAR(100),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'paused')),
  execution_count INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  last_triggered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create automation execution logs table
CREATE TABLE IF NOT EXISTS public.automation_execution_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  automation_id UUID REFERENCES public.automation_workflows(id) ON DELETE CASCADE,
  trigger_type VARCHAR(100),
  trigger_data JSONB DEFAULT '{}'::jsonb,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  actions_executed JSONB DEFAULT '[]'::jsonb,
  organization_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on automation tables
ALTER TABLE public.automation_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_execution_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for automation_workflows
CREATE POLICY "Users can view their own automation workflows" 
ON public.automation_workflows FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own automation workflows" 
ON public.automation_workflows FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own automation workflows" 
ON public.automation_workflows FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own automation workflows" 
ON public.automation_workflows FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for automation_execution_logs
CREATE POLICY "Users can view their organization's automation logs" 
ON public.automation_execution_logs FOR SELECT 
USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  )
);

CREATE POLICY "System can insert automation logs" 
ON public.automation_execution_logs FOR INSERT 
WITH CHECK (true);

-- Create function to execute automation for records
CREATE OR REPLACE FUNCTION execute_automation_for_record(
  trigger_type_val VARCHAR(100),
  context_data JSONB,
  org_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  workflow_rec RECORD;
BEGIN
  -- Find matching active workflows
  FOR workflow_rec IN 
    SELECT aw.id, aw.name
    FROM automation_workflows aw
    WHERE aw.trigger_type = trigger_type_val
    AND aw.status = 'active'
    AND aw.organization_id = org_id
  LOOP
    -- Log the automation execution request
    INSERT INTO automation_execution_logs (
      automation_id,
      trigger_type,
      trigger_data,
      status,
      started_at,
      organization_id
    ) VALUES (
      workflow_rec.id,
      trigger_type_val,
      context_data,
      'pending',
      now(),
      org_id
    );
    
    -- Here you would call the automation-executor edge function
    -- For now, we'll just log that it should be executed
    RAISE NOTICE 'Automation % (%) should be executed for trigger %', 
      workflow_rec.name, workflow_rec.id, trigger_type_val;
  END LOOP;
  
  -- Log the trigger event
  RAISE NOTICE 'Automation trigger: % for org: %', trigger_type_val, org_id;
END;
$$;

-- Create trigger function for job automation
CREATE OR REPLACE FUNCTION handle_job_automation_triggers()
RETURNS TRIGGER AS $$
DECLARE
  org_id UUID;
  context_data JSONB;
BEGIN
  -- Get organization ID from user
  SELECT organization_id INTO org_id 
  FROM profiles 
  WHERE id = COALESCE(NEW.user_id, OLD.user_id)
  LIMIT 1;
  
  -- Use user_id as fallback if no organization_id
  IF org_id IS NULL THEN
    org_id := COALESCE(NEW.user_id, OLD.user_id);
  END IF;
  
  -- Build context data with job information
  context_data := jsonb_build_object(
    'jobId', NEW.id,
    'jobTitle', NEW.title,
    'jobDescription', NEW.description,
    'jobStatus', NEW.status,
    'clientId', NEW.client_id,
    'userId', NEW.user_id,
    'date', NEW.date,
    'scheduleStart', NEW.schedule_start,
    'scheduleEnd', NEW.schedule_end,
    'revenue', NEW.revenue,
    'oldStatus', CASE WHEN TG_OP = 'UPDATE' THEN OLD.status ELSE NULL END
  );
  
  -- Job created trigger
  IF TG_OP = 'INSERT' THEN
    PERFORM execute_automation_for_record('job_created', context_data, org_id);
  END IF;
  
  -- Job status changed triggers
  IF TG_OP = 'UPDATE' AND NEW.status != OLD.status THEN
    -- General status change
    PERFORM execute_automation_for_record('job_status_changed', context_data, org_id);
    
    -- Specific status triggers
    IF NEW.status = 'completed' THEN
      PERFORM execute_automation_for_record('job_completed', context_data, org_id);
    ELSIF NEW.status = 'in_progress' THEN
      PERFORM execute_automation_for_record('job_started', context_data, org_id);
    ELSIF NEW.status = 'scheduled' THEN
      PERFORM execute_automation_for_record('job_scheduled', context_data, org_id);
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create the trigger on jobs table
DROP TRIGGER IF EXISTS automation_job_triggers ON jobs;
CREATE TRIGGER automation_job_triggers
  AFTER INSERT OR UPDATE ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION handle_job_automation_triggers();

-- Create updated_at trigger for automation_workflows
CREATE OR REPLACE FUNCTION update_automation_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_automation_workflows_updated_at
  BEFORE UPDATE ON automation_workflows
  FOR EACH ROW
  EXECUTE FUNCTION update_automation_updated_at();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_automation_workflows_user_id ON automation_workflows(user_id);
CREATE INDEX IF NOT EXISTS idx_automation_workflows_trigger_type ON automation_workflows(trigger_type);
CREATE INDEX IF NOT EXISTS idx_automation_workflows_status ON automation_workflows(status);
CREATE INDEX IF NOT EXISTS idx_automation_execution_logs_automation_id ON automation_execution_logs(automation_id);
CREATE INDEX IF NOT EXISTS idx_automation_execution_logs_trigger_type ON automation_execution_logs(trigger_type);
CREATE INDEX IF NOT EXISTS idx_automation_execution_logs_status ON automation_execution_logs(status);
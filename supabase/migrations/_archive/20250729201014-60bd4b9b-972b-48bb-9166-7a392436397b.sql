-- Check and update the automation_workflows status constraint to include 'inactive'
ALTER TABLE public.automation_workflows DROP CONSTRAINT IF EXISTS automation_workflows_status_check;

-- Add updated status check constraint that includes 'inactive'
ALTER TABLE public.automation_workflows ADD CONSTRAINT automation_workflows_status_check 
CHECK (status IN ('active', 'inactive', 'draft', 'paused'));
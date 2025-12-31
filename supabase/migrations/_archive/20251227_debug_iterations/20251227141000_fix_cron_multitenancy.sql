-- Fix CRON jobs for multi-tenancy
-- Update to use organization_id instead of user_id

-- Remove old jobs
SELECT cron.unschedule('check-appointment-reminders');
SELECT cron.unschedule('check-overdue-invoices');

-- Recreate with organization_id
SELECT cron.schedule(
  'check-appointment-reminders',
  '*/15 * * * *',
  $$
  INSERT INTO public.automation_execution_logs (workflow_id, trigger_type, trigger_data, status, created_at)
  SELECT
    w.id,
    'job_scheduled',
    jsonb_build_object(
      'trigger_type', 'job_scheduled',
      'table_name', 'jobs',
      'operation', 'CRON',
      'record_id', j.id,
      'new_record', row_to_json(j),
      'user_id', j.user_id,
      'organization_id', j.organization_id,
      'workflow_id', w.id,
      'timing_hours_before', 24
    ),
    'pending',
    NOW()
  FROM public.jobs j
  INNER JOIN public.automation_workflows w ON w.organization_id = j.organization_id
  WHERE
    w.trigger_type = 'job_scheduled'
    AND w.is_active = true
    AND w.status = 'active'
    AND j.schedule_start IS NOT NULL
    AND j.schedule_start BETWEEN NOW() + INTERVAL '23 hours' AND NOW() + INTERVAL '25 hours'
    AND j.status NOT IN ('completed', 'cancelled')
    AND NOT EXISTS (
      SELECT 1 FROM public.automation_execution_logs el
      WHERE el.workflow_id = w.id
      AND (el.trigger_data->>'record_id')::text = j.id::text
      AND el.created_at > NOW() - INTERVAL '20 hours'
    );
  $$
);

SELECT cron.schedule(
  'check-overdue-invoices',
  '0 9 * * *',
  $$
  INSERT INTO public.automation_execution_logs (workflow_id, trigger_type, trigger_data, status, created_at)
  SELECT
    w.id,
    'invoice_overdue',
    jsonb_build_object(
      'trigger_type', 'invoice_overdue',
      'table_name', 'invoices',
      'operation', 'CRON',
      'record_id', i.id,
      'new_record', row_to_json(i),
      'user_id', i.user_id,
      'organization_id', i.organization_id,
      'workflow_id', w.id,
      'days_overdue', EXTRACT(DAY FROM NOW() - i.due_date)::int
    ),
    'pending',
    NOW()
  FROM public.invoices i
  INNER JOIN public.automation_workflows w ON w.organization_id = i.organization_id
  WHERE
    w.trigger_type = 'invoice_overdue'
    AND w.is_active = true
    AND w.status = 'active'
    AND i.status NOT IN ('paid', 'cancelled', 'void')
    AND i.due_date < CURRENT_DATE
    AND EXTRACT(DAY FROM NOW() - i.due_date)::int >= COALESCE((w.trigger_config->>'daysOverdue')::int, 3)
    AND NOT EXISTS (
      SELECT 1 FROM public.automation_execution_logs el
      WHERE el.workflow_id = w.id
      AND (el.trigger_data->>'record_id')::text = i.id::text
      AND el.created_at > i.due_date
    );
  $$
);

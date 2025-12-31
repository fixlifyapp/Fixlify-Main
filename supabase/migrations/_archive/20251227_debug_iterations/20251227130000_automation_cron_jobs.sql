-- Setup CRON jobs for scheduled automation triggers
-- Requires pg_cron extension (already enabled)

-- 1. Process automation queue every 2 minutes
-- This handles pending execution logs
SELECT cron.schedule(
  'process-automation-queue',
  '*/2 * * * *',
  $$
  SELECT net.http_post(
    url := current_setting('app.settings.supabase_url') || '/functions/v1/process-automation-queue',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
    ),
    body := '{}'::jsonb
  );
  $$
);

-- 2. Check for appointment reminders every 15 minutes
-- Finds jobs scheduled in next 24h that haven't been reminded yet
SELECT cron.schedule(
  'check-appointment-reminders',
  '*/15 * * * *',
  $$
  INSERT INTO automation_execution_logs (workflow_id, trigger_type, trigger_data, status, created_at)
  SELECT
    w.id as workflow_id,
    'job_scheduled' as trigger_type,
    jsonb_build_object(
      'trigger_type', 'job_scheduled',
      'job_id', j.id,
      'job_title', j.title,
      'schedule_start', j.schedule_start,
      'client_id', j.client_id,
      'user_id', j.user_id,
      'timing_type', 'before',
      'hours_before', 24
    ) as trigger_data,
    'pending' as status,
    NOW() as created_at
  FROM jobs j
  JOIN automation_workflows w ON w.user_id = j.user_id
  WHERE
    w.trigger_type = 'job_scheduled'
    AND w.is_active = true
    AND w.status = 'active'
    AND j.schedule_start IS NOT NULL
    AND j.schedule_start BETWEEN NOW() + INTERVAL '23 hours' AND NOW() + INTERVAL '25 hours'
    AND j.status NOT IN ('completed', 'cancelled')
    -- Prevent duplicate reminders
    AND NOT EXISTS (
      SELECT 1 FROM automation_execution_logs el
      WHERE el.workflow_id = w.id
      AND el.trigger_data->>'job_id' = j.id::text
      AND el.created_at > NOW() - INTERVAL '24 hours'
    );
  $$
);

-- 3. Check for overdue invoices daily at 9 AM
SELECT cron.schedule(
  'check-overdue-invoices',
  '0 9 * * *',
  $$
  INSERT INTO automation_execution_logs (workflow_id, trigger_type, trigger_data, status, created_at)
  SELECT
    w.id as workflow_id,
    'invoice_overdue' as trigger_type,
    jsonb_build_object(
      'trigger_type', 'invoice_overdue',
      'invoice_id', i.id,
      'invoice_number', i.invoice_number,
      'client_id', i.client_id,
      'amount', i.total_amount,
      'due_date', i.due_date,
      'days_overdue', EXTRACT(DAY FROM NOW() - i.due_date)::int,
      'user_id', i.user_id
    ) as trigger_data,
    'pending' as status,
    NOW() as created_at
  FROM invoices i
  JOIN automation_workflows w ON w.user_id = i.user_id
  WHERE
    w.trigger_type = 'invoice_overdue'
    AND w.is_active = true
    AND w.status = 'active'
    AND i.status NOT IN ('paid', 'cancelled', 'void')
    AND i.due_date < CURRENT_DATE
    -- Check days overdue matches workflow config
    AND EXTRACT(DAY FROM NOW() - i.due_date)::int >= COALESCE((w.trigger_config->>'daysOverdue')::int, 3)
    -- Prevent duplicate triggers (only once per overdue threshold)
    AND NOT EXISTS (
      SELECT 1 FROM automation_execution_logs el
      WHERE el.workflow_id = w.id
      AND el.trigger_data->>'invoice_id' = i.id::text
      AND el.created_at > i.due_date
    );
  $$
);

-- 4. Seasonal maintenance reminders (quarterly - 1st of Mar, Jun, Sep, Dec at 10 AM)
SELECT cron.schedule(
  'seasonal-maintenance-reminders',
  '0 10 1 3,6,9,12 *',
  $$
  INSERT INTO automation_execution_logs (workflow_id, trigger_type, trigger_data, status, created_at)
  SELECT
    w.id as workflow_id,
    'schedule_time' as trigger_type,
    jsonb_build_object(
      'trigger_type', 'schedule_time',
      'schedule_type', 'recurring',
      'frequency', 'quarterly',
      'month', EXTRACT(MONTH FROM NOW())::int,
      'user_id', w.user_id
    ) as trigger_data,
    'pending' as status,
    NOW() as created_at
  FROM automation_workflows w
  WHERE
    w.trigger_type = 'schedule_time'
    AND w.is_active = true
    AND w.status = 'active'
    AND w.trigger_config->>'scheduleType' = 'recurring'
    AND w.trigger_config->>'frequency' = 'quarterly';
  $$
);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA cron TO postgres;
GRANT ALL ON ALL TABLES IN SCHEMA cron TO postgres;

-- Add comment for documentation
COMMENT ON EXTENSION pg_cron IS 'Automation scheduler for Fixlify - processes automation queue, appointment reminders, overdue invoices, and seasonal campaigns';

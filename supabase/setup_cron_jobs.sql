-- ============================================
-- AUTOMATION CRON JOBS SETUP
-- Run this in Supabase SQL Editor (Dashboard)
-- ============================================

-- First, check if pg_cron is enabled
SELECT * FROM pg_extension WHERE extname = 'pg_cron';

-- Remove existing jobs if any (to avoid duplicates)
SELECT cron.unschedule('process-automation-queue') WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'process-automation-queue');
SELECT cron.unschedule('check-appointment-reminders') WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'check-appointment-reminders');
SELECT cron.unschedule('check-overdue-invoices') WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'check-overdue-invoices');
SELECT cron.unschedule('seasonal-maintenance-reminders') WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'seasonal-maintenance-reminders');

-- ============================================
-- JOB 1: Check for 24-hour appointment reminders (every 15 minutes)
-- ============================================
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
      'workflow_id', w.id,
      'timing_hours_before', 24
    ),
    'pending',
    NOW()
  FROM public.jobs j
  INNER JOIN public.automation_workflows w ON w.user_id = j.user_id
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
      AND (el.trigger_data->>'record_id')::uuid = j.id
      AND el.created_at > NOW() - INTERVAL '20 hours'
    );
  $$
);

-- ============================================
-- JOB 2: Check for overdue invoices (daily at 9 AM)
-- ============================================
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
      'workflow_id', w.id,
      'days_overdue', EXTRACT(DAY FROM NOW() - i.due_date)::int
    ),
    'pending',
    NOW()
  FROM public.invoices i
  INNER JOIN public.automation_workflows w ON w.user_id = i.user_id
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
      AND (el.trigger_data->>'record_id')::uuid = i.id
      AND el.created_at > i.due_date
    );
  $$
);

-- ============================================
-- JOB 3: Seasonal maintenance (quarterly)
-- ============================================
SELECT cron.schedule(
  'seasonal-maintenance-reminders',
  '0 10 1 3,6,9,12 *',
  $$
  INSERT INTO public.automation_execution_logs (workflow_id, trigger_type, trigger_data, status, created_at)
  SELECT
    w.id,
    'schedule_time',
    jsonb_build_object(
      'trigger_type', 'schedule_time',
      'table_name', 'automation_workflows',
      'operation', 'CRON',
      'record_id', w.id,
      'user_id', w.user_id,
      'workflow_id', w.id,
      'quarter', EXTRACT(QUARTER FROM NOW())::int
    ),
    'pending',
    NOW()
  FROM public.automation_workflows w
  WHERE
    w.trigger_type = 'schedule_time'
    AND w.is_active = true
    AND w.status = 'active'
    AND w.trigger_config->>'frequency' = 'quarterly'
    AND NOT EXISTS (
      SELECT 1 FROM public.automation_execution_logs el
      WHERE el.workflow_id = w.id
      AND el.created_at > NOW() - INTERVAL '80 days'
    );
  $$
);

-- ============================================
-- JOB 4: Daily Telnyx phone number sync (3 AM UTC)
-- ============================================
SELECT cron.unschedule('telnyx-sync-daily') WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'telnyx-sync-daily');

SELECT cron.schedule(
  'telnyx-sync-daily',
  '0 3 * * *',
  $$
  SELECT net.http_post(
    url := 'https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/telnyx-sync-numbers',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xcHB2Y3JsdnNncnNxZWxnbG9kIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzU5MTcwNSwiZXhwIjoyMDYzMTY3NzA1fQ.l8fImvQ7PRyVabSIXMEs9TY_Q_b05sulocN2XS7RpzU'
    ),
    body := '{}'::jsonb
  );
  $$
);

-- ============================================
-- Verify jobs were created
-- ============================================
SELECT jobid, jobname, schedule, active FROM cron.job ORDER BY jobid;

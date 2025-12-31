-- Fix CRON job for invoices - use profiles instead of user_organizations

-- Remove old job
SELECT cron.unschedule('check-overdue-invoices');

-- Recreate with proper join through profiles
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
      'organization_id', p.organization_id,
      'workflow_id', w.id,
      'days_overdue', EXTRACT(DAY FROM NOW() - i.due_date)::int
    ),
    'pending',
    NOW()
  FROM public.invoices i
  -- Join through profiles since invoices doesn't have organization_id
  INNER JOIN public.profiles p ON p.id = i.user_id
  INNER JOIN public.automation_workflows w ON w.organization_id = p.organization_id
  WHERE
    w.trigger_type = 'invoice_overdue'
    AND w.is_active = true
    AND w.status = 'active'
    AND p.organization_id IS NOT NULL
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

-- Note: appointment reminders job joins on jobs.organization_id which exists

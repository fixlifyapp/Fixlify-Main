-- =============================================
-- pg_cron Integration for Fixlify Automation System
-- =============================================
-- Description: Implements pg_cron scheduled jobs for automation triggers
-- Created: August 6, 2025
-- =============================================

-- Note: pg_cron extension is already enabled in Supabase by default

-- =============================================
-- PART 1: Core Tables for Scheduling
-- =============================================

-- Create automation schedules table
CREATE TABLE IF NOT EXISTS automation_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID REFERENCES automation_workflows(id) ON DELETE CASCADE,
  cron_expression TEXT NOT NULL,
  cron_job_name TEXT UNIQUE,
  is_active BOOLEAN DEFAULT true,
  last_run TIMESTAMPTZ,
  next_run TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- Create automation analytics table
CREATE TABLE IF NOT EXISTS automation_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID REFERENCES automation_workflows(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  execution_count INT DEFAULT 0,
  success_count INT DEFAULT 0,
  failure_count INT DEFAULT 0,
  success_rate DECIMAL(5,2),
  avg_execution_time DECIMAL(10,2),
  total_execution_time DECIMAL(10,2),
  revenue_impact DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(workflow_id, date)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_automation_schedules_active 
  ON automation_schedules(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_automation_schedules_next_run 
  ON automation_schedules(next_run) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_automation_analytics_date 
  ON automation_analytics(date DESC);
CREATE INDEX IF NOT EXISTS idx_automation_analytics_workflow 
  ON automation_analytics(workflow_id, date DESC);
-- =============================================
-- PART 2: Core Functions for Automation Checking
-- =============================================

-- Function to check if a schedule should trigger
CREATE OR REPLACE FUNCTION check_schedule_condition(workflow RECORD)
RETURNS BOOLEAN AS $$
DECLARE
  schedule_config JSONB;
  current_hour INT;
  current_minute INT;
  current_day INT;
  current_date INT;
  is_business_hours BOOLEAN;
  last_run TIMESTAMPTZ;
BEGIN
  schedule_config := workflow.trigger_config;
  current_hour := EXTRACT(HOUR FROM NOW());
  current_minute := EXTRACT(MINUTE FROM NOW());
  current_day := EXTRACT(DOW FROM NOW());
  current_date := EXTRACT(DAY FROM NOW());
  
  -- Check business hours (8 AM - 6 PM, Monday-Friday)
  is_business_hours := current_hour BETWEEN 8 AND 18 
                       AND current_day BETWEEN 1 AND 5;
  
  -- Get last run time  SELECT last_run INTO last_run 
  FROM automation_schedules 
  WHERE workflow_id = workflow.id;
  
  -- Prevent running more than once per minute
  IF last_run IS NOT NULL AND last_run > NOW() - INTERVAL '1 minute' THEN
    RETURN FALSE;
  END IF;
  
  -- Check schedule type
  CASE schedule_config->>'frequency'
    WHEN 'every_minute' THEN
      RETURN TRUE;
    WHEN 'hourly' THEN
      RETURN current_minute = COALESCE((schedule_config->>'minute')::INT, 0);
    WHEN 'daily' THEN
      RETURN current_hour = COALESCE((schedule_config->>'hour')::INT, 9) 
             AND current_minute = 0;
    WHEN 'weekly' THEN
      RETURN current_day = COALESCE((schedule_config->>'day_of_week')::INT, 1)
             AND current_hour = COALESCE((schedule_config->>'hour')::INT, 9)
             AND current_minute = 0;
    WHEN 'monthly' THEN
      RETURN current_date = COALESCE((schedule_config->>'day_of_month')::INT, 1)
             AND current_hour = COALESCE((schedule_config->>'hour')::INT, 9)
             AND current_minute = 0;    WHEN 'business_hours' THEN
      RETURN is_business_hours AND current_minute = 0;
    ELSE
      RETURN FALSE;
  END CASE;
END;
$$ LANGUAGE plpgsql;

-- Main function to check and trigger automations
CREATE OR REPLACE FUNCTION check_automation_triggers()
RETURNS void AS $$
DECLARE
  workflow RECORD;
  should_trigger BOOLEAN;
  execution_id UUID;
BEGIN
  -- Check scheduled/time-based triggers
  FOR workflow IN 
    SELECT w.*, s.last_run 
    FROM automation_workflows w
    LEFT JOIN automation_schedules s ON s.workflow_id = w.id
    WHERE w.status = 'active' 
    AND w.trigger_type IN ('scheduled', 'time_based')
  LOOP
    should_trigger := check_schedule_condition(workflow);
    
    IF should_trigger THEN
      -- Create execution log      INSERT INTO automation_execution_logs (
        workflow_id,
        status,
        started_at,
        trigger_data
      ) VALUES (
        workflow.id,
        'pending',
        NOW(),
        jsonb_build_object(
          'trigger_type', 'scheduled',
          'scheduled_time', NOW()
        )
      ) RETURNING id INTO execution_id;
      
      -- Update last run time
      UPDATE automation_schedules 
      SET last_run = NOW(), 
          next_run = NOW() + INTERVAL '1 hour'
      WHERE workflow_id = workflow.id;
      
      RAISE NOTICE 'Triggered workflow % with execution %', workflow.id, execution_id;
    END IF;
  END LOOP;
  
  -- Check condition-based triggers
  PERFORM check_condition_triggers();
    -- Check invoice overdue triggers
  PERFORM check_invoice_overdue_triggers();
  
  -- Check maintenance reminder triggers
  PERFORM check_maintenance_triggers();
END;
$$ LANGUAGE plpgsql;

-- Function to check condition-based triggers
CREATE OR REPLACE FUNCTION check_condition_triggers()
RETURNS void AS $$
BEGIN
  -- Check for low inventory
  INSERT INTO automation_execution_logs (workflow_id, trigger_data, status)
  SELECT 
    aw.id,
    jsonb_build_object(
      'trigger_type', 'low_inventory',
      'product_id', p.id,
      'product_name', p.name,
      'current_stock', p.stock_quantity,
      'threshold', aw.trigger_config->>'threshold'
    ),
    'pending'
  FROM products p
  JOIN automation_workflows aw ON aw.trigger_type = 'low_inventory'
  WHERE p.stock_quantity <= COALESCE((aw.trigger_config->>'threshold')::INT, 10)
  AND aw.status = 'active'  AND NOT EXISTS (
    SELECT 1 FROM automation_execution_logs ael
    WHERE ael.workflow_id = aw.id
    AND ael.trigger_data->>'product_id' = p.id::TEXT
    AND ael.created_at > NOW() - INTERVAL '24 hours'
  );
END;
$$ LANGUAGE plpgsql;

-- Function to check overdue invoices
CREATE OR REPLACE FUNCTION check_invoice_overdue_triggers()
RETURNS void AS $$
BEGIN
  -- Mark invoices as overdue
  UPDATE invoices 
  SET status = 'overdue',
      updated_at = NOW()
  WHERE due_date < CURRENT_DATE 
  AND status = 'sent'
  AND payment_status != 'paid';
  
  -- Trigger overdue workflows
  INSERT INTO automation_execution_logs (workflow_id, trigger_data, status)
  SELECT 
    aw.id,
    jsonb_build_object(
      'trigger_type', 'invoice_overdue',
      'invoice_id', i.id,      'invoice_number', i.invoice_number,
      'client_id', i.client_id,
      'amount', i.total,
      'days_overdue', CURRENT_DATE - i.due_date
    ),
    'pending'
  FROM invoices i
  JOIN automation_workflows aw ON aw.trigger_type = 'invoice_overdue'
  WHERE i.status = 'overdue'
  AND i.updated_at >= NOW() - INTERVAL '1 minute'
  AND aw.status = 'active'
  AND CURRENT_DATE - i.due_date >= COALESCE((aw.trigger_config->>'days_overdue')::INT, 1)
  AND NOT EXISTS (
    SELECT 1 FROM automation_execution_logs ael
    WHERE ael.workflow_id = aw.id
    AND ael.trigger_data->>'invoice_id' = i.id::TEXT
    AND ael.created_at > NOW() - INTERVAL '24 hours'
  );
END;
$$ LANGUAGE plpgsql;

-- Function to check maintenance reminders
CREATE OR REPLACE FUNCTION check_maintenance_triggers()
RETURNS void AS $$
BEGIN
  -- Find jobs due for maintenance  AND aw.status = 'active'
  AND NOT EXISTS (
    SELECT 1 FROM automation_execution_logs ael
    WHERE ael.workflow_id = aw.id
    AND ael.trigger_data->>'client_id' = j.client_id::TEXT
    AND ael.created_at > NOW() - INTERVAL '30 days'
  );
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- PART 3: Workflow Execution Processor
-- =============================================

-- Function to process pending automations
CREATE OR REPLACE FUNCTION process_pending_automations()
RETURNS void AS $$
DECLARE
  execution RECORD;
  workflow RECORD;
  step RECORD;
  step_result JSONB;
BEGIN
  -- Process pending executions (limit to prevent overload)
  FOR execution IN 
    SELECT * FROM automation_execution_logs 
    WHERE status = 'pending'
    ORDER BY created_at
    LIMIT 10  LOOP
    BEGIN
      -- Update status to processing
      UPDATE automation_execution_logs 
      SET status = 'processing', 
          started_at = COALESCE(started_at, NOW()),
          updated_at = NOW()
      WHERE id = execution.id;
      
      -- Get workflow details
      SELECT * INTO workflow 
      FROM automation_workflows 
      WHERE id = execution.workflow_id;
      
      -- Execute workflow steps
      FOR step IN 
        SELECT * FROM automation_steps 
        WHERE workflow_id = execution.workflow_id
        ORDER BY step_order
      LOOP
        -- Execute step based on type
        CASE step.step_type
          WHEN 'send_email' THEN
            step_result := execute_email_action(step, execution);
          WHEN 'send_sms' THEN
            step_result := execute_sms_action(step, execution);
          WHEN 'create_task' THEN
            step_result := execute_task_action(step, execution);          WHEN 'update_status' THEN
            step_result := execute_status_update(step, execution);
          WHEN 'delay' THEN
            -- Schedule for later execution
            UPDATE automation_execution_logs 
            SET status = 'delayed',
                metadata = jsonb_set(
                  COALESCE(metadata, '{}'::jsonb),
                  '{resume_at}',
                  to_jsonb(NOW() + (step.config->>'duration')::INTERVAL)
                )
            WHERE id = execution.id;
            EXIT; -- Stop processing this execution
          ELSE
            step_result := jsonb_build_object('success', true);
        END CASE;
        
        -- Log step execution
        INSERT INTO automation_step_logs (
          execution_id,
          step_id,
          status,
          result_data
        ) VALUES (
          execution.id,
          step.id,
          CASE WHEN step_result->>'success' = 'true' THEN 'completed' ELSE 'failed' END,          step_result
        );
        
        -- Stop if step failed and workflow requires all steps to succeed
        IF step_result->>'success' != 'true' AND workflow.stop_on_failure THEN
          UPDATE automation_execution_logs 
          SET status = 'failed',
              completed_at = NOW(),
              error_message = step_result->>'error'
          WHERE id = execution.id;
          EXIT;
        END IF;
      END LOOP;
      
      -- Mark as completed if all steps processed
      IF execution.status != 'delayed' THEN
        UPDATE automation_execution_logs 
        SET status = 'completed',
            completed_at = NOW()
        WHERE id = execution.id;
      END IF;
      
    EXCEPTION WHEN OTHERS THEN
      -- Log error and mark as failed
      UPDATE automation_execution_logs 
      SET status = 'failed',
          completed_at = NOW(),          error_message = SQLERRM
      WHERE id = execution.id;
    END;
  END LOOP;
  
  -- Process delayed executions that are ready
  UPDATE automation_execution_logs
  SET status = 'pending'
  WHERE status = 'delayed'
  AND (metadata->>'resume_at')::TIMESTAMPTZ <= NOW();
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- PART 4: Action Execution Functions
-- =============================================

-- Execute email action
CREATE OR REPLACE FUNCTION execute_email_action(step RECORD, execution RECORD)
RETURNS JSONB AS $$
DECLARE
  email_config JSONB;
  recipient_email TEXT;
  result JSONB;
BEGIN
  email_config := step.config;
  
  -- Get recipient email based on config  IF email_config->>'recipient_type' = 'client' THEN
    SELECT email INTO recipient_email
    FROM clients
    WHERE id = (execution.trigger_data->>'client_id')::UUID;
  ELSE
    recipient_email := email_config->>'recipient_email';
  END IF;
  
  -- Queue email for sending (will be picked up by edge function)
  INSERT INTO email_queue (
    recipient,
    subject,
    body,
    metadata
  ) VALUES (
    recipient_email,
    email_config->>'subject',
    email_config->>'body',
    jsonb_build_object(
      'workflow_id', execution.workflow_id,
      'execution_id', execution.id,
      'step_id', step.id
    )
  );
  
  RETURN jsonb_build_object('success', true, 'email_queued', recipient_email);
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);END;
$$ LANGUAGE plpgsql;

-- Execute SMS action
CREATE OR REPLACE FUNCTION execute_sms_action(step RECORD, execution RECORD)
RETURNS JSONB AS $$
DECLARE
  sms_config JSONB;
  recipient_phone TEXT;
BEGIN
  sms_config := step.config;
  
  -- Get recipient phone based on config
  IF sms_config->>'recipient_type' = 'client' THEN
    SELECT phone INTO recipient_phone
    FROM clients
    WHERE id = (execution.trigger_data->>'client_id')::UUID;
  ELSE
    recipient_phone := sms_config->>'recipient_phone';
  END IF;
  
  -- Queue SMS for sending
  INSERT INTO sms_queue (
    recipient,
    message,
    metadata
  ) VALUES (
    recipient_phone,
    sms_config->>'message',    jsonb_build_object(
      'workflow_id', execution.workflow_id,
      'execution_id', execution.id,
      'step_id', step.id
    )
  );
  
  RETURN jsonb_build_object('success', true, 'sms_queued', recipient_phone);
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql;

-- Execute task creation action
CREATE OR REPLACE FUNCTION execute_task_action(step RECORD, execution RECORD)
RETURNS JSONB AS $$
DECLARE
  task_config JSONB;
  task_id UUID;
BEGIN
  task_config := step.config;
  
  -- Create task
  INSERT INTO tasks (
    title,
    description,
    assigned_to,
    due_date,
    priority,    metadata
  ) VALUES (
    task_config->>'title',
    task_config->>'description',
    (task_config->>'assigned_to')::UUID,
    (NOW() + (task_config->>'due_in_days' || ' days')::INTERVAL)::DATE,
    COALESCE(task_config->>'priority', 'medium'),
    jsonb_build_object(
      'workflow_id', execution.workflow_id,
      'execution_id', execution.id,
      'trigger_data', execution.trigger_data
    )
  ) RETURNING id INTO task_id;
  
  RETURN jsonb_build_object('success', true, 'task_id', task_id);
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql;

-- Execute status update action
CREATE OR REPLACE FUNCTION execute_status_update(step RECORD, execution RECORD)
RETURNS JSONB AS $$
DECLARE
  update_config JSONB;
  entity_type TEXT;
  entity_id UUID;BEGIN
  update_config := step.config;
  entity_type := update_config->>'entity_type';
  
  -- Get entity ID from trigger data
  entity_id := (execution.trigger_data->>(entity_type || '_id'))::UUID;
  
  -- Update based on entity type
  CASE entity_type
    WHEN 'job' THEN
      UPDATE jobs 
      SET status = update_config->>'new_status',
          updated_at = NOW()
      WHERE id = entity_id;
    WHEN 'invoice' THEN
      UPDATE invoices 
      SET status = update_config->>'new_status',
          updated_at = NOW()
      WHERE id = entity_id;
    WHEN 'estimate' THEN
      UPDATE estimates 
      SET status = update_config->>'new_status',
          updated_at = NOW()
      WHERE id = entity_id;
  END CASE;
  
  RETURN jsonb_build_object('success', true, 'entity_updated', entity_id);EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- PART 5: Analytics Functions
-- =============================================

-- Function to update automation analytics
CREATE OR REPLACE FUNCTION update_automation_analytics()
RETURNS void AS $$
BEGIN
  -- Update or insert analytics for today
  INSERT INTO automation_analytics (
    workflow_id,
    date,
    execution_count,
    success_count,
    failure_count,
    success_rate,
    avg_execution_time,
    total_execution_time,
    revenue_impact
  )
  SELECT 
    workflow_id,
    CURRENT_DATE,
    COUNT(*) as execution_count,
    SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as success_count,    SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failure_count,
    ROUND(AVG(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) * 100, 2) as success_rate,
    ROUND(AVG(
      CASE 
        WHEN completed_at IS NOT NULL AND started_at IS NOT NULL 
        THEN EXTRACT(EPOCH FROM (completed_at - started_at))
        ELSE NULL 
      END
    ), 2) as avg_execution_time,
    ROUND(SUM(
      CASE 
        WHEN completed_at IS NOT NULL AND started_at IS NOT NULL 
        THEN EXTRACT(EPOCH FROM (completed_at - started_at))
        ELSE 0 
      END
    ), 2) as total_execution_time,
    SUM(COALESCE((metadata->>'revenue_generated')::DECIMAL, 0)) as revenue_impact
  FROM automation_execution_logs
  WHERE DATE(created_at) = CURRENT_DATE
  GROUP BY workflow_id
  ON CONFLICT (workflow_id, date) 
  DO UPDATE SET
    execution_count = EXCLUDED.execution_count,
    success_count = EXCLUDED.success_count,
    failure_count = EXCLUDED.failure_count,
    success_rate = EXCLUDED.success_rate,    avg_execution_time = EXCLUDED.avg_execution_time,
    total_execution_time = EXCLUDED.total_execution_time,
    revenue_impact = EXCLUDED.revenue_impact,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- PART 6: Management Functions
-- =============================================

-- Function to manage automation schedules
CREATE OR REPLACE FUNCTION manage_automation_schedule(
  p_workflow_id UUID,
  p_action TEXT -- 'pause', 'resume', 'delete'
)
RETURNS JSONB AS $$
DECLARE
  v_schedule RECORD;
  v_job_name TEXT;
BEGIN
  -- Get schedule info
  SELECT * INTO v_schedule 
  FROM automation_schedules 
  WHERE workflow_id = p_workflow_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Schedule not found');  END IF;
  
  v_job_name := v_schedule.cron_job_name;
  
  CASE p_action
    WHEN 'pause' THEN
      -- Mark as inactive
      UPDATE automation_schedules 
      SET is_active = false, 
          updated_at = NOW()
      WHERE workflow_id = p_workflow_id;
      
      RETURN jsonb_build_object('success', true, 'action', 'paused');
      
    WHEN 'resume' THEN
      -- Mark as active
      UPDATE automation_schedules 
      SET is_active = true, 
          updated_at = NOW()
      WHERE workflow_id = p_workflow_id;
      
      RETURN jsonb_build_object('success', true, 'action', 'resumed');
      
    WHEN 'delete' THEN
      -- Delete schedule
      DELETE FROM automation_schedules 
      WHERE workflow_id = p_workflow_id;      
      RETURN jsonb_build_object('success', true, 'action', 'deleted');
      
    ELSE
      RETURN jsonb_build_object('success', false, 'error', 'Invalid action');
  END CASE;
END;
$$ LANGUAGE plpgsql;

-- Function to get cron job statistics
CREATE OR REPLACE FUNCTION get_cron_job_stats()
RETURNS TABLE (
  job_name TEXT,
  schedule TEXT,
  last_run TIMESTAMPTZ,
  next_run TIMESTAMPTZ,
  total_runs BIGINT,
  successful_runs BIGINT,
  failed_runs BIGINT,
  success_rate DECIMAL,
  avg_duration DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cj.jobname as job_name,
    cj.schedule,
    MAX(cjd.start_time) as last_run,    MAX(as.next_run) as next_run,
    COUNT(*) as total_runs,
    SUM(CASE WHEN cjd.status = 'succeeded' THEN 1 ELSE 0 END) as successful_runs,
    SUM(CASE WHEN cjd.status = 'failed' THEN 1 ELSE 0 END) as failed_runs,
    ROUND(AVG(CASE WHEN cjd.status = 'succeeded' THEN 1 ELSE 0 END) * 100, 2) as success_rate,
    ROUND(AVG(EXTRACT(EPOCH FROM (cjd.end_time - cjd.start_time))), 2) as avg_duration
  FROM cron.job cj
  LEFT JOIN cron.job_run_details cjd ON cj.jobid = cjd.jobid
  LEFT JOIN automation_schedules as ON as.cron_job_name = cj.jobname
  WHERE cjd.start_time > NOW() - INTERVAL '30 days'
  GROUP BY cj.jobname, cj.schedule;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- PART 7: Schedule Initial Cron Jobs
-- =============================================

-- Schedule main automation processor (every minute)
DO $$
BEGIN
  -- Check if job already exists
  IF NOT EXISTS (
    SELECT 1 FROM cron.job WHERE jobname = 'check-automation-triggers'
  ) THEN
    PERFORM cron.schedule(
      'check-automation-triggers',
      '* * * * *', -- Every minute
      'SELECT check_automation_triggers();'
    );
    RAISE NOTICE 'Scheduled: check-automation-triggers';
  END IF;
END $$;

-- Schedule pending automation processor (every 30 seconds - using minute granularity)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM cron.job WHERE jobname = 'process-automations'
  ) THEN
    PERFORM cron.schedule(
      'process-automations',
      '* * * * *', -- Every minute (pg_cron doesn't support seconds)
      'SELECT process_pending_automations();'
    );
    RAISE NOTICE 'Scheduled: process-automations';
  END IF;
END $$;
-- Schedule daily invoice check (9 AM)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM cron.job WHERE jobname = 'check-overdue-invoices'
  ) THEN
    PERFORM cron.schedule(
      'check-overdue-invoices',
      '0 9 * * *', -- Daily at 9 AM
      'SELECT check_invoice_overdue_triggers();'
    );
    RAISE NOTICE 'Scheduled: check-overdue-invoices';
  END IF;
END $$;

-- Schedule daily maintenance reminders (8 AM)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM cron.job WHERE jobname = 'check-maintenance-reminders'
  ) THEN
    PERFORM cron.schedule(
      'check-maintenance-reminders',
      '0 8 * * *', -- Daily at 8 AM
      'SELECT check_maintenance_triggers();'
    );
    RAISE NOTICE 'Scheduled: check-maintenance-reminders';
  END IF;
END $$;

-- Schedule hourly analytics update
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM cron.job WHERE jobname = 'update-automation-analytics'
  ) THEN
    PERFORM cron.schedule(
      'update-automation-analytics',
      '0 * * * *', -- Every hour
      'SELECT update_automation_analytics();'
    );
    RAISE NOTICE 'Scheduled: update-automation-analytics';
  END IF;
END $$;
-- =============================================
-- PART 8: Helper Functions for Queue Management
-- =============================================

-- Create email queue table if not exists
CREATE TABLE IF NOT EXISTS email_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  sent_at TIMESTAMPTZ,
  error_message TEXT
);

-- Create SMS queue table if not exists
CREATE TABLE IF NOT EXISTS sms_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient TEXT NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  sent_at TIMESTAMPTZ,
  error_message TEXT
);

-- Create indexes for queue tables
CREATE INDEX IF NOT EXISTS idx_email_queue_status ON email_queue(status) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_sms_queue_status ON sms_queue(status) WHERE status = 'pending';

-- =============================================
-- PART 9: Create Example Automations
-- =============================================

-- Example: Invoice Overdue Reminder Workflow
DO $$
DECLARE
  workflow_id UUID;
BEGIN
  -- Check if example workflow exists
  IF NOT EXISTS (
    SELECT 1 FROM automation_workflows 
    WHERE name = 'Invoice Overdue Reminder (pg_cron)'
  ) THEN
    -- Create workflow
    INSERT INTO automation_workflows (
      name,
      description,
      trigger_type,
      trigger_config,
      status,
      stop_on_failure
    ) VALUES (
      'Invoice Overdue Reminder (pg_cron)',
      'Automatically sends reminder emails for overdue invoices',
      'invoice_overdue',
      jsonb_build_object(
        'days_overdue', 1,
        'check_time', '09:00'
      ),
      'active',
      false
    ) RETURNING id INTO workflow_id;    
    -- Add workflow steps
    -- Step 1: Send Email
    INSERT INTO automation_steps (
      workflow_id,
      step_order,
      step_type,
      config
    ) VALUES (
      workflow_id,
      1,
      'send_email',
      jsonb_build_object(
        'recipient_type', 'client',
        'subject', 'Invoice Reminder: Payment Overdue',
        'body', 'Your invoice is now overdue. Please make payment at your earliest convenience.',
        'template_id', null
      )
    );
    
    -- Step 2: Create Task
    INSERT INTO automation_steps (
      workflow_id,
      step_order,
      step_type,
      config
    ) VALUES (
      workflow_id,
      2,
      'create_task',
      jsonb_build_object(
        'title', 'Follow up on overdue invoice',
        'description', 'Contact client regarding overdue payment',
        'priority', 'high',
        'due_in_days', '2'
      )
    );
    
    RAISE NOTICE 'Created example workflow: Invoice Overdue Reminder';
  END IF;
END $$;

-- =============================================
-- PART 10: Monitoring & Maintenance Functions
-- =============================================

-- Function to clean old execution logs
CREATE OR REPLACE FUNCTION cleanup_old_automation_logs()
RETURNS void AS $$
BEGIN
  -- Delete logs older than 90 days
  DELETE FROM automation_execution_logs 
  WHERE created_at < NOW() - INTERVAL '90 days';
  
  -- Delete old analytics data
  DELETE FROM automation_analytics 
  WHERE date < CURRENT_DATE - 90;
  
  RAISE NOTICE 'Cleaned up % old execution logs', ROW_COUNT;
END;
$$ LANGUAGE plpgsql;
-- Schedule weekly cleanup (Sunday at 2 AM)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM cron.job WHERE jobname = 'cleanup-automation-logs'
  ) THEN
    PERFORM cron.schedule(
      'cleanup-automation-logs',
      '0 2 * * 0', -- Sunday at 2 AM
      'SELECT cleanup_old_automation_logs();'
    );
    RAISE NOTICE 'Scheduled: cleanup-automation-logs';
  END IF;
END $$;

-- =============================================
-- PART 11: RLS Policies for New Tables
-- =============================================

-- Enable RLS on new tables
ALTER TABLE automation_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_queue ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for automation_schedules
CREATE POLICY "Users can view their automation schedules"
  ON automation_schedules FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM automation_workflows 
      WHERE automation_workflows.id = automation_schedules.workflow_id
      AND (
        automation_workflows.created_by = auth.uid()
        OR automation_workflows.organization_id IN (
          SELECT organization_id FROM profiles WHERE id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users can manage their automation schedules"
  ON automation_schedules FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM automation_workflows 
      WHERE automation_workflows.id = automation_schedules.workflow_id
      AND automation_workflows.created_by = auth.uid()
    )
  );

-- Create RLS policies for automation_analytics
CREATE POLICY "Users can view their automation analytics"
  ON automation_analytics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM automation_workflows 
      WHERE automation_workflows.id = automation_analytics.workflow_id
      AND (
        automation_workflows.created_by = auth.uid()
        OR automation_workflows.organization_id IN (
          SELECT organization_id FROM profiles WHERE id = auth.uid()
        )
      )
    )
  );

-- =============================================
-- PART 12: Final Setup & Documentation
-- =============================================

-- Create function to list all scheduled cron jobs
CREATE OR REPLACE FUNCTION list_automation_cron_jobs()
RETURNS TABLE (
  job_id BIGINT,
  job_name TEXT,
  schedule TEXT,
  command TEXT,
  is_active BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    j.jobid as job_id,
    j.jobname as job_name,
    j.schedule,
    j.command,
    j.active as is_active
  FROM cron.job j
  WHERE j.jobname LIKE '%automation%'
     OR j.jobname LIKE '%invoice%'
     OR j.jobname LIKE '%maintenance%'
  ORDER BY j.jobname;
END;
$$ LANGUAGE plpgsql;

-- Create a view for easy monitoring
CREATE OR REPLACE VIEW automation_cron_status AS
SELECT 
  j.jobname as job_name,
  j.schedule,
  j.active as is_active,
  MAX(jrd.start_time) as last_run,
  COUNT(jrd.jobid) as total_runs,
  SUM(CASE WHEN jrd.status = 'succeeded' THEN 1 ELSE 0 END) as successful_runs,
  SUM(CASE WHEN jrd.status = 'failed' THEN 1 ELSE 0 END) as failed_runs
FROM cron.job j
LEFT JOIN cron.job_run_details jrd ON j.jobid = jrd.jobid
WHERE j.jobname LIKE '%automation%'
   OR j.jobname LIKE '%invoice%'
   OR j.jobname LIKE '%maintenance%'
GROUP BY j.jobid, j.jobname, j.schedule, j.active;

-- Grant necessary permissions
GRANT SELECT ON automation_cron_status TO authenticated;
GRANT EXECUTE ON FUNCTION list_automation_cron_jobs() TO authenticated;
GRANT EXECUTE ON FUNCTION get_cron_job_stats() TO authenticated;

-- =============================================
-- DEPLOYMENT NOTES
-- =============================================
-- 1. This migration sets up pg_cron integration for Fixlify automation system
-- 2. pg_cron is pre-enabled in Supabase, no additional setup needed
-- 3. Scheduled jobs will run automatically once deployed
-- 4. Monitor job execution via automation_cron_status view
-- 5. Check cron.job_run_details for detailed execution history
-- 
-- To verify deployment:
-- SELECT * FROM list_automation_cron_jobs();
-- SELECT * FROM automation_cron_status;
-- 
-- Created: August 6, 2025
-- Version: 1.0
-- =============================================
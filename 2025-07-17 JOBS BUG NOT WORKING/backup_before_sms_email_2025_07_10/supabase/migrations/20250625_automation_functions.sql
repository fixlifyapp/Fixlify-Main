-- Database functions for automation system

-- Function to increment workflow metrics
CREATE OR REPLACE FUNCTION increment_workflow_metrics(
  workflow_id UUID,
  execution_increment INTEGER DEFAULT 1,
  success_increment INTEGER DEFAULT 0
)
RETURNS void AS $$
BEGIN
  UPDATE automation_workflows
  SET 
    execution_count = COALESCE(execution_count, 0) + execution_increment,
    success_count = COALESCE(success_count, 0) + success_increment,
    last_executed_at = NOW(),
    updated_at = NOW()
  WHERE id = workflow_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get active automations by trigger type
CREATE OR REPLACE FUNCTION get_active_automations_by_trigger(
  trigger_type_param VARCHAR(50),
  org_id UUID
)
RETURNS TABLE(
  id UUID,
  name VARCHAR(255),
  trigger_type VARCHAR(50),
  trigger_conditions JSONB,
  action_type VARCHAR(50),
  action_config JSONB,
  conditions JSONB,
  delivery_window JSONB,
  multi_channel_config JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    w.id,
    w.name,
    w.trigger_type,
    w.trigger_conditions,
    w.action_type,
    w.action_config,
    w.conditions,
    w.delivery_window,
    w.multi_channel_config
  FROM automation_workflows w
  WHERE w.trigger_type = trigger_type_param
    AND w.organization_id = org_id
    AND w.status = 'active';
END;
$$ LANGUAGE plpgsql;

-- Function to check if automation should run based on delivery window
CREATE OR REPLACE FUNCTION should_automation_run_now(
  delivery_window JSONB
)
RETURNS BOOLEAN AS $$
DECLARE
  business_hours_only BOOLEAN;
  allowed_days TEXT[];
  time_range JSONB;
  current_day VARCHAR(3);
  current_time TIME;
  start_time TIME;
  end_time TIME;
BEGIN
  -- Parse delivery window
  business_hours_only := COALESCE((delivery_window->>'businessHoursOnly')::BOOLEAN, false);
  allowed_days := ARRAY(SELECT jsonb_array_elements_text(delivery_window->'allowedDays'));
  time_range := delivery_window->'timeRange';
  
  -- Get current day and time
  current_day := CASE EXTRACT(DOW FROM NOW())
    WHEN 0 THEN 'sun'
    WHEN 1 THEN 'mon'
    WHEN 2 THEN 'tue'
    WHEN 3 THEN 'wed'
    WHEN 4 THEN 'thu'
    WHEN 5 THEN 'fri'
    WHEN 6 THEN 'sat'
  END;
  
  current_time := NOW()::TIME;
  
  -- Check if current day is allowed
  IF NOT (current_day = ANY(allowed_days)) THEN
    RETURN FALSE;
  END IF;
  
  -- Check business hours if required
  IF business_hours_only AND time_range IS NOT NULL THEN
    start_time := (time_range->>'start')::TIME;
    end_time := (time_range->>'end')::TIME;
    
    IF current_time < start_time OR current_time > end_time THEN
      RETURN FALSE;
    END IF;
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to trigger automations for events
CREATE OR REPLACE FUNCTION trigger_automations(
  trigger_type_param VARCHAR(50),
  event_data JSONB,
  org_id UUID,
  event_id UUID DEFAULT NULL
)
RETURNS TABLE(
  automation_id UUID,
  automation_name VARCHAR(255),
  should_execute BOOLEAN,
  delay_until TIMESTAMPTZ
) AS $$
DECLARE
  automation RECORD;
  should_run BOOLEAN;
  delay_ms INTEGER;
  delay_until_calc TIMESTAMPTZ;
BEGIN
  -- Get all active automations for this trigger type
  FOR automation IN 
    SELECT * FROM get_active_automations_by_trigger(trigger_type_param, org_id)
  LOOP
    -- Check if automation should run now based on delivery window
    should_run := should_automation_run_now(automation.delivery_window);
    
    -- Calculate delay if action has delay settings
    delay_ms := 0;
    delay_until_calc := NOW();
    
    IF automation.action_config ? 'delay' THEN
      DECLARE
        delay_config JSONB := automation.action_config->'delay';
        delay_type VARCHAR(20) := delay_config->>'type';
        delay_value INTEGER := COALESCE((delay_config->>'value')::INTEGER, 0);
      BEGIN
        CASE delay_type
          WHEN 'minutes' THEN
            delay_until_calc := NOW() + (delay_value || ' minutes')::INTERVAL;
          WHEN 'hours' THEN
            delay_until_calc := NOW() + (delay_value || ' hours')::INTERVAL;
          WHEN 'days' THEN
            delay_until_calc := NOW() + (delay_value || ' days')::INTERVAL;
          ELSE
            delay_until_calc := NOW(); -- immediate
        END CASE;
      END;
    END IF;
    
    -- Return the automation info
    automation_id := automation.id;
    automation_name := automation.name;
    should_execute := should_run;
    delay_until := delay_until_calc;
    
    RETURN NEXT;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to process variable substitution (basic version, AI variables handled in edge function)
CREATE OR REPLACE FUNCTION resolve_basic_variables(
  text_with_variables TEXT,
  context_data JSONB
)
RETURNS TEXT AS $$
DECLARE
  result TEXT := text_with_variables;
  var_name TEXT;
  var_value TEXT;
BEGIN
  -- Simple variable replacement for common variables
  -- AI variables are handled in the edge function
  
  FOR var_name, var_value IN
    SELECT key, value::TEXT
    FROM jsonb_each_text(context_data)
  LOOP
    result := REPLACE(result, '{{' || var_name || '}}', var_value);
  END LOOP;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Trigger function for job status changes
CREATE OR REPLACE FUNCTION handle_job_automation_triggers()
RETURNS TRIGGER AS $$
DECLARE
  trigger_type_val VARCHAR(50);
  context_data JSONB;
  automation RECORD;
BEGIN
  -- Determine trigger type based on what changed
  IF TG_OP = 'INSERT' THEN
    trigger_type_val := 'job_created';
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.status != NEW.status THEN
      IF NEW.status = 'completed' THEN
        trigger_type_val := 'job_completed';
      ELSIF NEW.status = 'scheduled' THEN
        trigger_type_val := 'job_scheduled';
      ELSE
        trigger_type_val := 'job_status_changed';
      END IF;
    ELSE
      RETURN NEW; -- No status change, skip
    END IF;
  ELSE
    RETURN NEW;
  END IF;

  -- Build context data from job and related records
  SELECT jsonb_build_object(
    'job_id', NEW.id,
    'job_title', NEW.title,
    'job_type', NEW.job_type,
    'job_status', NEW.status,
    'job_priority', NEW.priority,
    'scheduled_date', TO_CHAR(NEW.scheduled_date, 'Month DD, YYYY'),
    'scheduled_time', TO_CHAR(NEW.scheduled_date, 'HH12:MI AM'),
    'total_amount', '$' || COALESCE(NEW.total_amount, 0)::TEXT,
    'client_name', c.name,
    'client_first_name', SPLIT_PART(c.name, ' ', 1),
    'client_phone', c.phone,
    'client_email', c.email,
    'client_address', c.address,
    'technician_name', t.name,
    'technician_phone', t.phone,
    'company_name', org.name,
    'company_phone', org.phone,
    'company_email', org.email,
    'booking_link', COALESCE(org.booking_url, 'https://your-booking-link.com')
  )
  INTO context_data
  FROM clients c
  LEFT JOIN team_members t ON t.id = NEW.assigned_to
  LEFT JOIN organizations org ON org.id = NEW.organization_id
  WHERE c.id = NEW.client_id;

  -- Call edge function to execute automations
  PERFORM
    net.http_post(
      url := current_setting('app.supabase_url') || '/functions/v1/automation-executor',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.supabase_service_role_key')
      ),
      body := jsonb_build_object(
        'type', 'trigger_event',
        'trigger_type', trigger_type_val,
        'event_id', NEW.id,
        'organization_id', NEW.organization_id,
        'context_data', context_data
      )
    );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger function for estimate events
CREATE OR REPLACE FUNCTION handle_estimate_automation_triggers()
RETURNS TRIGGER AS $$
DECLARE
  trigger_type_val VARCHAR(50);
  context_data JSONB;
BEGIN
  IF TG_OP = 'INSERT' THEN
    trigger_type_val := 'estimate_sent';
  ELSIF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
    IF NEW.status = 'approved' THEN
      trigger_type_val := 'estimate_approved';
    ELSE
      RETURN NEW;
    END IF;
  ELSE
    RETURN NEW;
  END IF;

  -- Build context data
  SELECT jsonb_build_object(
    'estimate_id', NEW.id,
    'estimate_number', NEW.estimate_number,
    'total_amount', '$' || NEW.total_amount::TEXT,
    'client_name', c.name,
    'client_first_name', SPLIT_PART(c.name, ' ', 1),
    'client_phone', c.phone,
    'client_email', c.email,
    'client_address', c.address,
    'company_name', org.name,
    'company_phone', org.phone,
    'company_email', org.email,
    'booking_link', COALESCE(org.booking_url, 'https://your-booking-link.com')
  )
  INTO context_data
  FROM clients c
  LEFT JOIN organizations org ON org.id = NEW.organization_id
  WHERE c.id = NEW.client_id;

  -- Trigger automations
  PERFORM
    net.http_post(
      url := current_setting('app.supabase_url') || '/functions/v1/automation-executor',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.supabase_service_role_key')
      ),
      body := jsonb_build_object(
        'type', 'trigger_event',
        'trigger_type', trigger_type_val,
        'event_id', NEW.id,
        'organization_id', NEW.organization_id,
        'context_data', context_data
      )
    );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger function for invoice events
CREATE OR REPLACE FUNCTION handle_invoice_automation_triggers()
RETURNS TRIGGER AS $$
DECLARE
  trigger_type_val VARCHAR(50);
  context_data JSONB;
  days_overdue INTEGER;
BEGIN
  IF TG_OP = 'INSERT' THEN
    trigger_type_val := 'invoice_created';
  ELSIF TG_OP = 'UPDATE' THEN
    -- Check if invoice became overdue
    IF NEW.due_date < CURRENT_DATE AND (OLD.due_date >= CURRENT_DATE OR OLD.due_date IS NULL) THEN
      trigger_type_val := 'invoice_overdue';
      days_overdue := CURRENT_DATE - NEW.due_date;
    ELSIF OLD.status != NEW.status AND NEW.status = 'paid' THEN
      trigger_type_val := 'payment_received';
    ELSE
      RETURN NEW;
    END IF;
  ELSE
    RETURN NEW;
  END IF;

  -- Build context data
  SELECT jsonb_build_object(
    'invoice_id', NEW.id,
    'invoice_number', NEW.invoice_number,
    'total_amount', '$' || NEW.total_amount::TEXT,
    'overdue_amount', '$' || NEW.total_amount::TEXT,
    'days_overdue', COALESCE(days_overdue, 0),
    'due_date', TO_CHAR(NEW.due_date, 'Month DD, YYYY'),
    'client_name', c.name,
    'client_first_name', SPLIT_PART(c.name, ' ', 1),
    'client_phone', c.phone,
    'client_email', c.email,
    'client_address', c.address,
    'company_name', org.name,
    'company_phone', org.phone,
    'company_email', org.email,
    'payment_link', COALESCE(org.payment_url, 'https://your-payment-link.com')
  )
  INTO context_data
  FROM clients c
  LEFT JOIN organizations org ON org.id = NEW.organization_id
  WHERE c.id = NEW.client_id;

  -- Trigger automations
  PERFORM
    net.http_post(
      url := current_setting('app.supabase_url') || '/functions/v1/automation-executor',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.supabase_service_role_key')
      ),
      body := jsonb_build_object(
        'type', 'trigger_event',
        'trigger_type', trigger_type_val,
        'event_id', NEW.id,
        'organization_id', NEW.organization_id,
        'context_data', context_data
      )
    );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the actual triggers on tables
-- Jobs table triggers
DROP TRIGGER IF EXISTS job_automation_trigger ON jobs;
CREATE TRIGGER job_automation_trigger
  AFTER INSERT OR UPDATE ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION handle_job_automation_triggers();

-- Estimates table triggers (if estimates table exists)
-- DROP TRIGGER IF EXISTS estimate_automation_trigger ON estimates;
-- CREATE TRIGGER estimate_automation_trigger
--   AFTER INSERT OR UPDATE ON estimates
--   FOR EACH ROW
--   EXECUTE FUNCTION handle_estimate_automation_triggers();

-- Invoices table triggers (if invoices table exists)
-- DROP TRIGGER IF EXISTS invoice_automation_trigger ON invoices;
-- CREATE TRIGGER invoice_automation_trigger
--   AFTER INSERT OR UPDATE ON invoices
--   FOR EACH ROW
--   EXECUTE FUNCTION handle_invoice_automation_triggers();

-- Function to manually trigger automations (for testing)
CREATE OR REPLACE FUNCTION test_automation_trigger(
  trigger_type_param VARCHAR(50),
  org_id UUID,
  test_context JSONB DEFAULT '{"client_name": "Test Customer", "job_title": "Test Job"}'::JSONB
)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  -- Call edge function to execute automations
  SELECT content::JSONB INTO result
  FROM net.http_post(
    url := current_setting('app.supabase_url') || '/functions/v1/automation-executor',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.supabase_service_role_key')
    ),
    body := jsonb_build_object(
      'type', 'trigger_event',
      'trigger_type', trigger_type_param,
      'event_id', gen_random_uuid(),
      'organization_id', org_id,
      'context_data', test_context
    )
  );
  
  RETURN COALESCE(result, '{"error": "No response from automation executor"}'::JSONB);
END;
$$ LANGUAGE plpgsql;

-- Function to get automation analytics
CREATE OR REPLACE FUNCTION get_automation_analytics(org_id UUID, days_back INTEGER DEFAULT 30)
RETURNS JSONB AS $$
DECLARE
  analytics JSONB;
BEGIN
  WITH automation_stats AS (
    SELECT 
      COUNT(*) as total_rules,
      COUNT(*) FILTER (WHERE status = 'active') as active_rules,
      COALESCE(SUM(execution_count), 0) as total_executions,
      COALESCE(SUM(success_count), 0) as total_successes
    FROM automation_workflows 
    WHERE organization_id = org_id
  ),
  message_stats AS (
    SELECT 
      COUNT(*) as total_messages,
      COUNT(*) FILTER (WHERE replied_at IS NOT NULL) as total_responses,
      COALESCE(SUM(cost), 0) as total_cost
    FROM automation_messages 
    WHERE organization_id = org_id 
      AND sent_at >= NOW() - (days_back || ' days')::INTERVAL
  ),
  recent_executions AS (
    SELECT COUNT(*) as recent_executions
    FROM automation_executions 
    WHERE organization_id = org_id 
      AND executed_at >= NOW() - (days_back || ' days')::INTERVAL
  )
  SELECT jsonb_build_object(
    'totalRules', s.total_rules,
    'activeRules', s.active_rules,
    'totalExecutions', s.total_executions,
    'successRate', CASE 
      WHEN s.total_executions > 0 THEN (s.total_successes::FLOAT / s.total_executions * 100)::NUMERIC(5,2)
      ELSE 0 
    END,
    'messagesSent', m.total_messages,
    'responsesReceived', m.total_responses,
    'responseRate', CASE 
      WHEN m.total_messages > 0 THEN (m.total_responses::FLOAT / m.total_messages * 100)::NUMERIC(5,2)
      ELSE 0 
    END,
    'revenueGenerated', (m.total_cost * 100)::NUMERIC(10,2), -- Estimate based on cost savings
    'recentExecutions', r.recent_executions,
    'daysAnalyzed', days_back
  ) INTO analytics
  FROM automation_stats s
  CROSS JOIN message_stats m
  CROSS JOIN recent_executions r;
  
  RETURN analytics;
END;
$$ LANGUAGE plpgsql;

-- Enable HTTP extension if not already enabled
CREATE EXTENSION IF NOT EXISTS http;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION increment_workflow_metrics TO authenticated;
GRANT EXECUTE ON FUNCTION get_active_automations_by_trigger TO authenticated;
GRANT EXECUTE ON FUNCTION should_automation_run_now TO authenticated;
GRANT EXECUTE ON FUNCTION trigger_automations TO authenticated;
GRANT EXECUTE ON FUNCTION resolve_basic_variables TO authenticated;
GRANT EXECUTE ON FUNCTION test_automation_trigger TO authenticated;
GRANT EXECUTE ON FUNCTION get_automation_analytics TO authenticated;

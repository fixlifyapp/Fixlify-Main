# pg_cron Integration for Fixlify Automation System

## Overview
pg_cron is a PostgreSQL extension that runs scheduled jobs directly in the database, perfect for Fixlify's automation needs.

## Benefits of pg_cron for Fixlify

### 1. **Native Database Scheduling**
- Runs directly in Supabase/PostgreSQL
- No external scheduler needed
- Automatic retry on failures
- Built-in job history tracking

### 2. **Perfect for Automation Triggers**
- Time-based workflow triggers
- Periodic data cleanup
- Scheduled reports generation
- Automated status updates
- Invoice reminders
- Maintenance notifications

### 3. **Performance Advantages**
- Minimal latency (runs in database)
- No API calls for scheduled tasks
- Efficient resource usage
- Scales with database
## Implementation Plan

### Phase 1: Enable pg_cron in Supabase

1. **Enable Extension** (Already done by Supabase)
   ```sql
   -- pg_cron is pre-installed in Supabase
   -- Just need to configure jobs
   ```

2. **Create Cron Jobs Table**
   ```sql
   -- View existing jobs
   SELECT * FROM cron.job;
   
   -- View job run history
   SELECT * FROM cron.job_run_details 
   ORDER BY start_time DESC 
   LIMIT 100;
   ```

### Phase 2: Core Automation Jobs

#### 1. **Workflow Trigger Scanner** (Every minute)
Checks for workflows that need to be triggered based on conditions```sql
-- Create function to check and trigger automations
CREATE OR REPLACE FUNCTION check_automation_triggers()
RETURNS void AS $$
DECLARE
  workflow RECORD;
  should_trigger BOOLEAN;
BEGIN
  -- Check time-based triggers
  FOR workflow IN 
    SELECT * FROM automation_workflows 
    WHERE status = 'active' 
    AND trigger_type = 'scheduled'
  LOOP
    -- Check if it's time to run this workflow
    should_trigger := check_schedule_condition(workflow);
    
    IF should_trigger THEN
      -- Create execution log
      INSERT INTO automation_execution_logs (
        workflow_id,
        status,
        started_at
      ) VALUES (
        workflow.id,
        'pending',
        NOW()
      );
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

-- Schedule to run every minute
SELECT cron.schedule(
  'check-automation-triggers',
  '* * * * *', -- Every minute
  'SELECT check_automation_triggers();'
);
```

#### 2. **Invoice Overdue Checker** (Daily at 9 AM)
```sql
CREATE OR REPLACE FUNCTION check_overdue_invoices()
RETURNS void AS $$
BEGIN
  -- Mark invoices as overdue
  UPDATE invoices 
  SET status = 'overdue'  WHERE due_date < CURRENT_DATE 
  AND status = 'sent'
  AND payment_status != 'paid';
  
  -- Trigger overdue workflows
  INSERT INTO automation_execution_logs (workflow_id, trigger_data, status)
  SELECT 
    aw.id,
    jsonb_build_object('invoice_id', i.id, 'days_overdue', CURRENT_DATE - i.due_date),
    'pending'
  FROM invoices i
  JOIN automation_workflows aw ON aw.trigger_type = 'invoice_overdue'
  WHERE i.status = 'overdue'
  AND i.updated_at >= NOW() - INTERVAL '1 minute'
  AND aw.status = 'active';
END;
$$ LANGUAGE plpgsql;

-- Schedule daily at 9 AM
SELECT cron.schedule(
  'check-overdue-invoices',
  '0 9 * * *', -- 9 AM every day
  'SELECT check_overdue_invoices();'
);
```
#### 3. **Maintenance Reminder Scanner** (Daily at 8 AM)
```sql
CREATE OR REPLACE FUNCTION send_maintenance_reminders()
RETURNS void AS $$
BEGIN
  -- Find jobs due for maintenance
  INSERT INTO automation_execution_logs (workflow_id, trigger_data, status)
  SELECT 
    aw.id,
    jsonb_build_object(
      'job_id', j.id,
      'client_id', j.client_id,
      'last_service_date', j.completed_at,
      'months_since', EXTRACT(MONTH FROM AGE(NOW(), j.completed_at))
    ),
    'pending'
  FROM jobs j
  JOIN automation_workflows aw ON aw.trigger_type = 'maintenance_due'
  WHERE j.status = 'completed'
  AND j.job_type IN ('installation', 'maintenance', 'repair')
  AND j.completed_at < NOW() - INTERVAL '6 months'
  AND NOT EXISTS (
    SELECT 1 FROM jobs j2 
    WHERE j2.client_id = j.client_id 
    AND j2.created_at > j.completed_at
  )  AND aw.status = 'active';
END;
$$ LANGUAGE plpgsql;

-- Schedule daily at 8 AM
SELECT cron.schedule(
  'send-maintenance-reminders',
  '0 8 * * *', -- 8 AM every day
  'SELECT send_maintenance_reminders();'
);
```

#### 4. **Workflow Execution Processor** (Every 30 seconds)
```sql
CREATE OR REPLACE FUNCTION process_pending_automations()
RETURNS void AS $$
DECLARE
  execution RECORD;
  current_step RECORD;
  next_step RECORD;
BEGIN
  -- Process pending executions
  FOR execution IN 
    SELECT * FROM automation_execution_logs 
    WHERE status = 'pending'
    ORDER BY created_at
    LIMIT 10
  LOOP
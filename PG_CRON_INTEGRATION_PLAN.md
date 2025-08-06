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
  LOOP    -- Update status to processing
    UPDATE automation_execution_logs 
    SET status = 'processing', started_at = NOW()
    WHERE id = execution.id;
    
    -- Execute workflow steps
    PERFORM execute_workflow_steps(execution.workflow_id, execution.id);
    
    -- Mark as completed
    UPDATE automation_execution_logs 
    SET status = 'completed', completed_at = NOW()
    WHERE id = execution.id;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Schedule every 30 seconds
SELECT cron.schedule(
  'process-automations',
  '*/30 * * * * *', -- Every 30 seconds (if supported)
  'SELECT process_pending_automations();'
);
```

#### 5. **Analytics Aggregator** (Hourly)
```sql
CREATE OR REPLACE FUNCTION update_automation_analytics()
RETURNS void AS $$BEGIN
  -- Update workflow performance metrics
  INSERT INTO automation_analytics (
    workflow_id,
    date,
    execution_count,
    success_rate,
    avg_execution_time,
    revenue_impact
  )
  SELECT 
    workflow_id,
    CURRENT_DATE,
    COUNT(*),
    AVG(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) * 100,
    AVG(EXTRACT(EPOCH FROM (completed_at - started_at))),
    SUM(COALESCE((metadata->>'revenue_generated')::DECIMAL, 0))
  FROM automation_execution_logs
  WHERE DATE(created_at) = CURRENT_DATE
  GROUP BY workflow_id
  ON CONFLICT (workflow_id, date) 
  DO UPDATE SET
    execution_count = EXCLUDED.execution_count,
    success_rate = EXCLUDED.success_rate,
    avg_execution_time = EXCLUDED.avg_execution_time,
    revenue_impact = EXCLUDED.revenue_impact;
END;
$$ LANGUAGE plpgsql;
-- Schedule hourly
SELECT cron.schedule(
  'update-automation-analytics',
  '0 * * * *', -- Every hour
  'SELECT update_automation_analytics();'
);
```

### Phase 3: Advanced Scheduled Workflows

#### Dynamic Scheduling Based on Business Rules
```sql
-- Function to handle complex scheduling logic
CREATE OR REPLACE FUNCTION check_schedule_condition(workflow RECORD)
RETURNS BOOLEAN AS $$
DECLARE
  schedule_config JSONB;
  current_hour INT;
  current_day INT;
  is_business_hours BOOLEAN;
BEGIN
  schedule_config := workflow.trigger_config;
  current_hour := EXTRACT(HOUR FROM NOW());
  current_day := EXTRACT(DOW FROM NOW());
  
  -- Check business hours
  is_business_hours := current_hour BETWEEN 8 AND 18 
                       AND current_day BETWEEN 1 AND 5;  
  -- Check schedule type
  CASE schedule_config->>'frequency'
    WHEN 'daily' THEN
      RETURN current_hour = (schedule_config->>'hour')::INT;
    WHEN 'weekly' THEN
      RETURN current_day = (schedule_config->>'day_of_week')::INT 
             AND current_hour = (schedule_config->>'hour')::INT;
    WHEN 'monthly' THEN
      RETURN EXTRACT(DAY FROM NOW()) = (schedule_config->>'day_of_month')::INT
             AND current_hour = (schedule_config->>'hour')::INT;
    WHEN 'business_hours' THEN
      RETURN is_business_hours;
    ELSE
      RETURN FALSE;
  END CASE;
END;
$$ LANGUAGE plpgsql;
```

### Phase 4: Database Schema for pg_cron Integration

```sql
-- Create automation scheduling tables
CREATE TABLE IF NOT EXISTS automation_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID REFERENCES automation_workflows(id),  cron_expression TEXT NOT NULL,
  cron_job_name TEXT UNIQUE,
  is_active BOOLEAN DEFAULT true,
  last_run TIMESTAMPTZ,
  next_run TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create automation analytics table
CREATE TABLE IF NOT EXISTS automation_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID REFERENCES automation_workflows(id),
  date DATE NOT NULL,
  execution_count INT DEFAULT 0,
  success_rate DECIMAL(5,2),
  avg_execution_time DECIMAL(10,2),
  revenue_impact DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(workflow_id, date)
);

-- Create indexes for performance
CREATE INDEX idx_automation_schedules_active ON automation_schedules(is_active);
CREATE INDEX idx_automation_schedules_next_run ON automation_schedules(next_run);
CREATE INDEX idx_automation_analytics_date ON automation_analytics(date);
```
## Implementation Steps

### Step 1: Deploy Core Functions
```sql
-- Deploy all core functions to Supabase
-- File: supabase/migrations/20250806_pg_cron_automation.sql
```

### Step 2: Schedule Initial Jobs
```sql
-- Schedule the main automation processor
SELECT cron.schedule(
  'automation-processor',
  '* * * * *',
  $$SELECT check_automation_triggers()$$
);

-- Schedule daily jobs
SELECT cron.schedule(
  'daily-invoice-check',
  '0 9 * * *',
  $$SELECT check_overdue_invoices()$$
);

SELECT cron.schedule(
  'daily-maintenance-check',
  '0 8 * * *',
  $$SELECT send_maintenance_reminders()$$
);
-- Schedule hourly analytics
SELECT cron.schedule(
  'hourly-analytics',
  '0 * * * *',
  $$SELECT update_automation_analytics()$$
);
```

### Step 3: Monitor Job Execution
```sql
-- View scheduled jobs
SELECT jobid, schedule, command, nodename, nodeport, database, username, active 
FROM cron.job;

-- View recent job runs
SELECT jobid, job_pid, database, username, command, status, return_message, start_time, end_time
FROM cron.job_run_details 
WHERE start_time > NOW() - INTERVAL '1 day'
ORDER BY start_time DESC;

-- Check job success rate
SELECT 
  jobid,
  COUNT(*) as total_runs,
  SUM(CASE WHEN status = 'succeeded' THEN 1 ELSE 0 END) as successful_runs,
  ROUND(AVG(CASE WHEN status = 'succeeded' THEN 1 ELSE 0 END) * 100, 2) as success_rateFROM cron.job_run_details
WHERE start_time > NOW() - INTERVAL '7 days'
GROUP BY jobid;
```

### Step 4: Create Management Functions
```sql
-- Function to pause/resume automation schedules
CREATE OR REPLACE FUNCTION manage_automation_schedule(
  p_workflow_id UUID,
  p_action TEXT -- 'pause' or 'resume'
)
RETURNS void AS $$
DECLARE
  v_schedule RECORD;
BEGIN
  SELECT * INTO v_schedule 
  FROM automation_schedules 
  WHERE workflow_id = p_workflow_id;
  
  IF p_action = 'pause' THEN
    -- Unschedule the cron job
    SELECT cron.unschedule(v_schedule.cron_job_name);
    UPDATE automation_schedules 
    SET is_active = false, updated_at = NOW()
    WHERE workflow_id = p_workflow_id;
  ELSIF p_action = 'resume' THEN
    -- Reschedule the cron job    SELECT cron.schedule(
      v_schedule.cron_job_name,
      v_schedule.cron_expression,
      format('SELECT trigger_workflow(%L)', p_workflow_id)
    );
    UPDATE automation_schedules 
    SET is_active = true, updated_at = NOW()
    WHERE workflow_id = p_workflow_id;
  END IF;
END;
$$ LANGUAGE plpgsql;
```

## Benefits for Fixlify

### 1. **Reliability**
- Automatic retry on failure
- Database-level scheduling (survives app restarts)
- Built-in monitoring via cron.job_run_details

### 2. **Performance**
- No external API calls for scheduling
- Direct database operations
- Efficient batch processing

### 3. **Scalability**
- Handles thousands of scheduled jobs
- Parallel execution support
- Resource-efficient
### 4. **Cost Efficiency**
- No external scheduler service costs
- Reduced API calls
- Included in Supabase plan

## Use Cases in Fixlify

### Time-Based Automations
- **Daily Reports**: Generate and email daily summaries
- **Invoice Reminders**: Send payment reminders on schedule
- **Maintenance Alerts**: Notify clients about due maintenance
- **Follow-ups**: Automated follow-up sequences

### Data Management
- **Cleanup Old Logs**: Remove logs older than 90 days
- **Archive Completed Jobs**: Move old jobs to archive
- **Update Statistics**: Calculate daily/weekly metrics
- **Sync External Systems**: Regular data synchronization

### Business Process
- **Recurring Jobs**: Create recurring maintenance jobs
- **Seasonal Campaigns**: Launch seasonal promotions
- **Review Requests**: Send review requests after job completion
- **Inventory Checks**: Alert on low stock levels

## Monitoring Dashboard
Create a monitoring dashboard to track pg_cron job performance:

```typescript
// src/components/automation/CronMonitor.tsx
interface CronJobStats {
  jobId: number;
  jobName: string;
  schedule: string;
  lastRun: Date;
  nextRun: Date;
  successRate: number;
  avgDuration: number;
  status: 'active' | 'paused' | 'failed';
}

// API endpoint to fetch cron stats
async function getCronStats(): Promise<CronJobStats[]> {
  const { data } = await supabase.rpc('get_cron_job_stats');
  return data;
}
```

## Security Considerations

### 1. **Access Control**
- Only database owner can create/modify cron jobs
- Use RLS policies for automation tables
- Audit all scheduled job changes
### 2. **Error Handling**
- Implement try-catch in all cron functions
- Log errors to automation_error_logs table
- Set up alerts for failed jobs

### 3. **Resource Management**
- Limit concurrent job execution
- Set timeouts for long-running jobs
- Monitor database load

## Testing Strategy

### 1. **Unit Tests**
```sql
-- Test individual functions
SELECT check_automation_triggers();
SELECT check_overdue_invoices();
SELECT send_maintenance_reminders();
```

### 2. **Integration Tests**
```sql
-- Test complete workflow execution
INSERT INTO automation_workflows (trigger_type, status) 
VALUES ('scheduled', 'active');

-- Wait for cron to pick it up
-- Check automation_execution_logs for results
```
### 3. **Load Testing**
```sql
-- Create multiple test workflows
INSERT INTO automation_workflows (trigger_type, status)
SELECT 'scheduled', 'active'
FROM generate_series(1, 100);

-- Monitor execution performance
SELECT * FROM cron.job_run_details
WHERE start_time > NOW() - INTERVAL '1 hour';
```

## Conclusion

pg_cron provides a robust, database-native scheduling solution perfect for Fixlify's automation needs. It eliminates the need for external schedulers, reduces latency, and provides built-in monitoring and reliability features.

### Next Steps:
1. Deploy the migration file with pg_cron functions
2. Schedule initial automation jobs
3. Create monitoring dashboard
4. Test with production workflows
5. Document for team

---

**Status**: ✅ READY FOR IMPLEMENTATION
**Created**: August 6, 2025
**Version**: 1.0
## Production Automation System - Implementation Plan

# Option 1: Direct Database Trigger Execution (BEST FOR PRODUCTION)

## Overview
Instead of creating a "pending" log that needs processing, the database trigger will directly call the edge function when a job status changes.

## Implementation Steps:

### Step 1: Create HTTP Extension in Supabase
```sql
-- Enable the HTTP extension to make HTTP calls from PostgreSQL
CREATE EXTENSION IF NOT EXISTS http;
CREATE EXTENSION IF NOT EXISTS pg_net;
```

### Step 2: Update the Job Automation Trigger
```sql
CREATE OR REPLACE FUNCTION handle_job_automation_triggers_direct()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  workflow_record RECORD;
  execution_id UUID;
  response_id BIGINT;
BEGIN
  -- For job status changes
  IF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
    -- Find matching workflows
    FOR workflow_record IN 
      SELECT * FROM automation_workflows
      WHERE user_id = NEW.user_id
      AND trigger_type = 'job_status_changed'
      AND is_active = true
      AND status = 'active'
    LOOP
      -- Check if status matches trigger condition
      IF workflow_record.trigger_config->'conditions' @> 
         jsonb_build_array(jsonb_build_object('field', 'status', 'value', NEW.status)) THEN
        
        -- Generate execution ID
        execution_id := gen_random_uuid();
        
        -- Create log entry
        INSERT INTO automation_execution_logs (
          id,
          workflow_id,
          trigger_type,
          status,
          trigger_data
        ) VALUES (
          execution_id,
          workflow_record.id,
          'job_status_changed',
          'processing',
          jsonb_build_object(
            'job_id', NEW.id,
            'new_status', NEW.status,
            'old_status', OLD.status,
            'job', row_to_json(NEW),
            'userId', NEW.user_id
          )
        );
        
        -- Call edge function directly using pg_net
        SELECT net.http_post(
          url := 'https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/automation-executor',
          headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer ' || current_setting('app.service_role_key')
          ),
          body := jsonb_build_object(
            'workflowId', workflow_record.id,
            'executionId', execution_id,
            'context', jsonb_build_object(
              'job_id', NEW.id,
              'jobId', NEW.id,
              'userId', NEW.user_id,
              'triggerType', 'job_status_changed',
              'new_status', NEW.status,
              'old_status', OLD.status
            )
          )
        ) INTO response_id;
        
      END IF;
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$;
```

### Step 3: Store Service Role Key Securely
```sql
-- Store the service role key as a configuration parameter
ALTER DATABASE postgres SET "app.service_role_key" = 'YOUR_SERVICE_ROLE_KEY';
```

### Step 4: Disable Frontend Processor
- Remove AutomationProcessorProvider from AppProviders.tsx
- Delete automation processor service and context files

---

# Option 2: Scheduled Edge Function (ALTERNATIVE)

## Overview
Create an edge function that runs every minute to process pending automations.

## Implementation:

### Step 1: Create Scheduled Processor Function
```typescript
// supabase/functions/automation-scheduler/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

serve(async (req) => {
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  // Get all pending logs
  const { data: pendingLogs } = await supabaseClient
    .from('automation_execution_logs')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })
    .limit(10);

  for (const log of pendingLogs || []) {
    // Call automation executor
    await supabaseClient.functions.invoke('automation-executor', {
      body: {
        workflowId: log.workflow_id,
        executionId: log.id,
        context: log.trigger_data
      }
    });
  }

  return new Response(JSON.stringify({ processed: pendingLogs?.length || 0 }));
});
```

### Step 2: Set Up Cron Job
Use Supabase Dashboard or external service (Uptime Robot, cron-job.org) to call this function every minute.

---

# Option 3: Background Worker Service (MOST ROBUST)

## Overview
Deploy a separate Node.js service that continuously processes automations.

## Implementation:

### Step 1: Create Worker Service
```javascript
// automation-worker/index.js
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function processAutomations() {
  while (true) {
    try {
      // Get pending logs
      const { data: logs } = await supabase
        .from('automation_execution_logs')
        .select('*')
        .eq('status', 'pending')
        .order('created_at')
        .limit(5);

      for (const log of logs || []) {
        await supabase.functions.invoke('automation-executor', {
          body: {
            workflowId: log.workflow_id,
            executionId: log.id,
            context: log.trigger_data
          }
        });
      }
      
      // Wait 10 seconds before next check
      await new Promise(resolve => setTimeout(resolve, 10000));
    } catch (error) {
      console.error('Error:', error);
      await new Promise(resolve => setTimeout(resolve, 30000));
    }
  }
}

processAutomations();
```

### Step 2: Deploy to Cloud
- Deploy to Railway, Render, or Heroku
- Set environment variables
- Ensure auto-restart on crash

---

# Preventing Duplicate Sends

## Add Idempotency Check
```sql
-- Add unique constraint to prevent duplicate sends
ALTER TABLE communication_logs 
ADD COLUMN idempotency_key TEXT;

CREATE UNIQUE INDEX idx_communication_idempotency 
ON communication_logs(idempotency_key) 
WHERE idempotency_key IS NOT NULL;

-- In edge function, generate idempotency key
const idempotencyKey = `${jobId}-${status}-${workflowId}-${new Date().toISOString().split('T')[0]}`;
```

## Add Rate Limiting
```sql
-- Check if similar automation was executed recently
CREATE OR REPLACE FUNCTION check_automation_rate_limit(
  p_job_id TEXT,
  p_workflow_id UUID,
  p_status TEXT
) RETURNS BOOLEAN AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 FROM automation_execution_logs
    WHERE trigger_data->>'job_id' = p_job_id
    AND workflow_id = p_workflow_id
    AND trigger_data->>'new_status' = p_status
    AND created_at > NOW() - INTERVAL '1 hour'
    AND status = 'completed'
  );
END;
$$ LANGUAGE plpgsql;
```

---

# Recommended Production Setup

1. **Use Option 1** (Direct Database Trigger) for immediate execution
2. **Add idempotency keys** to prevent duplicates
3. **Implement rate limiting** to prevent spam
4. **Add monitoring** with alerts for failures
5. **Set up error retry logic** with exponential backoff
6. **Create admin dashboard** to view automation logs

---

# Quick Implementation (Option 1)

For immediate production readiness, implement the pg_net extension approach:

1. Enable pg_net in Supabase Dashboard
2. Update the trigger function
3. Remove frontend processor
4. Test thoroughly
5. Monitor for 24 hours

This will make automations work 24/7 without any browser or external service dependency!

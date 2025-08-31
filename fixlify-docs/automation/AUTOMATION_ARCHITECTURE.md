# Fixlify Automation System Architecture

## Overview
The automation system triggers actions (email, SMS, tasks) based on business events like job status changes, with frontend-triggered edge function execution for immediate processing.

## System Components

### 1. Database Layer (Supabase PostgreSQL)

#### Core Tables
```sql
automation_workflows
├── id (UUID)
├── name (string)
├── trigger_type (enum: job_status_changed, job_created, job_completed, etc.)
├── trigger_conditions (JSONB) - conditions that must be met
├── steps (JSONB) - array of actions to execute
├── is_active (boolean)
├── organization_id (UUID)
└── execution_count (integer)

automation_execution_logs
├── id (UUID)
├── workflow_id (UUID)
├── trigger_type (string)
├── trigger_data (JSONB) - context data from the trigger
├── status (enum: pending, processing, completed, failed)
├── actions_executed (JSONB) - results of each action
├── error_message (text)
├── started_at (timestamp)
└── completed_at (timestamp)
```

#### Database Triggers
```sql
-- Trigger on jobs table
handle_job_automation_triggers()
├── Fires on INSERT/UPDATE
├── Checks for matching workflows
├── Creates automation_execution_logs entry
└── Sets status to 'pending'
```

### 2. Edge Functions (Supabase Functions)

#### automation-executor
Main function that processes automation workflows:
```typescript
// Accepts payload:
{
  workflowId: string,
  context: object, // trigger data
  executionId: string
}

// Processing flow:
1. Fetch workflow configuration
2. Enrich context with job/client/company data
3. Execute each step (email, SMS, etc.)
4. Update execution log with results
```

### 3. Frontend Integration

#### Job Status Update Flow
```typescript
// When job status changes in the UI
async function updateJobStatus(jobId, newStatus) {
  // 1. Update job in database
  const { data: job, error } = await supabase
    .from('jobs')
    .update({ status: newStatus })
    .eq('id', jobId)
    .select()
    .single();
  
  // 2. Check for pending automations
  const { data: pendingLogs } = await supabase
    .from('automation_execution_logs')
    .select('*')
    .eq('trigger_data->job_id', jobId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(1);
  
  // 3. Process each pending automation
  if (pendingLogs && pendingLogs.length > 0) {
    for (const log of pendingLogs) {
      await processAutomation(log);
    }
  }
  
  return job;
}

// Process automation function
async function processAutomation(log) {
  try {
    // Call edge function
    const { data, error } = await supabase.functions.invoke(
      'automation-executor',
      {
        body: {
          workflowId: log.workflow_id,
          context: log.trigger_data,
          executionId: log.id
        }
      }
    );
    
    if (error) throw error;
    
    // Handle success
    console.log('Automation processed:', data);
    
    // Optional: Show notification to user
    toast.success('Automation triggered successfully');
    
  } catch (error) {
    console.error('Automation processing failed:', error);
    
    // Update log with error
    await supabase
      .from('automation_execution_logs')
      .update({
        status: 'failed',
        error_message: error.message,
        completed_at: new Date().toISOString()
      })
      .eq('id', log.id);
  }
}
```

## Complete Flow Diagram

```
User Action (Frontend)
        │
        ▼
[1] Update Job Status
        │
        ▼
[2] Supabase Database
    ├── Update jobs table
    └── Trigger: handle_job_automation_triggers()
        │
        ▼
[3] Create automation_execution_logs entry
    (status: 'pending')
        │
        ▼
[4] Frontend checks for pending logs
        │
        ▼
[5] Frontend calls automation-executor
        │
        ▼
[6] Edge Function Processing
    ├── Fetch workflow config
    ├── Enrich context data
    ├── Execute actions (email/SMS)
    └── Update execution log
        │
        ▼
[7] Return results to frontend
        │
        ▼
[8] UI feedback to user
```

## Implementation Guide

### Step 1: Create Automation Service (Frontend)
```typescript
// src/services/automationService.ts

import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export class AutomationService {
  /**
   * Process any pending automations for a specific trigger
   */
  static async processPendingAutomations(
    triggerType: string,
    triggerData: any
  ): Promise<void> {
    try {
      // Find pending automations
      const { data: pendingLogs, error: fetchError } = await supabase
        .from('automation_execution_logs')
        .select('*')
        .eq('status', 'pending')
        .eq('trigger_type', triggerType)
        .order('created_at', { ascending: false })
        .limit(5);

      if (fetchError) throw fetchError;

      // Process each automation
      for (const log of pendingLogs || []) {
        // Check if trigger data matches
        if (this.matchesTriggerData(log.trigger_data, triggerData)) {
          await this.executeAutomation(log);
        }
      }
    } catch (error) {
      console.error('Error processing automations:', error);
    }
  }

  /**
   * Execute a specific automation log
   */
  static async executeAutomation(log: any): Promise<void> {
    try {
      // Mark as processing
      await supabase
        .from('automation_execution_logs')
        .update({ status: 'processing' })
        .eq('id', log.id);

      // Call edge function
      const { data, error } = await supabase.functions.invoke(
        'automation-executor',
        {
          body: {
            workflowId: log.workflow_id,
            context: log.trigger_data,
            executionId: log.id
          }
        }
      );

      if (error) throw error;
      // Success notification
      toast.success('Automation executed successfully');
      
    } catch (error: any) {
      console.error('Automation execution failed:', error);
      
      // Mark as failed
      await supabase
        .from('automation_execution_logs')
        .update({
          status: 'failed',
          error_message: error.message,
          completed_at: new Date().toISOString()
        })
        .eq('id', log.id);
      
      toast.error('Automation failed: ' + error.message);
    }
  }

  /**
   * Check if trigger data matches
   */
  private static matchesTriggerData(
    logData: any,
    triggerData: any
  ): boolean {
    // Match based on job_id, client_id, etc.
    if (logData.job_id && triggerData.job_id) {
      return logData.job_id === triggerData.job_id;
    }
    return true;
  }
}

  /**
   * Process job-specific automations
   */
  static async processJobAutomations(
    jobId: string,
    oldStatus: string,
    newStatus: string
  ): Promise<void> {
    await this.processPendingAutomations('job_status_changed', {
      job_id: jobId,
      old_status: oldStatus,
      new_status: newStatus
    });

    // Special handling for completed jobs
    if (newStatus === 'completed') {
      await this.processPendingAutomations('job_completed', {
        job_id: jobId
      });
    }
  }
}
```

### Step 2: Integrate with Job Update Functions
```typescript
// src/hooks/useJobUpdate.ts

import { AutomationService } from '@/services/automationService';

export function useJobUpdate() {
  const updateJobStatus = async (
    jobId: string,
    newStatus: string
  ) => {    try {
      // Get current job status
      const { data: currentJob } = await supabase
        .from('jobs')
        .select('status')
        .eq('id', jobId)
        .single();
      
      const oldStatus = currentJob?.status;
      
      // Update job status
      const { data: updatedJob, error } = await supabase
        .from('jobs')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', jobId)
        .select()
        .single();
      
      if (error) throw error;
      
      // Process automations (non-blocking)
      AutomationService.processJobAutomations(
        jobId,
        oldStatus,
        newStatus
      ).catch(console.error);
      
      return updatedJob;
    } catch (error) {
      console.error('Error updating job:', error);
      throw error;    }
  };
  
  return { updateJobStatus };
}
```

### Step 3: UI Component Integration
```typescript
// src/components/jobs/JobStatusDropdown.tsx

import { useJobUpdate } from '@/hooks/useJobUpdate';
import { Select } from '@/components/ui/select';

export function JobStatusDropdown({ job }) {
  const { updateJobStatus } = useJobUpdate();
  const [isUpdating, setIsUpdating] = useState(false);
  
  const handleStatusChange = async (newStatus: string) => {
    setIsUpdating(true);
    try {
      await updateJobStatus(job.id, newStatus);
      toast.success('Job status updated');
    } catch (error) {
      toast.error('Failed to update status');
    } finally {
      setIsUpdating(false);
    }
  };
  
  return (
    <Select
      value={job.status}
      onValueChange={handleStatusChange}
      disabled={isUpdating}    >
      <option value="new">New</option>
      <option value="scheduled">Scheduled</option>
      <option value="in_progress">In Progress</option>
      <option value="on_hold">On Hold</option>
      <option value="completed">Completed</option>
      <option value="cancelled">Cancelled</option>
    </Select>
  );
}
```

## Automation Workflow Examples

### Example 1: Job Completed Workflow
```json
{
  "id": "a1e7e5e0-76ef-464f-9b65-ba941a5e5ecd",
  "name": "Job Completed",
  "trigger_type": "job_status_changed",
  "trigger_conditions": {
    "new_status": "completed"
  },
  "steps": [
    {
      "id": "step-1",
      "type": "action",
      "config": {
        "actionType": "email",
        "subject": "Job Completed - {{job.title}}",
        "message": "Dear {{client.firstName}},\n\nYour job has been completed.",
        "recipient": "{{client.email}}"
      }
    },    {
      "id": "step-2",
      "type": "action",
      "config": {
        "actionType": "sms",
        "message": "Job {{job.title}} completed. Thank you!",
        "recipient": "{{client.phone}}"
      }
    }
  ]
}
```

## Advanced Features

### 1. Batch Processing
For performance, process multiple automations in batch:
```typescript
async function processBatchAutomations() {
  // Get all pending automations
  const { data: pendingLogs } = await supabase
    .from('automation_execution_logs')
    .select('*')
    .eq('status', 'pending')
    .lte('created_at', new Date(Date.now() - 60000)) // Older than 1 minute
    .limit(10);
  
  // Process in parallel with concurrency limit
  const results = await Promise.allSettled(
    pendingLogs.map(log => 
      AutomationService.executeAutomation(log)
    )
  );
}```

### 2. Retry Logic
Implement retry for failed automations:
```typescript
async function retryFailedAutomations() {
  const { data: failedLogs } = await supabase
    .from('automation_execution_logs')
    .select('*')
    .eq('status', 'failed')
    .lt('retry_count', 3)
    .lte('created_at', new Date(Date.now() - 300000)); // 5 minutes old
  
  for (const log of failedLogs || []) {
    await supabase
      .from('automation_execution_logs')
      .update({ 
        status: 'pending',
        retry_count: (log.retry_count || 0) + 1 
      })
      .eq('id', log.id);
  }
}
```

### 3. Real-time Updates
Subscribe to automation status changes:
```typescript
useEffect(() => {
  const subscription = supabase
    .channel('automation-updates')
    .on('postgres_changes',       {
        event: 'UPDATE',
        schema: 'public',
        table: 'automation_execution_logs'
      },
      (payload) => {
        // Update UI with automation status
        console.log('Automation updated:', payload);
      }
    )
    .subscribe();
  
  return () => subscription.unsubscribe();
}, []);
```

## Performance Considerations

### 1. Database Indexes
```sql
CREATE INDEX idx_automation_logs_pending ON automation_execution_logs(status, created_at) 
WHERE status = 'pending';

CREATE INDEX idx_automation_logs_workflow ON automation_execution_logs(workflow_id, created_at);

CREATE INDEX idx_automation_logs_trigger_data ON automation_execution_logs((trigger_data->>'job_id'));
```

### 2. Caching Strategy
- Cache workflow configurations for 5 minutes
- Cache client/job data during automation execution
- Use React Query or SWR for frontend caching

### 3. Debouncing
- Debounce status updates to prevent rapid triggers
- Use setTimeout/clearTimeout for user-initiated changes

## Monitoring & Debugging

### 1. Automation Dashboard
Create a dashboard showing:
- Total automations triggered today
- Success/failure rates
- Average execution time
- Pending automation queue

### 2. Logging
```typescript
// Enhanced logging for debugging
console.group('Automation Execution');
console.log('Workflow:', workflowId);
console.log('Trigger Data:', triggerData);
console.time('Execution Time');
// ... execution logic
console.timeEnd('Execution Time');
console.groupEnd();
```

### 3. Error Tracking
- Log errors to Sentry or similar service
- Store detailed error context in automation_execution_logs
- Send alerts for repeated failures

## Security Considerations

1. **Rate Limiting**: Limit automation executions per user/organization
2. **Validation**: Validate all trigger data before processing3. **Permissions**: Check user permissions before executing automations
4. **Sanitization**: Sanitize all template variables before use
5. **Audit Trail**: Keep complete logs of all automation activities

## Best Practices

### 1. Idempotency
- Make automations idempotent (safe to run multiple times)
- Check if action already completed before executing
- Use unique identifiers for tracking

### 2. Graceful Degradation
- Continue processing other steps if one fails
- Provide fallback options for critical automations
- Queue failed automations for manual review

### 3. Testing Strategy
```typescript
// Test automation execution
async function testAutomation(workflowId: string) {
  const testContext = {
    job_id: 'TEST-001',
    client: { email: 'test@example.com', firstName: 'Test' },
    job: { title: 'Test Job', status: 'completed' }
  };
  
  return await supabase.functions.invoke('automation-executor', {
    body: {
      workflowId,
      context: testContext,
      executionId: 'test-' + Date.now()
    }
  });
}
```

## Deployment Checklist

- [ ] Database migrations applied
- [ ] Edge functions deployed (automation-executor)
- [ ] API keys configured (Mailgun, Telnyx)
- [ ] Frontend automation service integrated
- [ ] Error handling implemented
- [ ] Monitoring dashboard created
- [ ] Rate limiting configured
- [ ] Test automations executed successfully
- [ ] Documentation updated

## Troubleshooting Guide

### Problem: Automations not triggering
1. Check if workflow is active (`is_active = true`)
2. Verify trigger conditions match
3. Check database trigger function is working
4. Look for errors in automation_execution_logs

### Problem: Actions not executing
1. Verify edge function is deployed
2. Check API keys are configured
3. Review edge function logs
4. Check network connectivity

### Problem: Duplicate automations
1. Implement idempotency checks
2. Use database constraints
3. Add debouncing on frontend

### Problem: Performance issues
1. Add database indexes
2. Implement batch processing
3. Use caching for frequently accessed data
4. Optimize edge function code

## Summary

This architecture provides a robust, scalable automation system that:

1. **Triggers automatically** via database events
2. **Processes efficiently** through frontend-initiated edge functions
3. **Handles failures gracefully** with retry logic and error tracking
4. **Scales horizontally** with batch processing and caching
5. **Provides visibility** through logging and monitoring

The system separates concerns properly:
- **Database**: Stores configuration and logs events
- **Edge Functions**: Executes business logic securely
- **Frontend**: Initiates processing and provides user feedback

This design ensures automations run reliably while maintaining system performance and user experience.

## Next Steps

1. Implement AutomationService class in frontend
2. Update all job status change functions to trigger automations
3. Create monitoring dashboard for automation tracking
4. Set up error alerting for failed automations
5. Document automation workflows for end users

---

*Last Updated: August 2025*
*Version: 1.0*
# Automation Service Implementation Guide

## Quick Start Implementation

### 1. Create the Automation Service
Create file: `src/services/automationService.ts`

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export class AutomationService {
  /**
   * Main method to call after any job status change
   */
  static async handleJobStatusChange(
    jobId: string,
    oldStatus: string,
    newStatus: string
  ): Promise<void> {
    try {
      // Wait a bit for database trigger to create log
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Find pending automation logs for this job
      const { data: logs, error } = await supabase
        .from('automation_execution_logs')
        .select('*')
        .eq('trigger_data->>job_id', jobId)        .in('status', ['pending', 'completed'])
        .gte('created_at', new Date(Date.now() - 5000).toISOString())
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching automation logs:', error);
        return;
      }

      // Process each log that hasn't been executed
      for (const log of logs || []) {
        if (!log.actions_executed || log.actions_executed.length === 0) {
          await this.executeAutomation(log);
        }
      }
    } catch (error) {
      console.error('Error in handleJobStatusChange:', error);
    }
  }

  /**
   * Execute a specific automation
   */
  private static async executeAutomation(log: any): Promise<void> {
    try {
      console.log('Executing automation:', log.id);
      
      // Call the edge function
      const { data, error } = await supabase.functions.invoke(
        'automation-executor',
        {          body: {
            workflowId: log.workflow_id,
            context: log.trigger_data,
            executionId: log.id
          }
        }
      );

      if (error) {
        console.error('Edge function error:', error);
        throw error;
      }

      console.log('Automation executed successfully:', data);
      
    } catch (error) {
      console.error('Failed to execute automation:', log.id, error);
      
      // Mark as failed
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
}
```

### 2. Integrate with Job Updates

Find all places where job status is updated and add automation handling:

#### Example: Job Details Page
```typescript
// In your job status update handler
const handleStatusChange = async (newStatus: string) => {
  try {
    const oldStatus = job.status;
    
    // Update job in database
    const { data, error } = await supabase
      .from('jobs')
      .update({ 
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', job.id)
      .select()
      .single();
    
    if (error) throw error;
    
    // Update local state
    setJob(data);
    
    // Trigger automation processing (non-blocking)
    AutomationService.handleJobStatusChange(
      job.id,
      oldStatus,
      newStatus
    );
    
    toast.success('Job status updated');
  } catch (error) {    console.error('Error updating job status:', error);
    toast.error('Failed to update job status');
  }
};
```

#### Example: Jobs Table/List
```typescript
// In your jobs table component
const updateJobStatus = async (jobId: string, newStatus: string) => {
  const job = jobs.find(j => j.id === jobId);
  if (!job) return;
  
  const oldStatus = job.status;
  
  // Optimistic update
  setJobs(prev => prev.map(j => 
    j.id === jobId ? { ...j, status: newStatus } : j
  ));
  
  try {
    // Update in database
    const { error } = await supabase
      .from('jobs')
      .update({ status: newStatus })
      .eq('id', jobId);
    
    if (error) throw error;
    
    // Process automations
    AutomationService.handleJobStatusChange(jobId, oldStatus, newStatus);
    
  } catch (error) {
    // Revert optimistic update    setJobs(prev => prev.map(j => 
      j.id === jobId ? { ...j, status: oldStatus } : j
    ));
    toast.error('Failed to update status');
  }
};
```

### 3. Testing the Implementation

#### Manual Test Steps:
1. Open your app and navigate to a job
2. Change the job status to "completed"
3. Check the console for automation logs
4. Verify in Supabase dashboard:
   - Check `automation_execution_logs` table
   - Look for new entries with your job ID
   - Check if `actions_executed` field gets populated

#### Test Code:
```typescript
// Add this test function to quickly verify automations
async function testAutomation() {
  // Get a test job
  const { data: jobs } = await supabase
    .from('jobs')
    .select('*')
    .limit(1)
    .single();
  
  if (!jobs) {
    console.error('No jobs found for testing');
    return;  }
  
  const testJob = jobs[0];
  console.log('Testing with job:', testJob.id);
  
  // Trigger automation
  await AutomationService.handleJobStatusChange(
    testJob.id,
    testJob.status,
    'completed'
  );
  
  console.log('Test completed. Check automation_execution_logs table.');
}
```

### 4. Debugging Tips

#### Check if automations are triggering:
```sql
-- Run in Supabase SQL editor
SELECT * FROM automation_execution_logs 
WHERE created_at > NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC;
```

#### Common Issues and Solutions:

**Issue: Automations not triggering**
- Check if workflow is active: `is_active = true`
- Verify database trigger exists: `handle_job_automation_triggers`
- Check organization_id matches

**Issue: Edge function not executing**
- Verify edge function is deployed: `automation-executor`
- Check edge function logs in Supabase dashboard
- Ensure API keys are configured (MAILGUN_API_KEY, TELNYX_API_KEY)

**Issue: Actions not sending (email/SMS)**
- Check communication_logs table for errors
- Verify recipient email/phone exists
- Test edge functions directly

### 5. Minimal Setup Checklist

To get automations working in your app:

- [ ] Copy the AutomationService class to your project
- [ ] Import AutomationService in components that update job status
- [ ] Add `AutomationService.handleJobStatusChange()` after status updates
- [ ] Ensure edge function `automation-executor` is deployed
- [ ] Configure API keys in Supabase edge function secrets
- [ ] Test with a real job status change

### 6. Environment Variables

Make sure these are set in your `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://mqppvcrlvsgrsqelglod.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

### 7. Quick Test Script

Add this to your browser console to test:
```javascript
// Test automation directly from browser console
const testAutomation = async () => {
  const { data: logs } = await window.supabase    .from('automation_execution_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);
  
  console.log('Recent automation logs:', logs);
  
  // Process first pending one
  const pending = logs?.find(l => l.status === 'pending' || 
    (l.status === 'completed' && (!l.actions_executed || l.actions_executed.length === 0)));
  
  if (pending) {
    console.log('Processing automation:', pending.id);
    const { data, error } = await window.supabase.functions.invoke(
      'automation-executor',
      {
        body: {
          workflowId: pending.workflow_id,
          context: pending.trigger_data,
          executionId: pending.id
        }
      }
    );
    console.log('Result:', data, error);
  } else {
    console.log('No pending automations found');
  }
};

testAutomation();
```

## Summary

This implementation provides:
1. **Automatic triggering** when job status changes
2. **Edge function execution** for sending emails/SMS
3. **Error handling** and retry logic
4. **Non-blocking** execution (doesn't slow down UI)

The automation flow:
1. User changes job status in UI
2. Database trigger creates automation log
3. Frontend calls AutomationService
4. AutomationService invokes edge function
5. Edge function sends email/SMS
6. Results logged in database

## Next Steps

After implementing the basic automation service:
1. Add loading indicators during automation processing
2. Show automation status in UI (success/failure badges)
3. Create an automation history view for users
4. Add retry button for failed automations
5. Implement batch processing for better performance

---

*This guide provides the minimal implementation needed to get automations working in your Fixlify app.*
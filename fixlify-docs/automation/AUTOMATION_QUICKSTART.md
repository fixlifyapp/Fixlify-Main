# Automation System - Quick Start Guide

## ✅ What's Been Implemented

### Backend (Supabase)
- ✅ Database triggers that create automation logs when job status changes
- ✅ `automation_workflows` table with "Job Completed" workflow
- ✅ `automation_execution_logs` table to track all automations
- ✅ Edge function `automation-executor` that sends emails/SMS

### Frontend Integration
- ✅ `AutomationService` with `processJobStatusChange()` method
- ✅ Updated `useJobStatusUpdate` hook to call automation service
- ✅ Updated `ChangeStatusDialog` for bulk status updates
- ✅ New `useJobUpdate` hook for easy integration

## 🚀 How It Works

1. **User changes job status** in the UI
2. **Database trigger** creates an automation log entry
3. **Frontend service** detects the log and calls the edge function
4. **Edge function** processes the workflow and sends email/SMS
5. **Results** are logged back to the database

## 📝 Usage Examples

### Method 1: Using the JobDetailsContext (Already Integrated)
```typescript
// This is already integrated in JobDetailsHeader.tsx
const { updateJobStatus } = useJobDetails();

// Just call updateJobStatus - automation happens automatically!
await updateJobStatus('completed');
```

### Method 2: Using the new useJobUpdate hook
```typescript
import { useJobUpdate } from '@/hooks/useJobUpdate';

function MyComponent() {
  const { updateJobStatus, isUpdating } = useJobUpdate({
    onSuccess: (job) => console.log('Job updated:', job),
    onError: (error) => console.error('Error:', error)
  });
  
  const handleStatusChange = async () => {
    await updateJobStatus('job-id-123', 'completed');
    // Automation triggers automatically!
  };
  
  return (
    <button onClick={handleStatusChange} disabled={isUpdating}>
      Complete Job
    </button>
  );
}
```

### Method 3: Direct Supabase update with automation
```typescript
import { AutomationService } from '@/services/automationService';

// Get current status
const { data: job } = await supabase
  .from('jobs')
  .select('status')
  .eq('id', jobId)
  .single();

const oldStatus = job.status;

// Update job
await supabase
  .from('jobs')
  .update({ status: 'completed' })
  .eq('id', jobId);

// Process automations
await AutomationService.processJobStatusChange(jobId, oldStatus, 'completed');
```

## 🧪 Testing the System

### Browser Console Test
1. Open your app in the browser
2. Open Developer Console (F12)
3. Load the test script:
```javascript
const script = document.createElement('script');
script.src = '/test-automation.js';
document.head.appendChild(script);
```

4. Run tests:
```javascript
// Full system test
testAutomationSystem();

// Trigger automation for specific job
triggerTestAutomation('J-2019');
```

### Manual Test Steps
1. Go to Jobs page
2. Select a job
3. Change status to "Completed"
4. Check console for automation logs
5. Check Supabase dashboard:
   - `automation_execution_logs` table should have new entry
   - `actions_executed` field should show email/SMS sent

## 🔍 Debugging

### Check if automations are triggering:
```sql
-- Run in Supabase SQL editor
SELECT * FROM automation_execution_logs 
WHERE created_at > NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC;
```

### Check edge function logs:
1. Go to Supabase Dashboard
2. Navigate to Functions
3. Select `automation-executor`
4. View Logs tab

### Common Issues:

**Automations not triggering:**
- Check if workflow is active in `automation_workflows` table
- Verify job has associated client with email/phone
- Check organization_id matches

**Edge function not executing:**
- Verify edge function is deployed
- Check API keys are configured:
  - MAILGUN_API_KEY
  - TELNYX_API_KEY
  - SUPABASE_SERVICE_ROLE_KEY

**Actions not sending:**
- Check `communication_logs` table for errors
- Verify client has valid email/phone
- Check edge function logs for errors

## 📊 Monitoring

### View automation metrics:
```javascript
// In browser console
const { data } = await supabase
  .from('automation_workflows')
  .select('*');
  
data.forEach(w => {
  console.log(`${w.name}: ${w.execution_count} executions, ${w.success_count} successful`);
});
```

### View recent executions:
```javascript
const { data: logs } = await supabase
  .from('automation_execution_logs')
  .select('*')
  .order('created_at', { ascending: false })
  .limit(10);

console.table(logs);
```

## 🎯 Next Steps

1. **Add more automation triggers:**
   - Job created
   - Job scheduled
   - Invoice sent
   - Payment received

2. **Add more action types:**
   - Create tasks
   - Send notifications
   - Update client records
   - Generate reports

3. **Add UI for automation management:**
   - View automation history
   - Enable/disable workflows
   - Create custom workflows
   - View execution logs

4. **Add retry mechanism:**
   - Retry failed automations
   - Exponential backoff
   - Dead letter queue

## 🔧 Configuration

### Required Environment Variables:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Edge Function Secrets (set in Supabase dashboard)
MAILGUN_API_KEY=your_mailgun_key
MAILGUN_DOMAIN=your_domain
TELNYX_API_KEY=your_telnyx_key
```

## 📚 Files Modified

- `/src/services/automationService.ts` - Added processJobStatusChange()
- `/src/components/jobs/context/useJobStatusUpdate.ts` - Integrated automation
- `/src/components/jobs/dialogs/ChangeStatusDialog.tsx` - Added automation for bulk updates
- `/src/hooks/useJobUpdate.ts` - New hook for job updates with automation
- `/public/test-automation.js` - Test utilities

---

**The automation system is now fully integrated and ready to use!** 

Every job status change will automatically trigger the appropriate automation workflow.
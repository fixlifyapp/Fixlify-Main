# Automation System Test Guide

## 🔍 Testing Job Status Change Automation

### 1. **Start the Automation Engine**
- Go to **AI Automation Center** page
- Look for the **Automation Engine Status** card at the top
- Click **"Start Engine"** button
- You should see:
  - Status change from "Stopped" to "Running"
  - Green pulsing indicator
  - Count of pending automations (if any)

### 2. **Create a Test Job Status Change**
1. Go to **Jobs** page
2. Click on any job (e.g., J-2019)
3. Click the status dropdown
4. Change status to **"Completed"**

### 3. **What Should Happen**
When you change a job to "Completed" status:

1. **Database Trigger** creates an automation log entry
2. **Automation Engine** (if running) processes the log
3. **Email & SMS** are sent based on the workflow configuration

### 4. **Verify Automation Execution**
Check the automation logs in the database:

```sql
-- Check recent automation logs
SELECT 
  id,
  workflow_id,
  trigger_type,
  status,
  started_at,
  completed_at,
  error_message
FROM automation_execution_logs
WHERE trigger_type = 'job_status_changed'
ORDER BY started_at DESC
LIMIT 5;
```

### 5. **Check Communication Logs**
If automation executed successfully, check if emails/SMS were sent:

```sql
-- Check communication logs
SELECT 
  type,
  direction,
  status,
  created_at,
  metadata
FROM communication_logs
WHERE metadata->>'automationGenerated' = 'true'
ORDER BY created_at DESC
LIMIT 5;
```

## 🚨 Common Issues & Solutions

### Issue: "Failed to start automation engine"
**Cause**: The automation processor service might not be imported properly
**Solution**: Refresh the page and try again

### Issue: Automations not processing
**Cause**: Engine is stopped
**Solution**: Make sure to start the engine from AI Automation Center

### Issue: No email/SMS sent
**Possible Causes**:
1. Mailgun/Telnyx not configured
2. Edge functions not deployed
3. Workflow configuration issues

## 📊 Automation Workflow Details

The "Job completed" workflow should:
1. Trigger when job status changes to "Completed"
2. Send email notification to client
3. Send SMS notification to client
4. Use client data from the job for personalization

## 🔧 Manual Testing

To manually trigger an automation:
1. Start the automation engine
2. Change any job status to "Completed"
3. Wait 5-10 seconds for processing
4. Check automation logs and communication logs
# Fixlify Automation System - Complete Documentation

## 📋 Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Workflow Builder](#workflow-builder)
4. [Automation Templates](#automation-templates)
5. [Triggers & Actions](#triggers--actions)
6. [Execution Engine](#execution-engine)
7. [API Reference](#api-reference)
8. [Troubleshooting](#troubleshooting)

## 🎯 Overview

The Fixlify Automation System enables users to create powerful, business-specific workflows that automate repetitive tasks, improve efficiency, and ensure consistent operations.

### Key Features
- **Visual Workflow Builder** - Drag-and-drop interface
- **Pre-built Templates** - Industry-specific automation templates
- **Real-time Execution** - Instant trigger processing
- **Conditional Logic** - If/then branching
- **External Integrations** - Connect to third-party services
- **Audit Trail** - Complete execution history

### Use Cases
- Automatically send follow-up emails after job completion
- Create invoices when jobs are marked complete
- Notify team members of new assignments
- Update client status based on activity
- Schedule recurring maintenance reminders
- Generate reports on specific triggers

## 🏗️ Architecture

### System Components

```
┌─────────────────────┐     ┌─────────────────────┐
│   Workflow Builder  │────▶│  Automation Engine  │
└─────────────────────┘     └─────────────────────┘
         │                           │
         ▼                           ▼
┌─────────────────────┐     ┌─────────────────────┐
│ Automation Database │     │  Execution Service  │
└─────────────────────┘     └─────────────────────┘
         │                           │
         ▼                           ▼
┌─────────────────────┐     ┌─────────────────────┐
│  Template Library   │     │   Trigger Monitor   │
└─────────────────────┘     └─────────────────────┘
```

### Database Schema

#### automations
```sql
- id: UUID (Primary Key)
- name: Text
- description: Text
- trigger_type: Enum
- trigger_config: JSONB
- actions: JSONB[]
- is_active: Boolean
- organization_id: UUID
- created_by: UUID
- created_at: Timestamp
- updated_at: Timestamp
```

#### automation_executions
```sql
- id: UUID (Primary Key)
- automation_id: UUID
- trigger_data: JSONB
- status: Enum (pending, running, completed, failed)
- started_at: Timestamp
- completed_at: Timestamp
- error: Text
- organization_id: UUID
```

#### automation_templates
```sql
- id: UUID (Primary Key)
- name: Text
- description: Text
- category: Text
- trigger_type: Enum
- trigger_config: JSONB
- actions: JSONB[]
- is_public: Boolean
- created_by: UUID
```
## 🔧 Workflow Builder

### Visual Interface
The workflow builder provides an intuitive drag-and-drop interface for creating automations.

#### Components
1. **Trigger Panel** - Select what starts the automation
2. **Action Panel** - Choose actions to perform
3. **Canvas** - Visual representation of workflow
4. **Properties Panel** - Configure selected elements
5. **Test Panel** - Test automation with sample data

### Creating a Workflow

#### Step 1: Choose a Trigger
```javascript
// Available trigger types
{
  "job_created": "When a new job is created",
  "job_status_changed": "When job status changes",
  "job_completed": "When a job is completed",
  "client_created": "When a new client is added",
  "invoice_created": "When an invoice is created",
  "invoice_paid": "When an invoice is paid",
  "estimate_accepted": "When an estimate is accepted",
  "schedule_based": "On a schedule",
  "webhook": "When webhook is received",
  "manual": "Triggered manually"
}
```

#### Step 2: Configure Trigger
Each trigger type has specific configuration options:

```javascript
// Example: Job Status Changed
{
  "from_status": ["scheduled", "in_progress"],
  "to_status": ["completed"],
  "job_type": ["repair", "maintenance"],
  "client_tags": ["vip", "commercial"]
}
```

#### Step 3: Add Actions
Actions are executed sequentially when triggered:

```javascript
// Example: Send Email Action
{
  "type": "send_email",
  "config": {
    "to": "{{client.email}}",
    "template": "job_completed",
    "variables": {
      "client_name": "{{client.name}}",
      "job_id": "{{job.id}}",
      "completion_date": "{{job.completed_at}}"
    }
  }
}
```

### Conditional Logic
Add branching logic to workflows:

```javascript
{
  "type": "condition",
  "config": {
    "if": {
      "field": "job.total_amount",
      "operator": "greater_than",
      "value": 1000
    },
    "then": [
      // Actions for high-value jobs
    ],
    "else": [
      // Actions for regular jobs
    ]
  }
}
```
## 📚 Automation Templates

### Pre-built Templates
Fixlify includes industry-specific templates for common workflows:

#### Service Business Templates
1. **New Client Welcome Series**
   - Send welcome email
   - Create initial service reminder
   - Add to CRM sequence

2. **Job Completion Workflow**
   - Update job status
   - Generate invoice
   - Send completion email
   - Request review

3. **Payment Follow-up**
   - Send payment reminder
   - Escalate overdue invoices
   - Update client status

4. **Maintenance Reminders**
   - Schedule recurring jobs
   - Send reminder notifications
   - Create follow-up tasks

#### Using Templates
```javascript
// Load template
const template = await getAutomationTemplate('job_completion_workflow');

// Customize template
const customized = {
  ...template,
  name: "My Job Completion Process",
  actions: template.actions.map(action => {
    if (action.type === 'send_email') {
      return {
        ...action,
        config: {
          ...action.config,
          template: 'my_custom_template'
        }
      };
    }
    return action;
  })
};

// Save as new automation
await createAutomation(customized);
```

## 🎯 Triggers & Actions

### Available Triggers

#### Entity Triggers
- **Job Triggers**
  - job_created
  - job_updated
  - job_status_changed
  - job_assigned
  - job_completed
  - job_cancelled

- **Client Triggers**
  - client_created
  - client_updated
  - client_tagged
  - client_status_changed

- **Financial Triggers**
  - invoice_created
  - invoice_sent
  - invoice_paid
  - invoice_overdue
  - estimate_created
  - estimate_accepted
  - estimate_rejected

- **Team Triggers**
  - team_member_added
  - team_member_updated
  - team_member_assigned

#### Time-based Triggers
- **Schedule Triggers**
  - daily_at
  - weekly_on
  - monthly_on
  - cron_expression

#### External Triggers
- **Webhook**
  - custom_webhook
  - third_party_integration
### Available Actions

#### Communication Actions
1. **send_email**
   ```javascript
   {
     type: "send_email",
     config: {
       to: "{{recipient_email}}",
       template: "template_name",
       variables: {},
       attachments: []
     }
   }
   ```

2. **send_sms**
   ```javascript
   {
     type: "send_sms",
     config: {
       to: "{{phone_number}}",
       message: "Your message here",
       from: "{{sender_number}}"
     }
   }
   ```

3. **send_notification**
   ```javascript
   {
     type: "send_notification",
     config: {
       user_id: "{{user_id}}",
       title: "Notification Title",
       message: "Notification body",
       type: "info"
     }
   }
   ```

#### Data Actions
1. **create_record**
   ```javascript
   {
     type: "create_record",
     config: {
       table: "jobs",
       data: {
         client_id: "{{client.id}}",
         type: "maintenance",
         scheduled_date: "{{date}}"
       }
     }
   }
   ```

2. **update_record**
   ```javascript
   {
     type: "update_record",
     config: {
       table: "clients",
       id: "{{client.id}}",
       data: {
         status: "active",
         last_contact: "{{now}}"
       }
     }
   }
   ```

3. **create_task**
   ```javascript
   {
     type: "create_task",
     config: {
       title: "Follow up with {{client.name}}",
       assigned_to: "{{team_member.id}}",
       due_date: "{{date_plus_days(3)}}"
     }
   }
   ```
#### Integration Actions
1. **webhook**
   ```javascript
   {
     type: "webhook",
     config: {
       url: "https://api.example.com/webhook",
       method: "POST",
       headers: {
         "Authorization": "Bearer {{api_key}}"
       },
       body: {
         event: "job_completed",
         data: "{{job}}"
       }
     }
   }
   ```

2. **ai_analysis**
   ```javascript
   {
     type: "ai_analysis",
     config: {
       prompt: "Analyze this job and suggest improvements",
       context: "{{job}}",
       save_to: "job_insights"
     }
   }
   ```

## ⚙️ Execution Engine

### How It Works
1. **Trigger Detection** - Monitor for trigger events
2. **Condition Evaluation** - Check if conditions are met
3. **Action Execution** - Run actions in sequence
4. **Error Handling** - Retry failed actions
5. **Logging** - Record execution details

### Execution Flow
```javascript
// Simplified execution flow
async function executeAutomation(automation, triggerData) {
  const execution = await createExecution({
    automation_id: automation.id,
    trigger_data: triggerData,
    status: 'running'
  });

  try {
    // Evaluate conditions
    if (!evaluateConditions(automation.conditions, triggerData)) {
      return updateExecution(execution.id, { status: 'skipped' });
    }

    // Execute actions
    for (const action of automation.actions) {
      await executeAction(action, {
        ...triggerData,
        previous_results: execution.results
      });
    }

    return updateExecution(execution.id, { 
      status: 'completed',
      completed_at: new Date()
    });
  } catch (error) {
    return updateExecution(execution.id, { 
      status: 'failed',
      error: error.message
    });
  }
}
```

### Variable System
Use variables to pass data between triggers and actions:

```javascript
// Available variables
{{job}}           // Current job data
{{client}}        // Related client data
{{user}}          // Triggering user
{{organization}}  // Organization data
{{now}}           // Current timestamp
{{date}}          // Current date

// Functions
{{date_plus_days(n)}}     // Add days to current date
{{format_currency(n)}}    // Format as currency
{{format_date(date)}}     // Format date
```
### Safeguards & Limits

#### Execution Limits
- **Max executions per automation**: 100/hour
- **Max actions per automation**: 20
- **Max execution time**: 5 minutes
- **Max retries**: 3

#### Loop Prevention
```javascript
// Automation execution tracking
const tracker = new AutomationExecutionTracker({
  maxExecutionsPerEntity: 5,
  timeWindowMinutes: 60,
  debugMode: true
});

// Check before execution
if (!tracker.canExecute(entityId, entityType)) {
  console.log('Execution limit reached');
  return;
}
```

## 📡 API Reference

### REST API Endpoints

#### Automations
```http
GET    /api/automations          # List automations
POST   /api/automations          # Create automation
GET    /api/automations/:id      # Get automation
PUT    /api/automations/:id      # Update automation
DELETE /api/automations/:id      # Delete automation
POST   /api/automations/:id/test # Test automation
```

#### Templates
```http
GET    /api/automation-templates           # List templates
GET    /api/automation-templates/:id       # Get template
POST   /api/automation-templates/:id/use   # Create from template
```

#### Executions
```http
GET    /api/automation-executions          # List executions
GET    /api/automation-executions/:id      # Get execution details
POST   /api/automation-executions/:id/retry # Retry failed execution
```

### JavaScript SDK

```javascript
import { AutomationClient } from '@/lib/automation-client';

const client = new AutomationClient();

// Create automation
const automation = await client.createAutomation({
  name: 'Welcome New Clients',
  trigger_type: 'client_created',
  actions: [
    {
      type: 'send_email',
      config: {
        template: 'welcome_email',
        to: '{{client.email}}'
      }
    }
  ]
});

// List automations
const automations = await client.listAutomations({
  is_active: true,
  trigger_type: 'job_completed'
});

// Execute manually
await client.executeAutomation(automationId, {
  job_id: '123',
  client_id: '456'
});
```
## 🔍 Troubleshooting

### Common Issues

#### 1. Automation Not Triggering
**Symptoms**: Automation doesn't run when expected

**Solutions**:
- Check if automation is active
- Verify trigger conditions match
- Check organization_id matches
- Review execution logs
- Test with manual trigger

```javascript
// Debug trigger conditions
console.log('Checking trigger conditions:', {
  automation: automation.trigger_config,
  actual: triggerData,
  matches: evaluateConditions(automation.trigger_config, triggerData)
});
```

#### 2. Actions Failing
**Symptoms**: Automation starts but actions fail

**Solutions**:
- Check action configuration
- Verify API keys/credentials
- Test action independently
- Review error logs

```javascript
// Test individual action
await testAction({
  type: 'send_email',
  config: { /* your config */ }
}, sampleData);
```

#### 3. Performance Issues
**Symptoms**: Slow execution or timeouts

**Solutions**:
- Reduce number of actions
- Use batch operations
- Add delays between actions
- Optimize database queries

#### 4. Infinite Loops
**Symptoms**: Same automation runs repeatedly

**Solutions**:
- Add execution limits
- Use safeguards
- Check trigger conditions
- Add cooldown periods

### Debug Mode
Enable debug mode for detailed logging:

```javascript
// In automation config
{
  debug: true,
  log_level: 'verbose'
}

// In execution
await executeAutomation(automation, triggerData, {
  debug: true,
  logCallback: (message) => console.log('[DEBUG]', message)
});
```

### Monitoring & Logs

#### Execution Logs
```sql
-- View recent executions
SELECT 
  ae.id,
  a.name as automation_name,
  ae.status,
  ae.started_at,
  ae.completed_at,
  ae.error
FROM automation_executions ae
JOIN automations a ON ae.automation_id = a.id
WHERE ae.created_at > NOW() - INTERVAL '24 hours'
ORDER BY ae.created_at DESC;
```

#### Performance Metrics
```sql
-- Automation performance
SELECT 
  a.name,
  COUNT(ae.id) as total_executions,
  AVG(EXTRACT(EPOCH FROM (ae.completed_at - ae.started_at))) as avg_duration_seconds,
  SUM(CASE WHEN ae.status = 'completed' THEN 1 ELSE 0 END) as successful,
  SUM(CASE WHEN ae.status = 'failed' THEN 1 ELSE 0 END) as failed
FROM automations a
LEFT JOIN automation_executions ae ON a.id = ae.automation_id
WHERE ae.created_at > NOW() - INTERVAL '7 days'
GROUP BY a.id, a.name;
```

## 📋 Best Practices

### Design Guidelines
1. **Keep it Simple** - Start with basic workflows
2. **Test Thoroughly** - Use test mode before activating
3. **Handle Errors** - Add error handling actions
4. **Document Well** - Use clear names and descriptions
5. **Monitor Performance** - Review execution logs regularly

### Security Considerations
1. **Validate Inputs** - Sanitize all user inputs
2. **Limit Permissions** - Use least privilege principle
3. **Secure Credentials** - Store API keys securely
4. **Audit Trail** - Log all automation activities
5. **Rate Limiting** - Prevent abuse with limits

### Optimization Tips
1. **Batch Operations** - Group similar actions
2. **Async Processing** - Use queues for heavy tasks
3. **Caching** - Cache frequently used data
4. **Selective Triggers** - Use specific conditions
5. **Resource Management** - Clean up old executions

---

*For additional support, consult the specific implementation files in the `/src/services/automation-*` directory or contact the development team.*
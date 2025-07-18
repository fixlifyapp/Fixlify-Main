# 🤖 Fixlify Automation System - Complete Documentation
*Last Updated: January 31, 2025*

## 📋 Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Components](#components)
4. [Workflow Engine](#workflow-engine)
5. [Triggers](#triggers)
6. [Actions](#actions)
7. [Templates](#templates)
8. [Edge Functions](#edge-functions)
9. [Database Schema](#database-schema)
10. [Implementation Guide](#implementation-guide)
11. [Safeguards & Limits](#safeguards--limits)
12. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

The Fixlify Automation System is a sophisticated workflow engine that enables service businesses to automate repetitive tasks, streamline operations, and improve customer communication.

### Key Features
- 🔄 Visual workflow builder with drag-and-drop interface
- ⚡ Real-time trigger execution
- 📧 Multi-channel communication (Email, SMS, Phone)
- 🎯 Pre-built templates for common scenarios
- 🛡️ Built-in safeguards against infinite loops
- 📊 Execution analytics and history

### Use Cases
1. **Customer Onboarding**: Automatically welcome new clients
2. **Job Management**: Update statuses and notify stakeholders
3. **Financial Automation**: Send invoices and payment reminders
4. **Team Coordination**: Assign tasks and track completion
5. **Marketing Campaigns**: Scheduled communications

---

## 🏗️ Architecture

### System Flow
```
Trigger Event → Automation Service → Workflow Processor → Action Executor → Result Logger
```

### Component Architecture
```
Frontend (React)
    ├── Workflow Builder UI
    ├── Template Manager
    └── Execution Monitor
    
Backend (Supabase)
    ├── Database (PostgreSQL)
    ├── Edge Functions (Deno)
    └── Realtime Subscriptions
    
External Services
    ├── Mailgun (Email)
    ├── Telnyx (SMS/Phone)
    └── OpenAI (AI Generation)
```

---

## 🧩 Components

### 1. Workflow Builder (`/src/components/automations/WorkflowBuilder.tsx`)
```typescript
interface WorkflowBuilderProps {
  workflow?: AutomationWorkflow;
  onSave: (workflow: WorkflowConfig) => void;
  templates: AutomationTemplate[];
}
```

**Features**:
- Drag-and-drop interface
- Real-time validation
- Step configuration panels
- Condition builder
- Test mode

### 2. Automation Service (`/src/services/automation-service.ts`)
```typescript
class AutomationService {
  async createWorkflow(config: WorkflowConfig): Promise<Workflow>
  async updateWorkflow(id: string, config: WorkflowConfig): Promise<Workflow>
  async executeWorkflow(workflowId: string, context: ExecutionContext): Promise<ExecutionResult>
  async getExecutionHistory(workflowId: string): Promise<ExecutionRun[]>
}
```

### 3. Trigger Manager (`/src/services/automation-trigger-service.ts`)
```typescript
class AutomationTriggerService {
  async registerTrigger(trigger: TriggerConfig): Promise<void>
  async evaluateTriggers(entity: Entity, event: TriggerEvent): Promise<Workflow[]>
  async executeTriggers(workflows: Workflow[], context: TriggerContext): Promise<void>
}
```

### 4. Action Executor (`/src/services/automation-execution-service.ts`)
```typescript
class AutomationExecutor {
  async executeAction(action: ActionConfig, context: ActionContext): Promise<ActionResult>
  async executeWorkflow(workflow: Workflow, context: ExecutionContext): Promise<ExecutionResult>
  async handleError(error: Error, context: ErrorContext): Promise<void>
}
```

---

## 🔄 Workflow Engine

### Workflow Structure
```typescript
interface AutomationWorkflow {
  id: string;
  name: string;
  description?: string;
  trigger: TriggerConfig;
  steps: ActionStep[];
  conditions?: ConditionConfig[];
  status: 'active' | 'inactive' | 'draft';
  execution_count: number;
  last_executed_at?: Date;
  created_by: string;
  organization_id: string;
}

interface ActionStep {
  id: string;
  type: ActionType;
  config: Record<string, any>;
  conditions?: ConditionConfig[];
  on_error?: 'stop' | 'continue' | 'retry';
}
```

### Execution Flow
1. **Trigger Detection**: System monitors for trigger events
2. **Condition Evaluation**: Checks if workflow should run
3. **Context Building**: Gathers relevant data
4. **Step Execution**: Runs each action in sequence
5. **Error Handling**: Manages failures gracefully
6. **Result Logging**: Records execution details

---

## 🎯 Triggers

### 1. Entity Triggers
```typescript
interface EntityTrigger {
  type: 'entity_created' | 'entity_updated' | 'entity_deleted';
  entity_type: 'job' | 'client' | 'invoice' | 'estimate';
  conditions?: {
    field: string;
    operator: 'equals' | 'contains' | 'greater_than' | 'less_than';
    value: any;
  }[];
}
```

**Examples**:
- Job created with high value (> $1000)
- Client status changed to 'active'
- Invoice marked as 'overdue'

### 2. Time-Based Triggers
```typescript
interface TimeTrigger {
  type: 'schedule' | 'delay' | 'recurring';
  config: {
    schedule?: string; // Cron expression
    delay?: { value: number; unit: 'minutes' | 'hours' | 'days' };
    recurring?: { interval: number; unit: string };
  };
}
```

**Examples**:
- Daily at 9 AM
- 24 hours after job completion
- Every Monday morning

### 3. Event Triggers
```typescript
interface EventTrigger {
  type: 'webhook' | 'form_submission' | 'api_call';
  config: {
    endpoint?: string;
    method?: string;
    headers?: Record<string, string>;
  };
}
```

### 4. Condition-Based Triggers
```typescript
interface ConditionTrigger {
  type: 'field_change' | 'threshold_reached';
  entity_type: string;
  field: string;
  condition: {
    operator: string;
    value: any;
    previous_value?: any;
  };
}
```

---

## 🎬 Actions

### 1. Communication Actions

#### Send Email
```typescript
{
  type: 'send_email',
  config: {
    recipient_email: string | '{{client.email}}',
    subject: string,
    body: string,
    template_id?: string,
    attachments?: string[]
  }
}
```

#### Send SMS
```typescript
{
  type: 'send_sms',
  config: {
    recipient_phone: string | '{{client.phone}}',
    message: string,
    media_url?: string
  }
}
```

### 2. Data Actions

#### Update Entity
```typescript
{
  type: 'update_entity',
  config: {
    entity_type: 'job' | 'client' | 'invoice',
    entity_id: string | '{{entity.id}}',
    updates: Record<string, any>
  }
}
```

#### Create Task
```typescript
{
  type: 'create_task',
  config: {
    title: string,
    description: string,
    assigned_to: string,
    due_date: string,
    priority: 'low' | 'medium' | 'high'
  }
}
```

### 3. Integration Actions

#### Webhook
```typescript
{
  type: 'webhook',
  config: {
    url: string,
    method: 'GET' | 'POST' | 'PUT',
    headers: Record<string, string>,
    body: any
  }
}
```

#### AI Generation
```typescript
{
  type: 'ai_generate',
  config: {
    prompt: string,
    system_context: string,
    temperature: number,
    max_tokens: number
  }
}
```

### 4. Control Flow Actions

#### Delay
```typescript
{
  type: 'delay',
  config: {
    duration: number,
    unit: 'seconds' | 'minutes' | 'hours' | 'days'
  }
}
```

#### Conditional Branch
```typescript
{
  type: 'condition',
  config: {
    if: ConditionConfig,
    then: ActionStep[],
    else?: ActionStep[]
  }
}
```

---

## 📋 Templates

### Pre-built Automation Templates

#### 1. New Client Welcome
```typescript
{
  name: "New Client Welcome",
  trigger: { type: 'entity_created', entity_type: 'client' },
  steps: [
    {
      type: 'send_email',
      config: {
        subject: 'Welcome to {{company.name}}!',
        body: 'Welcome email template...'
      }
    },
    {
      type: 'delay',
      config: { duration: 1, unit: 'days' }
    },
    {
      type: 'send_sms',
      config: {
        message: 'Hi {{client.name}}, thanks for choosing us!'
      }
    }
  ]
}
```

#### 2. Invoice Follow-up
```typescript
{
  name: "Invoice Payment Reminder",
  trigger: { 
    type: 'entity_updated', 
    entity_type: 'invoice',
    conditions: [{ field: 'status', operator: 'equals', value: 'overdue' }]
  },
  steps: [
    {
      type: 'send_email',
      config: {
        subject: 'Payment Reminder: Invoice #{{invoice.number}}',
        body: 'Your invoice is now overdue...'
      }
    },
    {
      type: 'create_task',
      config: {
        title: 'Follow up on overdue invoice',
        assigned_to: '{{job.technician_id}}'
      }
    }
  ]
}
```

#### 3. Job Completion Flow
```typescript
{
  name: "Job Completion Workflow",
  trigger: {
    type: 'entity_updated',
    entity_type: 'job',
    conditions: [{ field: 'status', operator: 'equals', value: 'completed' }]
  },
  steps: [
    {
      type: 'create_invoice',
      config: { auto_send: true }
    },
    {
      type: 'send_sms',
      config: {
        message: 'Job completed! Invoice sent to your email.'
      }
    },
    {
      type: 'delay',
      config: { duration: 3, unit: 'days' }
    },
    {
      type: 'send_email',
      config: {
        subject: 'How was your experience?',
        body: 'Review request template...'
      }
    }
  ]
}
```

---

## 🚀 Edge Functions

### automation-executor
Main edge function that processes workflow executions.

```typescript
// supabase/functions/automation-executor/index.ts
serve(async (req) => {
  const { workflowId, triggeredBy, entityId, context } = await req.json();
  
  // Get workflow
  const workflow = await getWorkflow(workflowId);
  
  // Execute steps
  for (const step of workflow.steps) {
    await executeStep(step, context);
  }
  
  // Log execution
  await logExecution(workflowId, results);
});
```

### Key Functions
- `executeStep()` - Executes individual action
- `evaluateConditions()` - Checks if conditions are met
- `processTemplate()` - Replaces variables in templates
- `handleError()` - Manages execution failures

---

## 📊 Database Schema

### Core Tables

#### automation_workflows
```sql
CREATE TABLE automation_workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  name TEXT NOT NULL,
  description TEXT,
  workflow_config JSONB NOT NULL,
  trigger_config JSONB NOT NULL,
  status TEXT DEFAULT 'active',
  execution_count INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  last_executed_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### automation_runs
```sql
CREATE TABLE automation_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID REFERENCES automation_workflows(id),
  triggered_by TEXT NOT NULL,
  status TEXT NOT NULL,
  context JSONB,
  execution_results JSONB,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  error_message TEXT
);
```

#### automation_templates
```sql
CREATE TABLE automation_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  template_config JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0
);
```

---

## 🛠️ Implementation Guide

### 1. Creating a Workflow
```typescript
// Frontend
const workflow = {
  name: "My Automation",
  trigger: {
    type: 'entity_created',
    entity_type: 'job'
  },
  steps: [
    {
      type: 'send_email',
      config: { /* ... */ }
    }
  ]
};

await automationService.createWorkflow(workflow);
```

### 2. Registering Triggers
```typescript
// Automatically done when workflow is activated
await triggerService.registerTrigger(workflow.trigger);
```

### 3. Handling Trigger Events
```typescript
// In entity service
async function createJob(jobData) {
  const job = await supabase.from('jobs').insert(jobData);
  
  // Trigger automations
  await automationTriggerService.handleEntityEvent({
    type: 'entity_created',
    entity_type: 'job',
    entity: job,
    user_id: currentUser.id
  });
}
```

### 4. Testing Workflows
```typescript
// Test mode execution
await automationService.testWorkflow(workflowId, {
  mockData: { /* ... */ },
  dryRun: true
});
```

---

## 🛡️ Safeguards & Limits

### Execution Limits
```typescript
const SAFEGUARDS = {
  MAX_EXECUTIONS_PER_ENTITY: 5,
  MAX_EXECUTIONS_PER_HOUR: 100,
  MAX_WORKFLOW_STEPS: 20,
  MAX_DELAY_SECONDS: 86400, // 24 hours
  MAX_RETRIES: 3
};
```

### Loop Detection
```typescript
class AutomationExecutionTracker {
  private executionCounts = new Map();
  
  canExecute(entityId: string, workflowId: string): boolean {
    const key = `${entityId}-${workflowId}`;
    const count = this.executionCounts.get(key) || 0;
    return count < SAFEGUARDS.MAX_EXECUTIONS_PER_ENTITY;
  }
}
```

### Error Handling
```typescript
interface ErrorHandling {
  retry_attempts: number;
  retry_delay: number;
  fallback_action?: ActionConfig;
  notification_email?: string;
}
```

---

## 🔍 Troubleshooting

### Common Issues

#### 1. Workflow Not Triggering
**Symptoms**: Automation doesn't run when expected
**Checks**:
- Workflow status is 'active'
- Trigger conditions are met
- No execution limits hit
- Organization context is correct

#### 2. Action Failures
**Symptoms**: Steps fail during execution
**Checks**:
- API keys are configured
- Variable references are valid
- External services are accessible
- Data formats are correct

#### 3. Infinite Loops
**Symptoms**: Same automation runs repeatedly
**Solution**: 
- Check for circular triggers
- Review execution logs
- Enable debug mode
- Use execution limits

### Debug Mode
```typescript
// Enable debug logging
localStorage.setItem('automation_debug', 'true');

// Check execution logs
const logs = await automationService.getDebugLogs(workflowId);
```

### Monitoring
```sql
-- Check recent executions
SELECT * FROM automation_runs
WHERE workflow_id = 'xxx'
ORDER BY started_at DESC
LIMIT 10;

-- Check error patterns
SELECT error_message, COUNT(*)
FROM automation_runs
WHERE status = 'failed'
GROUP BY error_message;
```

---

## 📈 Best Practices

### 1. Workflow Design
- Keep workflows focused and simple
- Use descriptive names and descriptions
- Test thoroughly before activating
- Document complex logic

### 2. Performance
- Limit the number of steps
- Use conditions to prevent unnecessary executions
- Batch similar actions when possible
- Monitor execution times

### 3. Error Handling
- Always define error behavior
- Use fallback actions for critical steps
- Set up monitoring alerts
- Regular review of failed executions

### 4. Security
- Validate all inputs
- Use secure variable references
- Limit webhook access
- Regular audit of active workflows

---

## 🚀 Future Enhancements

### Planned Features
1. **Visual Debugger**: Step-through execution
2. **A/B Testing**: Test workflow variations
3. **Advanced Analytics**: Performance metrics
4. **Custom Actions**: User-defined actions
5. **Workflow Marketplace**: Share templates
6. **AI Optimization**: Suggest improvements

### Integration Roadmap
- Zapier connectivity
- Slack notifications
- Google Workspace
- Microsoft 365
- Custom webhook builder

---

*This document provides comprehensive coverage of the Fixlify Automation System. For specific implementation details, consult the code files and additional documentation.*
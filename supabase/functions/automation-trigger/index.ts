import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

interface TriggerEvent {
  type: 'trigger_event';
  trigger_type: string;
  event_id: string;
  organization_id: string;
  context_data: any;
}

interface AutomationExecution {
  workflowId: string;
  triggerEventId: string;
  triggerData: any;
  organizationId: string;
}

// Check if conditions are met
function evaluateConditions(conditions: any, context: any): boolean {
  if (!conditions || !conditions.rules || conditions.rules.length === 0) {
    return true; // No conditions means always execute
  }

  const { operator, rules } = conditions;
  const results = rules.map((rule: any) => {
    const contextValue = context[rule.field];
    const ruleValue = rule.value;

    switch (rule.operator) {
      case 'equals':
        return String(contextValue) === String(ruleValue);
      case 'not_equals':
        return String(contextValue) !== String(ruleValue);
      case 'contains':
        return String(contextValue).toLowerCase().includes(String(ruleValue).toLowerCase());
      case 'greater_than':
        return Number(contextValue) > Number(ruleValue);
      case 'less_than':
        return Number(contextValue) < Number(ruleValue);
      default:
        return false;
    }
  });

  return operator === 'AND' ? results.every(r => r) : results.some(r => r);
}

// Check if automation should run based on delivery window
function shouldRunNow(deliveryWindow: any): boolean {
  if (!deliveryWindow) return true;

  const now = new Date();
  const currentDay = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][now.getDay()];
  const currentTime = now.toTimeString().slice(0, 5); // HH:MM format

  // Check allowed days
  if (deliveryWindow.allowedDays && !deliveryWindow.allowedDays.includes(currentDay)) {
    return false;
  }

  // Check business hours
  if (deliveryWindow.businessHoursOnly && deliveryWindow.timeRange) {
    const { start, end } = deliveryWindow.timeRange;
    if (currentTime < start || currentTime > end) {
      return false;
    }
  }

  return true;
}

// Calculate delay for automation execution
function calculateDelay(actionConfig: any): number {
  const delay = actionConfig.delay;
  if (!delay || delay.type === 'immediate') {
    return 0;
  }

  const value = delay.value || 1;
  switch (delay.type) {
    case 'minutes':
      return value * 60 * 1000;
    case 'hours':
      return value * 60 * 60 * 1000;
    case 'days':
      return value * 24 * 60 * 60 * 1000;
    default:
      return 0;
  }
}

// Execute automation immediately
async function executeAutomationNow(execution: AutomationExecution): Promise<any> {
  try {
    const response = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/automation-executor`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
      },
      body: JSON.stringify({
        type: 'execute',
        ...execution
      }),
    });

    return await response.json();
  } catch (error) {
    console.error('Error executing automation:', error);
    return { success: false, error: error.message };
  }
}

// Schedule automation for later execution
async function scheduleAutomation(execution: AutomationExecution, delayMs: number, workflow: any): Promise<void> {
  const scheduledFor = new Date(Date.now() + delayMs);

  try {
    // For SMS/Email actions, schedule in the fallback jobs table
    if (workflow.action_type === 'send_sms' || workflow.action_type === 'send_email') {
      const { error } = await supabase
        .from('automation_fallback_jobs')
        .insert({
          automation_id: execution.workflowId,
          organization_id: execution.organizationId,
          contact_id: execution.triggerData.client_id,
          contact_name: execution.triggerData.client_name,
          contact_phone: execution.triggerData.client_phone,
          contact_email: execution.triggerData.client_email,
          channel: workflow.multi_channel_config?.primaryChannel || 'sms',
          message: workflow.action_config.message,
          subject: workflow.action_config.subject,
          variables_used: execution.triggerData,
          scheduled_for: scheduledFor.toISOString(),
          status: 'scheduled'
        });

      if (error) {
        console.error('Error scheduling automation:', error);
      }
    } else {
      // For other actions, we could use a job queue or cron
      // For now, log that it should be scheduled
      console.log(`Automation ${execution.workflowId} should be executed at ${scheduledFor.toISOString()}`);
    }
  } catch (error) {
    console.error('Error scheduling automation:', error);
  }
}

// Process trigger event and execute matching automations
async function processTriggerEvent(event: TriggerEvent): Promise<any> {
  const { trigger_type, event_id, organization_id, context_data } = event;
  
  console.log(`Processing trigger: ${trigger_type} for org ${organization_id}`);

  try {
    // Get all active automations for this trigger type
    const { data: workflows, error } = await supabase
      .from('automation_workflows')
      .select('*')
      .eq('trigger_type', trigger_type)
      .eq('organization_id', organization_id)
      .eq('status', 'active');

    if (error) {
      throw error;
    }

    if (!workflows || workflows.length === 0) {
      console.log(`No active automations found for trigger: ${trigger_type}`);
      return { 
        success: true, 
        message: 'No automations to execute',
        trigger_type,
        workflows_found: 0
      };
    }

    console.log(`Found ${workflows.length} active automations for trigger: ${trigger_type}`);

    const results = [];

    // Process each matching automation
    for (const workflow of workflows) {
      console.log(`Processing automation: ${workflow.name} (${workflow.id})`);

      // Check conditions
      if (!evaluateConditions(workflow.conditions, context_data)) {
        console.log(`Conditions not met for automation: ${workflow.name}`);
        results.push({
          workflowId: workflow.id,
          workflowName: workflow.name,
          executed: false,
          reason: 'Conditions not met'
        });
        continue;
      }

      // Check delivery window
      if (!shouldRunNow(workflow.delivery_window)) {
        console.log(`Outside delivery window for automation: ${workflow.name}`);
        results.push({
          workflowId: workflow.id,
          workflowName: workflow.name,
          executed: false,
          reason: 'Outside delivery window'
        });
        continue;
      }

      const execution: AutomationExecution = {
        workflowId: workflow.id,
        triggerEventId: event_id,
        triggerData: context_data,
        organizationId: organization_id
      };

      // Calculate delay
      const delayMs = calculateDelay(workflow.action_config);

      if (delayMs === 0) {
        // Execute immediately
        console.log(`Executing automation immediately: ${workflow.name}`);
        const result = await executeAutomationNow(execution);
        results.push({
          workflowId: workflow.id,
          workflowName: workflow.name,
          executed: true,
          immediate: true,
          result
        });
      } else {
        // Schedule for later
        console.log(`Scheduling automation for later: ${workflow.name} (delay: ${delayMs}ms)`);
        await scheduleAutomation(execution, delayMs, workflow);
        results.push({
          workflowId: workflow.id,
          workflowName: workflow.name,
          executed: true,
          immediate: false,
          scheduledFor: new Date(Date.now() + delayMs).toISOString(),
          delayMs
        });
      }
    }

    return {
      success: true,
      trigger_type,
      organization_id,
      workflows_found: workflows.length,
      results
    };

  } catch (error) {
    console.error('Error processing trigger event:', error);
    return {
      success: false,
      error: error.message,
      trigger_type,
      organization_id
    };
  }
}

// Process scheduled fallback jobs
async function processScheduledJobs(): Promise<any> {
  try {
    // Get jobs that are due to be executed
    const { data: jobs, error } = await supabase
      .from('automation_fallback_jobs')
      .select('*')
      .eq('status', 'scheduled')
      .lte('scheduled_for', new Date().toISOString())
      .limit(50); // Process in batches

    if (error) {
      throw error;
    }

    if (!jobs || jobs.length === 0) {
      return { success: true, message: 'No scheduled jobs to process', jobs_processed: 0 };
    }

    console.log(`Processing ${jobs.length} scheduled jobs`);

    const results = [];

    for (const job of jobs) {
      try {
        // Mark as processing
        await supabase
          .from('automation_fallback_jobs')
          .update({ status: 'processing' })
          .eq('id', job.id);

        // Execute the automation
        const execution: AutomationExecution = {
          workflowId: job.automation_id,
          triggerEventId: job.id,
          triggerData: {
            ...job.variables_used,
            client_name: job.contact_name,
            client_phone: job.contact_phone,
            client_email: job.contact_email
          },
          organizationId: job.organization_id
        };

        const result = await executeAutomationNow(execution);

        // Update job status
        await supabase
          .from('automation_fallback_jobs')
          .update({
            status: result.success ? 'sent' : 'failed',
            processed_at: new Date().toISOString(),
            error_message: result.error || null
          })
          .eq('id', job.id);

        results.push({
          jobId: job.id,
          automationId: job.automation_id,
          success: result.success,
          error: result.error
        });

      } catch (jobError) {
        console.error(`Error processing job ${job.id}:`, jobError);
        
        // Mark job as failed
        await supabase
          .from('automation_fallback_jobs')
          .update({
            status: 'failed',
            processed_at: new Date().toISOString(),
            error_message: jobError.message,
            retry_count: (job.retry_count || 0) + 1
          })
          .eq('id', job.id);

        results.push({
          jobId: job.id,
          automationId: job.automation_id,
          success: false,
          error: jobError.message
        });
      }
    }

    return {
      success: true,
      jobs_processed: jobs.length,
      results
    };

  } catch (error) {
    console.error('Error processing scheduled jobs:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Test automation trigger (for manual testing)
async function testAutomation(organizationId: string, triggerType: string, testData?: any): Promise<any> {
  const defaultTestData = {
    client_name: 'Test Customer',
    client_first_name: 'Test',
    client_phone: '+1234567890',
    client_email: 'test@example.com',
    client_address: '123 Test St',
    job_id: 'TEST-001',
    job_title: 'Test HVAC Repair',
    job_type: 'HVAC',
    job_status: 'completed',
    scheduled_date: 'Tomorrow',
    scheduled_time: '2:00 PM',
    total_amount: '$450.00',
    technician_name: 'Test Technician',
    company_name: 'Test Company',
    company_phone: '(555) 999-0000',
    booking_link: 'https://test-booking.com'
  };

  const event: TriggerEvent = {
    type: 'trigger_event',
    trigger_type: triggerType,
    event_id: 'test-' + Date.now(),
    organization_id: organizationId,
    context_data: { ...defaultTestData, ...testData }
  };

  return await processTriggerEvent(event);
}

// Edge Function handler
Deno.serve(async (req) => {
  try {
    const url = new URL(req.url);
    const method = req.method;

    // Handle CORS
    if (method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    }

    if (method === 'GET') {
      // Health check or process scheduled jobs
      if (url.pathname.includes('/process-scheduled')) {
        const result = await processScheduledJobs();
        return new Response(JSON.stringify(result), {
          headers: { 'Content-Type': 'application/json' },
          status: result.success ? 200 : 500
        });
      }

      return new Response(JSON.stringify({ 
        status: 'Automation Trigger Service Active',
        timestamp: new Date().toISOString()
      }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200
      });
    }

    if (method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    const body = await req.json();

    // Handle different request types
    switch (body.type) {
      case 'trigger_event':
        const result = await processTriggerEvent(body);
        return new Response(JSON.stringify(result), {
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          status: result.success ? 200 : 500
        });

      case 'test_automation':
        const testResult = await testAutomation(
          body.organization_id,
          body.trigger_type,
          body.test_data
        );
        return new Response(JSON.stringify(testResult), {
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          status: testResult.success ? 200 : 500
        });

      case 'process_scheduled':
        const scheduledResult = await processScheduledJobs();
        return new Response(JSON.stringify(scheduledResult), {
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          status: scheduledResult.success ? 200 : 500
        });

      default:
        return new Response('Invalid request type', { status: 400 });
    }

  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      status: 500
    });
  }
});

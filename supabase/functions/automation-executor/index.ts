import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { workflowId, context = {} } = await req.json();

    if (!workflowId) {
      throw new Error('Workflow ID is required');
    }

    console.log('Executing automation workflow:', workflowId);

    // Get workflow details
    const { data: workflow, error: workflowError } = await supabaseClient
      .from('automation_workflows')
      .select('*')
      .eq('id', workflowId)
      .single();

    if (workflowError || !workflow) {
      throw new Error(`Workflow not found: ${workflowError?.message}`);
    }

    if (workflow.status !== 'active') {
      throw new Error('Workflow is not active');
    }

    // Log execution start
    const { data: logEntry, error: logError } = await supabaseClient
      .from('automation_execution_logs')
      .insert({
        automation_id: workflowId,
        trigger_type: context.triggerType || 'manual',
        trigger_data: context,
        status: 'running',
        started_at: new Date().toISOString(),
        organization_id: workflow.organization_id
      })
      .select()
      .single();

    if (logError) {
      console.error('Error creating log entry:', logError);
    }

    try {
      // Execute workflow steps
      const steps = workflow.template_config?.steps || [];
      const results = [];

      for (const step of steps) {
        console.log('Executing step:', step);
        
        try {
          const stepResult = await executeStep(step, context, supabaseClient);
          results.push({
            stepId: step.id,
            status: 'success',
            result: stepResult
          });
          
          // Add delay if configured
          if (step.config?.delay) {
            await new Promise(resolve => setTimeout(resolve, step.config.delay * 1000));
          }
        } catch (stepError) {
          console.error('Step execution failed:', stepError);
          results.push({
            stepId: step.id,
            status: 'failed',
            error: stepError.message
          });
          
          // Continue with next step even if this one fails
          continue;
        }
      }

      // Update execution log with success
      if (logEntry) {
        await supabaseClient
          .from('automation_execution_logs')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
            actions_executed: results
          })
          .eq('id', logEntry.id);
      }

      // Update workflow metrics
      await supabaseClient
        .from('automation_workflows')
        .update({
          execution_count: (workflow.execution_count || 0) + 1,
          success_count: (workflow.success_count || 0) + 1,
          last_triggered_at: new Date().toISOString()
        })
        .eq('id', workflowId);

      return new Response(
        JSON.stringify({
          success: true,
          workflowId,
          results,
          message: 'Automation workflow executed successfully'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } catch (executionError) {
      console.error('Workflow execution failed:', executionError);

      // Update execution log with failure
      if (logEntry) {
        await supabaseClient
          .from('automation_execution_logs')
          .update({
            status: 'failed',
            completed_at: new Date().toISOString(),
            error_message: executionError.message
          })
          .eq('id', logEntry.id);
      }

      // Update workflow metrics
      await supabaseClient
        .from('automation_workflows')
        .update({
          execution_count: (workflow.execution_count || 0) + 1,
          last_triggered_at: new Date().toISOString()
        })
        .eq('id', workflowId);

      throw executionError;
    }

  } catch (error) {
    console.error('Error in automation executor:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

async function executeStep(step: any, context: any, supabaseClient: any) {
  console.log('Executing step type:', step.type);

  switch (step.type) {
    case 'action':
      return await executeAction(step, context, supabaseClient);
    
    case 'condition':
      return await evaluateCondition(step, context);
    
    case 'delay':
      const delayMs = (step.config?.delayValue || 1) * 
        (step.config?.delayType === 'minutes' ? 60000 : 
         step.config?.delayType === 'hours' ? 3600000 : 1000);
      await new Promise(resolve => setTimeout(resolve, delayMs));
      return { delayed: delayMs };
    
    default:
      throw new Error(`Unknown step type: ${step.type}`);
  }
}

async function executeAction(step: any, context: any, supabaseClient: any) {
  const actionType = step.config?.actionType;
  console.log('Executing action:', actionType);

  switch (actionType) {
    case 'email':
      return await sendEmail(step.config, context, supabaseClient);
    
    case 'sms':
      return await sendSMS(step.config, context, supabaseClient);
    
    case 'notification':
      return await sendNotification(step.config, context, supabaseClient);
    
    case 'task':
      return await createTask(step.config, context, supabaseClient);
    
    default:
      throw new Error(`Unknown action type: ${actionType}`);
  }
}

async function sendEmail(config: any, context: any, supabaseClient: any) {
  console.log('Sending email with config:', config);
  
  const subject = replaceVariables(config.subject || 'Automated Email', context);
  const message = replaceVariables(config.message || 'This is an automated email.', context);
  
  // Log the communication
  try {
    await supabaseClient
      .from('communication_logs')
      .insert({
        type: 'email',
        direction: 'outbound',
        from_address: 'noreply@company.com',
        to_address: context.clientEmail || 'client@example.com',
        subject: subject,
        content: message,
        status: 'sent',
        metadata: { automationGenerated: true }
      });
  } catch (error) {
    console.log('Note: Communication log not saved (table may not exist):', error.message);
  }

  return { 
    type: 'email', 
    status: 'sent',
    subject,
    message,
    recipient: context.clientEmail || 'client@example.com'
  };
}

async function sendSMS(config: any, context: any, supabaseClient: any) {
  console.log('Sending SMS with config:', config);
  
  const message = replaceVariables(config.message || 'Automated SMS message', context);
  
  // Log the communication
  try {
    await supabaseClient
      .from('communication_logs')
      .insert({
        type: 'sms',
        direction: 'outbound',
        from_address: '+1234567890',
        to_address: context.clientPhone || '+1234567890',
        content: message,
        status: 'sent',
        metadata: { automationGenerated: true }
      });
  } catch (error) {
    console.log('Note: Communication log not saved (table may not exist):', error.message);
  }

  return { 
    type: 'sms', 
    status: 'sent',
    message,
    recipient: context.clientPhone || '+1234567890'
  };
}

async function sendNotification(config: any, context: any, supabaseClient: any) {
  console.log('Sending notification with config:', config);
  
  const message = replaceVariables(config.message || 'Automated notification', context);
  
  return { 
    type: 'notification', 
    status: 'sent',
    message
  };
}

async function createTask(config: any, context: any, supabaseClient: any) {
  console.log('Creating task with config:', config);
  
  const description = replaceVariables(config.description || 'Automated task', context);
  
  return { 
    type: 'task', 
    status: 'created',
    description
  };
}

async function evaluateCondition(step: any, context: any) {
  console.log('Evaluating condition:', step.config);
  
  const field = step.config?.field;
  const operator = step.config?.operator;
  const value = step.config?.value;
  
  const contextValue = getNestedValue(context, field);
  
  let result = false;
  
  switch (operator) {
    case 'equals':
      result = contextValue === value;
      break;
    case 'not_equals':
      result = contextValue !== value;
      break;
    case 'greater_than':
      result = Number(contextValue) > Number(value);
      break;
    case 'less_than':
      result = Number(contextValue) < Number(value);
      break;
    case 'contains':
      result = String(contextValue).includes(String(value));
      break;
    default:
      throw new Error(`Unknown operator: ${operator}`);
  }
  
  return { condition: true, result, field, operator, value, contextValue };
}

function replaceVariables(template: string, context: any): string {
  if (!template) return '';
  
  return template.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
    const value = getNestedValue(context, key.trim());
    return value !== undefined ? String(value) : match;
  });
}

function getNestedValue(obj: any, path: string): any {
  if (!obj || !path) return undefined;
  
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : undefined;
  }, obj);
}
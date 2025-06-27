import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

// Types
interface AutomationExecution {
  workflowId: string;
  triggerEventId: string;
  triggerData: any;
  organizationId: string;
}

interface VariableContext {
  client_name?: string;
  client_first_name?: string;
  client_phone?: string;
  client_email?: string;
  client_address?: string;
  job_id?: string;
  job_title?: string;
  job_type?: string;
  job_status?: string;
  scheduled_date?: string;
  scheduled_time?: string;
  total_amount?: string;
  technician_name?: string;
  technician_phone?: string;
  company_name?: string;
  company_phone?: string;
  company_email?: string;
  booking_link?: string;
  [key: string]: any;
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// OpenAI Integration for AI variables
async function generateAIVariable(variableType: string, context: VariableContext): Promise<string> {
  try {
    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiKey) {
      console.warn('OpenAI API key not configured');
      return '';
    }

    let prompt = '';
    switch (variableType) {
      case 'ai_personalized_greeting':
        prompt = `Create a brief, friendly greeting for a field service customer named ${context.client_name}. Reference their recent ${context.job_type || 'service'} if appropriate. Keep it under 15 words.`;
        break;
      case 'ai_next_action':
        prompt = `Suggest a specific next action for ${context.client_name} related to their ${context.job_type || 'service'}. Focus on maintenance, scheduling, or follow-up. Keep it under 20 words.`;
        break;
      case 'ai_urgency_level':
        prompt = `Assess the urgency level for ${context.job_type || 'service'} based on: ${JSON.stringify(context)}. Return a brief urgency statement (e.g., "This needs immediate attention" or "Schedule at your convenience").`;
        break;
      case 'ai_weather_context':
        prompt = `Create a weather-relevant message for ${context.job_type || 'HVAC'} service. Keep it under 20 words and helpful.`;
        break;
      default:
        return '';
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant for field service businesses. Create professional, concise messages.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 100,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      console.error('OpenAI API error:', await response.text());
      return '';
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content?.trim() || '';
  } catch (error) {
    console.error('Error generating AI variable:', error);
    return '';
  }
}

// Variable resolver
async function resolveVariables(text: string, context: VariableContext): Promise<string> {
  let resolvedText = text;
  
  // Find all variables in the text
  const variableRegex = /\{\{([^}]+)\}\}/g;
  const matches = text.match(variableRegex);
  
  if (!matches) return resolvedText;

  for (const match of matches) {
    const variableName = match.replace(/\{\{|\}\}/g, '');
    let value = '';

    // Check if it's an AI variable
    if (variableName.startsWith('ai_')) {
      value = await generateAIVariable(variableName, context);
    } else {
      // Regular variable
      value = context[variableName] || '';
    }

    // Replace the variable in the text
    resolvedText = resolvedText.replace(match, value);
  }

  return resolvedText;
}

// SMS sending via Telnyx
async function sendSMS(phone: string, message: string, workflowId: string): Promise<{ success: boolean; messageId?: string; error?: string; cost: number }> {
  try {
    const telnyxKey = Deno.env.get('TELNYX_API_KEY');
    const fromNumber = Deno.env.get('TELNYX_FROM_NUMBER');
    
    if (!telnyxKey || !fromNumber) {
      throw new Error('Telnyx credentials not configured');
    }

    const response = await fetch('https://api.telnyx.com/v2/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${telnyxKey}`,
      },
      body: JSON.stringify({
        from: fromNumber,
        to: phone,
        text: message,
        webhook_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/automation-webhook`
      }),
    });

    const data = await response.json();
    
    if (response.ok) {
      return {
        success: true,
        messageId: data.data.id,
        cost: 0.01 // Typical SMS cost
      };
    } else {
      return {
        success: false,
        error: data.errors?.[0]?.detail || 'SMS send failed',
        cost: 0
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error.message,
      cost: 0
    };
  }
}

// Email sending via Mailgun
async function sendEmail(email: string, subject: string, message: string, workflowId: string): Promise<{ success: boolean; messageId?: string; error?: string; cost: number }> {
  try {
    const mailgunKey = Deno.env.get('MAILGUN_API_KEY');
    const mailgunDomain = Deno.env.get('MAILGUN_DOMAIN');
    const companyName = Deno.env.get('COMPANY_NAME') || 'Your Service Company';
    
    if (!mailgunKey || !mailgunDomain) {
      throw new Error('Mailgun credentials not configured');
    }

    const formData = new FormData();
    formData.append('from', `${companyName} <noreply@${mailgunDomain}>`);
    formData.append('to', email);
    formData.append('subject', subject);
    formData.append('html', message.replace(/\n/g, '<br>'));
    formData.append('o:tracking', 'yes');
    formData.append('o:tracking-clicks', 'yes');
    formData.append('o:tracking-opens', 'yes');

    const response = await fetch(`https://api.mailgun.net/v3/${mailgunDomain}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`api:${mailgunKey}`)}`,
      },
      body: formData,
    });

    const data = await response.json();
    
    if (response.ok) {
      return {
        success: true,
        messageId: data.id,
        cost: 0.001 // Typical email cost
      };
    } else {
      return {
        success: false,
        error: data.message || 'Email send failed',
        cost: 0
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error.message,
      cost: 0
    };
  }
}

// Create task
async function createTask(taskTitle: string, assignTo: string, organizationId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('tasks')
      .insert({
        organization_id: organizationId,
        title: taskTitle,
        assigned_to: assignTo,
        status: 'pending',
        due_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Due tomorrow
      });

    return !error;
  } catch (error) {
    console.error('Error creating task:', error);
    return false;
  }
}

// Update job status
async function updateJobStatus(jobId: string, newStatus: string, organizationId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('jobs')
      .update({ status: newStatus })
      .eq('id', jobId)
      .eq('organization_id', organizationId);

    return !error;
  } catch (error) {
    console.error('Error updating job status:', error);
    return false;
  }
}

// Execute automation action
async function executeAction(action: any, context: VariableContext, organizationId: string, workflowId: string): Promise<any> {
  const result = {
    success: false,
    details: {},
    error: null as string | null
  };

  try {
    switch (action.type) {
      case 'send_sms':
        if (!context.client_phone) {
          result.error = 'No phone number available';
          break;
        }
        
        const resolvedSMSMessage = await resolveVariables(action.config.message, context);
        const smsResult = await sendSMS(context.client_phone, resolvedSMSMessage, workflowId);
        
        // Log the message
        await supabase.from('automation_messages').insert({
          workflow_id: workflowId,
          organization_id: organizationId,
          contact_name: context.client_name,
          contact_phone: context.client_phone,
          primary_channel: 'sms',
          primary_status: smsResult.success ? 'sent' : 'failed',
          message_content: resolvedSMSMessage,
          message_id: smsResult.messageId,
          cost: smsResult.cost,
          error_message: smsResult.error,
        });

        result.success = smsResult.success;
        result.details = smsResult;
        result.error = smsResult.error || null;
        break;

      case 'send_email':
        if (!context.client_email) {
          result.error = 'No email address available';
          break;
        }
        
        const resolvedSubject = await resolveVariables(action.config.subject || 'Message from your service provider', context);
        const resolvedEmailMessage = await resolveVariables(action.config.message, context);
        const emailResult = await sendEmail(context.client_email, resolvedSubject, resolvedEmailMessage, workflowId);
        
        // Log the message
        await supabase.from('automation_messages').insert({
          workflow_id: workflowId,
          organization_id: organizationId,
          contact_name: context.client_name,
          contact_email: context.client_email,
          primary_channel: 'email',
          primary_status: emailResult.success ? 'sent' : 'failed',
          message_content: resolvedEmailMessage,
          subject: resolvedSubject,
          message_id: emailResult.messageId,
          cost: emailResult.cost,
          error_message: emailResult.error,
        });

        result.success = emailResult.success;
        result.details = emailResult;
        result.error = emailResult.error || null;
        break;

      case 'create_task':
        const taskTitle = await resolveVariables(action.config.task_title || 'Follow-up task', context);
        const taskSuccess = await createTask(taskTitle, action.config.assign_to || 'admin', organizationId);
        
        result.success = taskSuccess;
        result.details = { taskTitle, assignedTo: action.config.assign_to };
        if (!taskSuccess) result.error = 'Failed to create task';
        break;

      case 'update_job_status':
        if (!context.job_id) {
          result.error = 'No job ID available';
          break;
        }
        
        const statusSuccess = await updateJobStatus(context.job_id, action.config.status_update, organizationId);
        
        result.success = statusSuccess;
        result.details = { jobId: context.job_id, newStatus: action.config.status_update };
        if (!statusSuccess) result.error = 'Failed to update job status';
        break;

      default:
        result.error = `Unknown action type: ${action.type}`;
    }
  } catch (error) {
    result.error = error.message;
  }

  return result;
}

// Check if conditions match
function evaluateConditions(conditions: any, context: VariableContext): boolean {
  if (!conditions || !conditions.rules || conditions.rules.length === 0) {
    return true; // No conditions means always execute
  }

  const { operator, rules } = conditions;
  const results = rules.map((rule: any) => {
    const contextValue = context[rule.field];
    const ruleValue = rule.value;

    switch (rule.operator) {
      case 'equals':
        return contextValue === ruleValue;
      case 'not_equals':
        return contextValue !== ruleValue;
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

// Main execution function
async function executeAutomation({ workflowId, triggerEventId, triggerData, organizationId }: AutomationExecution) {
  const startTime = Date.now();
  
  try {
    console.log(`Executing automation ${workflowId} for event ${triggerEventId}`);

    // Get the workflow
    const { data: workflow, error: workflowError } = await supabase
      .from('automation_workflows')
      .select('*')
      .eq('id', workflowId)
      .eq('organization_id', organizationId)
      .single();

    if (workflowError || !workflow) {
      throw new Error(`Workflow not found: ${workflowError?.message}`);
    }

    if (workflow.status !== 'active') {
      console.log(`Workflow ${workflowId} is not active, skipping`);
      return { success: false, reason: 'Workflow not active' };
    }

    // Check conditions
    if (!evaluateConditions(workflow.conditions, triggerData)) {
      console.log(`Conditions not met for workflow ${workflowId}`);
      return { success: false, reason: 'Conditions not met' };
    }

    // Execute action with delay if specified
    const action = workflow.action;
    let delayMs = 0;

    if (action.delay && action.delay.type !== 'immediate') {
      const delayValue = action.delay.value || 1;
      switch (action.delay.type) {
        case 'minutes':
          delayMs = delayValue * 60 * 1000;
          break;
        case 'hours':
          delayMs = delayValue * 60 * 60 * 1000;
          break;
        case 'days':
          delayMs = delayValue * 24 * 60 * 60 * 1000;
          break;
      }
    }

    if (delayMs > 0) {
      // For longer delays, we should schedule this for later execution
      // For now, we'll execute immediately for demo purposes
      console.log(`Would delay execution by ${delayMs}ms, but executing immediately for demo`);
    }

    // Execute the action
    const actionResult = await executeAction(action, triggerData, organizationId, workflowId);
    const executionTime = Date.now() - startTime;

    // Log execution
    await supabase.from('automation_executions').insert({
      workflow_id: workflowId,
      organization_id: organizationId,
      trigger_event_id: triggerEventId,
      trigger_data: triggerData,
      execution_status: actionResult.success ? 'success' : 'failed',
      execution_time_ms: executionTime,
      variables_resolved: triggerData,
      actions_executed: [actionResult],
      error_details: actionResult.error ? { error: actionResult.error } : null,
    });

    // Update workflow metrics
    const increment = actionResult.success ? 1 : 0;
    await supabase.rpc('increment_workflow_metrics', {
      workflow_id: workflowId,
      execution_increment: 1,
      success_increment: increment
    });

    console.log(`Automation ${workflowId} completed: ${actionResult.success ? 'success' : 'failed'}`);
    
    return {
      success: actionResult.success,
      executionTime,
      actionResult,
      reason: actionResult.error || 'Executed successfully'
    };

  } catch (error) {
    const executionTime = Date.now() - startTime;
    
    console.error(`Automation ${workflowId} failed:`, error);
    
    // Log failed execution
    await supabase.from('automation_executions').insert({
      workflow_id: workflowId,
      organization_id: organizationId,
      trigger_event_id: triggerEventId,
      trigger_data: triggerData,
      execution_status: 'failed',
      execution_time_ms: executionTime,
      error_details: { error: error.message },
    });

    return {
      success: false,
      executionTime,
      reason: error.message
    };
  }
}

// Edge Function handler
Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const body = await req.json();
    const { type, ...executionData } = body;

    if (type === 'execute') {
      const result = await executeAutomation(executionData);
      return new Response(JSON.stringify(result), {
        headers: { 'Content-Type': 'application/json' },
        status: result.success ? 200 : 500
      });
    }

    return new Response('Invalid request type', { status: 400 });
  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500
    });
  }
});

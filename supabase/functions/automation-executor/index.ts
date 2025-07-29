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
  
  // Fetch real data for variables if we have job/client IDs
  const enrichedContext = await enrichContext(context, supabaseClient);
  
  const subject = replaceVariables(config.subject || 'Automated Email', enrichedContext);
  const message = replaceVariables(config.message || 'This is an automated email.', enrichedContext);
  const recipientEmail = enrichedContext.client?.email || context.clientEmail || 'client@example.com';
  
  try {
    // Call the actual mailgun-email edge function
    const emailResult = await supabaseClient.functions.invoke('mailgun-email', {
      body: {
        to: recipientEmail,
        subject: subject,
        html: message.replace(/\n/g, '<br>'),
        text: message,
        userId: context.userId || enrichedContext.job?.user_id,
        clientId: enrichedContext.client?.id,
        metadata: { 
          automationGenerated: true,
          workflowId: context.workflowId,
          triggerType: context.triggerType
        }
      }
    });

    if (emailResult.error) {
      console.error('Mailgun email failed:', emailResult.error);
      throw new Error(`Email sending failed: ${emailResult.error.message}`);
    }

    console.log('Email sent successfully via Mailgun:', emailResult.data);

    return { 
      type: 'email', 
      status: 'sent',
      subject,
      message,
      recipient: recipientEmail,
      mailgunId: emailResult.data?.messageId
    };
  } catch (error) {
    console.error('Error sending email:', error);
    
    // Log failed communication
    try {
      await supabaseClient
        .from('communication_logs')
        .insert({
          type: 'email',
          direction: 'outbound',
          from_address: 'noreply@company.com',
          to_address: recipientEmail,
          subject: subject,
          content: message,
          status: 'failed',
          metadata: { 
            automationGenerated: true,
            error: error.message
          }
        });
    } catch (logError) {
      console.log('Failed to log email error:', logError);
    }

    throw error;
  }
}

async function sendSMS(config: any, context: any, supabaseClient: any) {
  console.log('Sending SMS with config:', config);
  
  // Fetch real data for variables if we have job/client IDs
  const enrichedContext = await enrichContext(context, supabaseClient);
  
  const message = replaceVariables(config.message || 'Automated SMS message', enrichedContext);
  const recipientPhone = enrichedContext.client?.phone || context.clientPhone || '+1234567890';
  
  try {
    // Call the actual telnyx-sms edge function
    const smsResult = await supabaseClient.functions.invoke('telnyx-sms', {
      body: {
        recipientPhone: recipientPhone,
        message: message,
        user_id: context.userId || enrichedContext.job?.user_id,
        metadata: { 
          automationGenerated: true,
          workflowId: context.workflowId,
          triggerType: context.triggerType,
          clientId: enrichedContext.client?.id
        }
      }
    });

    if (smsResult.error) {
      console.error('Telnyx SMS failed:', smsResult.error);
      throw new Error(`SMS sending failed: ${smsResult.error.message}`);
    }

    console.log('SMS sent successfully via Telnyx:', smsResult.data);

    return { 
      type: 'sms', 
      status: 'sent',
      message,
      recipient: recipientPhone,
      telnyxId: smsResult.data?.messageId
    };
  } catch (error) {
    console.error('Error sending SMS:', error);
    
    // Log failed communication
    try {
      await supabaseClient
        .from('communication_logs')
        .insert({
          type: 'sms',
          direction: 'outbound',
          from_address: 'system',
          to_address: recipientPhone,
          content: message,
          status: 'failed',
          metadata: { 
            automationGenerated: true,
            error: error.message
          }
        });
    } catch (logError) {
      console.log('Failed to log SMS error:', logError);
    }

    throw error;
  }
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

function formatTime12Hour(timeString: string): string {
  if (!timeString) return '';
  
  try {
    // Parse time string (assuming format like "14:30" or "14:30:00")
    const [hours, minutes] = timeString.split(':');
    const hour24 = parseInt(hours, 10);
    const minute = parseInt(minutes, 10);
    
    if (isNaN(hour24) || isNaN(minute)) return timeString;
    
    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
    const ampm = hour24 >= 12 ? 'PM' : 'AM';
    const formattedMinute = minute.toString().padStart(2, '0');
    
    return `${hour12}:${formattedMinute} ${ampm}`;
  } catch (error) {
    return timeString;
  }
}

async function enrichContext(context: any, supabaseClient: any): Promise<any> {
  const enriched = { ...context };
  
  try {
    // If we have a job ID, fetch job and client data
    if (context.jobId || context.job_id) {
      const jobId = context.jobId || context.job_id;
      
      const { data: job, error: jobError } = await supabaseClient
        .from('jobs')
        .select(`
          *,
          clients!inner(*)
        `)
        .eq('id', jobId)
        .single();
        
      if (!jobError && job) {
        // Format scheduled date and time for better display
        const scheduledDate = job.scheduled_date ? new Date(job.scheduled_date) : null;
        const scheduledTime = job.scheduled_time;
        
        // Create readable date formats
        const formattedDate = scheduledDate ? scheduledDate.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }) : null;
        
        const shortDate = scheduledDate ? scheduledDate.toLocaleDateString('en-US') : null;
        
        // Format time to 12-hour format
        const formattedTime = scheduledTime ? formatTime12Hour(scheduledTime) : null;
        
        enriched.job = {
          id: job.id,
          title: job.title || job.description,
          status: job.status,
          date: job.scheduled_date,
          time: job.scheduled_time,
          formattedDate: formattedDate,
          shortDate: shortDate,
          formattedTime: formattedTime,
          scheduledDateTime: formattedDate && formattedTime ? `${formattedDate} at ${formattedTime}` : null,
          scheduledDateTimeShort: shortDate && formattedTime ? `${shortDate} at ${formattedTime}` : null,
          technician: job.technician_name,
          service: job.service_type,
          notes: job.notes,
          total: job.total
        };
        
        if (job.clients) {
          enriched.client = {
            id: job.clients.id,
            name: `${job.clients.first_name} ${job.clients.last_name}`.trim(),
            firstName: job.clients.first_name,
            lastName: job.clients.last_name,
            email: job.clients.email,
            phone: job.clients.phone,
            address: job.clients.address
          };
        }
      }
    }
    
    // If we have a client ID but no job, fetch client data
    if ((context.clientId || context.client_id) && !enriched.client) {
      const clientId = context.clientId || context.client_id;
      
      const { data: client, error: clientError } = await supabaseClient
        .from('clients')
        .select('*')
        .eq('id', clientId)
        .single();
        
      if (!clientError && client) {
        enriched.client = {
          id: client.id,
          name: `${client.first_name} ${client.last_name}`.trim(),
          firstName: client.first_name,
          lastName: client.last_name,
          email: client.email,
          phone: client.phone,
          address: client.address
        };
      }
    }
    
    // Get company information
    if (enriched.job?.user_id || context.userId) {
      const userId = enriched.job?.user_id || context.userId;
      
      const { data: company, error: companyError } = await supabaseClient
        .from('company_settings')
        .select('*')
        .eq('user_id', userId)
        .single();
        
      if (!companyError && company) {
        enriched.company = {
          name: company.company_name,
          phone: company.phone,
          email: company.email,
          website: company.website,
          address: company.address
        };
      }
    }
    
  } catch (error) {
    console.error('Error enriching context:', error);
  }
  
  return enriched;
}
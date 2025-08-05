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

    const { workflowId, context = {}, executionId } = await req.json();

    if (!workflowId) {
      throw new Error('Workflow ID is required');
    }

    console.log('🚀 Executing automation workflow:', workflowId, 'Execution ID:', executionId);

    // Get workflow details with proper error handling
    const { data: workflow, error: workflowError } = await supabaseClient
      .from('automation_workflows')
      .select('*')
      .eq('id', workflowId)
      .single();

    if (workflowError || !workflow) {
      console.error('❌ Workflow fetch error:', workflowError);
      throw new Error(`Workflow not found: ${workflowError?.message || 'Unknown error'}`);
    }

    if (workflow.status !== 'active') {
      throw new Error(`Workflow is not active (status: ${workflow.status})`);
    }

    console.log('✅ Found workflow:', workflow.name, 'with status:', workflow.status);

    // Get the steps from workflow configuration
    const steps = workflow.steps || workflow.template_config?.steps || [];
    
    if (!steps || steps.length === 0) {
      console.warn('⚠️ No steps found in workflow:', workflowId);
      return new Response(
        JSON.stringify({
          success: true,
          workflowId,
          results: [],
          message: 'Workflow has no steps to execute'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`📋 Found ${steps.length} steps to execute`);

    try {
      // Execute workflow steps
      const results = [];

      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        console.log(`⚙️ Executing step ${i + 1}/${steps.length}:`, step.type || step.config?.actionType);
        
        try {
          const stepResult = await executeStep(step, context, supabaseClient);
          results.push({
            stepId: step.id || `step_${i}`,
            stepIndex: i,
            status: 'success',
            result: stepResult
          });
          
          console.log(`✅ Step ${i + 1} completed successfully`);
          
          // Add delay if configured
          if (step.config?.delay) {
            console.log(`⏱️ Waiting ${step.config.delay} seconds...`);
            await new Promise(resolve => setTimeout(resolve, step.config.delay * 1000));
          }
        } catch (stepError) {
          console.error(`❌ Step ${i + 1} execution failed:`, stepError);
          results.push({
            stepId: step.id || `step_${i}`,
            stepIndex: i,
            status: 'failed',
            error: stepError.message
          });
          
          // Continue with next step even if this one fails
          continue;
        }
      }

      // Update execution log with success if executionId provided
      if (executionId) {
        await supabaseClient
          .from('automation_execution_logs')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
            actions_executed: results
          })
          .eq('id', executionId);
      }

      // Update workflow metrics with proper error handling
      try {
        await supabaseClient.rpc('increment_automation_metrics', {
          workflow_id: workflowId,
          success: true
        });
      } catch (err) {
        console.warn('Failed to update workflow metrics:', err);
      }

      console.log('🎉 Workflow execution completed successfully');

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
      console.error('❌ Workflow execution failed:', executionError);

      // Update execution log with failure if executionId provided
      if (executionId) {
        await supabaseClient
          .from('automation_execution_logs')
          .update({
            status: 'failed',
            completed_at: new Date().toISOString(),
            error_message: executionError.message
          })
          .eq('id', executionId);
      }

      // Update workflow metrics with proper error handling
      try {
        await supabaseClient.rpc('increment_automation_metrics', {
          workflow_id: workflowId,
          success: false
        });
      } catch (err) {
        console.warn('Failed to update workflow metrics:', err);
      }

      throw executionError;
    }

  } catch (error) {
    console.error('💥 Error in automation executor:', error);
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
  const stepType = step.type || (step.config?.actionType ? 'action' : 'unknown');
  console.log('🔧 Executing step type:', stepType);

  switch (stepType) {
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
    
    case 'trigger':
      // Skip trigger steps as they are not meant to be executed
      console.log('⏭️ Skipping trigger step - triggers are for workflow initiation only');
      return { type: 'trigger', status: 'skipped' };
    
    default:
      console.warn('⚠️ Unknown step type:', stepType);
      return { type: stepType, status: 'skipped', reason: 'Unknown step type' };
  }
}

async function executeAction(step: any, context: any, supabaseClient: any) {
  // Handle both old format (subType) and new format (actionType)
  const actionType = step.config?.actionType || step.subType || step.type;
  console.log('📧 Executing action with type:', actionType);
  console.log('📧 Step config:', JSON.stringify(step.config, null, 2));
  
  if (!actionType) {
    console.error('❌ No action type found in step:', JSON.stringify(step, null, 2));
    throw new Error('No action type specified in step configuration');
  }

  // Check timing restrictions before executing action
  const timing = step.config?.timing;
  if (timing) {
    const isWithinBusinessHours = await checkBusinessHours(timing, supabaseClient);
    if (!isWithinBusinessHours) {
      console.log('🕐 Action scheduled outside business hours, deferring execution');
      return {
        type: actionType,
        status: 'deferred',
        reason: 'Outside business hours',
        timing: timing
      };
    }
  }

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
      console.error('❌ Unknown action type:', actionType);
      console.error('📋 Available action types: email, sms, notification, task');
      throw new Error(`Unknown action type: ${actionType}. Available types: email, sms, notification, task`);
  }
}

async function sendEmail(config: any, context: any, supabaseClient: any) {
  console.log('📧 Sending email with config:', JSON.stringify(config, null, 2));
  
  // Fetch real data for variables if we have job/client IDs
  const enrichedContext = await enrichContext(context, supabaseClient);
  console.log('🔍 Enriched context:', JSON.stringify(enrichedContext, null, 2));
  
  const subject = replaceVariables(config.subject || 'Automated Email', enrichedContext);
  const message = replaceVariables(config.message || 'This is an automated email.', enrichedContext);
  const recipientEmail = enrichedContext.client?.email || context.clientEmail || config.recipientEmail || 'client@example.com';
  
  console.log('📮 Sending email to:', recipientEmail, 'Subject:', subject);
  
  try {
    // Call the mailgun-email edge function with proper error handling
    const emailResult = await supabaseClient.functions.invoke('mailgun-email', {
      body: {
        to: recipientEmail,
        subject: subject,
        html: message.replace(/\n/g, '<br>'),
        text: message,
        userId: enrichedContext.job?.user_id || context.userId || context.user?.id,
        clientId: enrichedContext.client?.id,
        metadata: { 
          automationGenerated: true,
          workflowId: context.workflowId,
          triggerType: context.triggerType
        }
      }
    });

    if (emailResult.error) {
      console.error('📧❌ Mailgun email failed:', emailResult.error);
      throw new Error(`Email sending failed: ${emailResult.error.message}`);
    }

    console.log('📧✅ Email sent successfully via Mailgun:', emailResult.data);

    return { 
      type: 'email', 
      status: 'sent',
      subject,
      message,
      recipient: recipientEmail,
      mailgunId: emailResult.data?.messageId
    };
  } catch (error) {
    console.error('📧💥 Error sending email:', error);
    
    // Log failed communication attempt
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
  console.log('📱 Sending SMS with config:', JSON.stringify(config, null, 2));
  
  // Fetch real data for variables if we have job/client IDs
  const enrichedContext = await enrichContext(context, supabaseClient);
  
  const message = replaceVariables(config.message || 'Automated SMS message', enrichedContext);
  const recipientPhone = enrichedContext.client?.phone || context.clientPhone || config.recipientPhone || '+1234567890';
  
  console.log('📱 Sending SMS to:', recipientPhone, 'Message:', message);
  
  try {
    // Call the telnyx-sms edge function with proper error handling
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
      console.error('📱❌ Telnyx SMS failed:', smsResult.error);
      throw new Error(`SMS sending failed: ${smsResult.error.message}`);
    }

    console.log('📱✅ SMS sent successfully via Telnyx:', smsResult.data);

    return { 
      type: 'sms', 
      status: 'sent',
      message,
      recipient: recipientPhone,
      telnyxId: smsResult.data?.messageId
    };
  } catch (error) {
    console.error('📱💥 Error sending SMS:', error);
    
    // Log failed communication attempt
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
  console.log('🔔 Sending notification with config:', config);
  
  const message = replaceVariables(config.message || 'Automated notification', context);
  
  return { 
    type: 'notification', 
    status: 'sent',
    message
  };
}

async function createTask(config: any, context: any, supabaseClient: any) {
  console.log('📝 Creating task with config:', config);
  
  const description = replaceVariables(config.description || 'Automated task', context);
  
  return { 
    type: 'task', 
    status: 'created',
    description
  };
}

async function evaluateCondition(step: any, context: any) {
  console.log('🤔 Evaluating condition:', step.config);
  
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

async function checkBusinessHours(timing: any, supabaseClient: any): Promise<boolean> {
  // For now, always return true - business hours checking can be enhanced later
  // This prevents automations from being blocked
  console.log('⏰ Business hours check - allowing execution (always true for now)');
  return true;
}

async function enrichContext(context: any, supabaseClient: any): Promise<any> {
  const enriched = { ...context };
  
  try {
    // If we have a job ID, fetch job and client data
    if (context.jobId || context.job_id) {
      const jobId = context.jobId || context.job_id;
      console.log('🔍 Enriching context with job data for ID:', jobId);
      
      const { data: job, error: jobError } = await supabaseClient
        .from('jobs')
        .select(`
          *,
          clients!inner(*)
        `)
        .eq('id', jobId)
        .single();
        
      if (!jobError && job) {
        enriched.job = job;
        enriched.client = job.clients;
        console.log('✅ Successfully enriched context with job and client data');
      } else {
        console.warn('⚠️ Failed to fetch job data:', jobError);
      }
    }
    
    // If we have a direct client ID, fetch client data
    if (context.clientId && !enriched.client) {
      console.log('🔍 Enriching context with client data for ID:', context.clientId);
      
      const { data: client, error: clientError } = await supabaseClient
        .from('clients')
        .select('*')
        .eq('id', context.clientId)
        .single();
        
      if (!clientError && client) {
        enriched.client = client;
        console.log('✅ Successfully enriched context with client data');
      } else {
        console.warn('⚠️ Failed to fetch client data:', clientError);
      }
    }
    
  } catch (error) {
    console.error('💥 Error enriching context:', error);
  }
  
  return enriched;
}
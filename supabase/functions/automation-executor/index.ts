import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AutomationExecutionRequest {
  workflow_id: string;
  variables?: Record<string, any>;
  triggerData?: Record<string, any>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { workflow_id, variables, triggerData }: AutomationExecutionRequest = await req.json();

    // Get workflow details
    const { data: workflow, error: workflowError } = await supabaseClient
      .from('automation_workflows')
      .select('*')
      .eq('id', workflow_id)
      .eq('status', 'active')
      .single();

    if (workflowError || !workflow) {
      return new Response(JSON.stringify({ error: 'Workflow not found or inactive' }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
        status: 404,
      });
    }

    // Log automation execution start
    const { data: executionLog } = await supabaseClient
      .from('automation_history')
      .insert({
        workflow_id: workflow_id,
        execution_status: 'running',
        variables_used: variables || triggerData || {},
        actions_executed: []
      })
      .select()
      .single();

    let successfulActions = 0;
    let failedActions = 0;
    const actionResults = [];
    const startTime = Date.now();

    try {
      // Parse visual config to get actions
      const visualConfig = workflow.visual_config || {};
      const nodes = visualConfig.nodes || [];
      
      // Find action nodes and execute them
      const actionNodes = nodes.filter(node => node.type === 'action');
      
      for (const node of actionNodes) {
        try {
          const actionType = node.data?.type;
          const actionConfig = node.data;
          
          let result;
          
          switch (actionType) {
            case 'send_email':
              result = await executeEmailAction(supabaseClient, workflow, actionConfig, variables || triggerData || {});
              break;
            case 'send_sms':
              result = await executeSmsAction(supabaseClient, workflow, actionConfig, variables || triggerData || {});
              break;
            case 'create_task':
              result = await executeTaskAction(supabaseClient, workflow, actionConfig, variables || triggerData || {});
              break;
            default:
              console.log(`Unknown action type: ${actionType}`);
              result = { status: 'skipped', reason: 'Unknown action type' };
          }

          actionResults.push({
            nodeId: node.id,
            actionType: actionType,
            status: 'success',
            result
          });
          successfulActions++;

        } catch (error) {
          console.error(`Error executing action ${node.id}:`, error);
          actionResults.push({
            nodeId: node.id,
            actionType: node.data?.type,
            status: 'failed',
            error: error.message
          });
          failedActions++;
        }
      }

      // Update workflow metrics
      await supabaseClient
        .from('automation_workflows')
        .update({
          execution_count: workflow.execution_count + 1,
          success_count: workflow.success_count + (failedActions === 0 ? 1 : 0),
          last_triggered_at: new Date().toISOString()
        })
        .eq('id', workflow_id);

    } catch (error) {
      console.error('Error during execution:', error);
      failedActions++;
    }

    const executionTime = Date.now() - startTime;

    // Update execution history
    await supabaseClient
      .from('automation_history')
      .update({
        execution_status: failedActions > 0 ? 'partial' : 'success',
        execution_time_ms: executionTime,
        actions_executed: actionResults,
        error_details: failedActions > 0 ? { failedActions, actionResults } : null
      })
      .eq('id', executionLog.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        executionId: executionLog.id,
        actionsExecuted: successfulActions,
        actionsFailed: failedActions,
        results: actionResults
      }),
      {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );

  } catch (error) {
    console.error('Error in automation-executor function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to execute automation' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
});

async function executeEmailAction(supabaseClient: any, workflow: any, actionConfig: any, variables: any) {
  const message = actionConfig.message || actionConfig.content || '';
  const subject = actionConfig.subject || 'Automated Message';
  
  // Replace variables in message
  let processedMessage = message;
  let processedSubject = subject;
  
  // Replace common variables
  Object.keys(variables).forEach(key => {
    const value = variables[key];
    processedMessage = processedMessage.replace(new RegExp(`{{${key}}}`, 'g'), value);
    processedSubject = processedSubject.replace(new RegExp(`{{${key}}}`, 'g'), value);
  });

  // Get recipient email
  const recipientEmail = actionConfig.to || variables.email || variables.clientEmail;

  if (!recipientEmail) {
    throw new Error('No recipient email found');
  }

  // Create HTML email
  const emailHtml = `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          ${processedMessage.replace(/\n/g, '<br>')}
        </div>
      </body>
    </html>
  `;

  // Call send-email function
  const { data: emailResult, error: emailError } = await supabaseClient.functions.invoke('send-email', {
    body: {
      to: recipientEmail,
      subject: processedSubject,
      html: emailHtml,
      text: processedMessage,
      organizationId: workflow.organization_id
    }
  });

  if (emailError) {
    throw emailError;
  }

  // Log communication
  await supabaseClient
    .from('communication_logs')
    .insert({
      organization_id: workflow.organization_id,
      type: 'email',
      direction: 'outbound',
      to_email: recipientEmail,
      subject: processedSubject,
      content: processedMessage,
      status: 'sent',
      created_by_automation: workflow.id,
      metadata: { emailResult }
    });

  return { messageId: emailResult?.messageId, recipient: recipientEmail };
}

async function executeSmsAction(supabaseClient: any, workflow: any, actionConfig: any, variables: any) {
  const message = actionConfig.message || actionConfig.content || '';
  
  // Replace variables in message
  let processedMessage = message;
  
  Object.keys(variables).forEach(key => {
    const value = variables[key];
    processedMessage = processedMessage.replace(new RegExp(`{{${key}}}`, 'g'), value);
  });

  // Get recipient phone
  const recipientPhone = actionConfig.to || variables.phone || variables.clientPhone;

  if (!recipientPhone) {
    throw new Error('No recipient phone found');
  }

  // Call send SMS function
  const { data: smsResult, error: smsError } = await supabaseClient.functions.invoke('telnyx-sms', {
    body: {
      to: recipientPhone,
      message: processedMessage,
      organizationId: workflow.organization_id
    }
  });

  if (smsError) {
    throw smsError;
  }

  // Log communication
  await supabaseClient
    .from('communication_logs')
    .insert({
      organization_id: workflow.organization_id,
      type: 'sms',
      direction: 'outbound',
      to_number: recipientPhone,
      content: processedMessage,
      status: 'sent',
      created_by_automation: workflow.id,
      metadata: { smsResult }
    });

  return { messageId: smsResult?.messageId, recipient: recipientPhone };
}

async function executeTaskAction(supabaseClient: any, workflow: any, actionConfig: any, variables: any) {
  // Create a task
  const { data: task, error: taskError } = await supabaseClient
    .from('tasks')
    .insert({
      title: actionConfig.title || 'Automated Task',
      description: actionConfig.description || '',
      status: 'pending',
      created_by_automation: workflow.id,
      organization_id: workflow.organization_id
    })
    .select()
    .single();

  if (taskError) {
    throw taskError;
  }

  return { taskId: task.id };
}

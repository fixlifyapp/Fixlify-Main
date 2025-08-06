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
    const requestBody = await req.json();
    console.log('📥 Request received:', JSON.stringify(requestBody, null, 2));
    
    const { workflowId, context = {}, executionId, test } = requestBody;

    // Handle test requests
    if (test === true) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Automation executor is accessible',
          version: '1.7.0'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    if (!workflowId) {
      throw new Error('Workflow ID is required');
    }

    // Extract job ID from various possible locations
    const jobId = context.job_id || 
                  context.jobId || 
                  context.trigger_data?.job_id || 
                  context.job?.id;
                  
    console.log('🔍 Extracted job ID:', jobId);
    console.log('📋 Full context:', JSON.stringify(context, null, 2));

    // Get workflow details
    const { data: workflow, error: workflowError } = await supabaseClient
      .from('automation_workflows')
      .select('*')
      .eq('id', workflowId)
      .single();

    if (workflowError || !workflow) {
      throw new Error(`Workflow not found: ${workflowError?.message || 'Unknown error'}`);
    }

    if (workflow.status !== 'active') {
      throw new Error(`Workflow is not active (status: ${workflow.status})`);
    }

    console.log('✅ Found workflow:', workflow.name);

    // Get the steps
    const steps = workflow.steps || [];
    
    if (!steps || steps.length === 0) {
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

    // Enrich context with job data if we have a job ID
    let enrichedContext = { ...context };
    if (jobId) {
      enrichedContext = await enrichContextWithJob(jobId, context, supabaseClient);
    }

    console.log('🔧 Enriched context:', JSON.stringify(enrichedContext, null, 2));

    // Execute workflow steps
    const results = [];
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      console.log(`⚙️ Executing step ${i + 1}/${steps.length}:`, step.type || step.config?.actionType);
      
      try {
        const stepResult = await executeStep(step, enrichedContext, supabaseClient);
        results.push({
          stepId: step.id || `step_${i}`,
          stepIndex: i,
          status: 'success',
          result: stepResult
        });
        console.log(`✅ Step ${i + 1} completed`);
      } catch (stepError) {
        console.error(`❌ Step ${i + 1} failed:`, stepError);
        results.push({
          stepId: step.id || `step_${i}`,
          stepIndex: i,
          status: 'failed',
          error: stepError.message
        });
      }
    }

    // Update execution log
    if (executionId && executionId !== 'test-execution') {
      await supabaseClient
        .from('automation_execution_logs')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          actions_executed: results
        })
        .eq('id', executionId);
    }

    return new Response(
      JSON.stringify({
        success: true,
        workflowId,
        results,
        message: 'Automation workflow executed successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('💥 Error:', error);
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

async function enrichContextWithJob(jobId: string, context: any, supabaseClient: any) {
  console.log('🔎 Fetching job data for ID:', jobId);
  
  // Fetch job with all related data
  const { data: job, error: jobError } = await supabaseClient
    .from('jobs')
    .select(`
      *,
      clients:client_id (
        id,
        name,
        email,
        phone,
        first_name,
        last_name,
        address
      ),
      technician:technician_id (
        id,
        name,
        email
      )
    `)
    .eq('id', jobId)
    .single();
    
  if (jobError || !job) {
    console.error('❌ Failed to fetch job:', jobError);
    return context;
  }
  
  console.log('📦 Job data fetched:', JSON.stringify(job, null, 2));
  
  // Get company info from user profile
  let company = { name: 'Fixlify', email: 'support@fixlify.app', website: 'fixlify.app' };
  if (job.user_id) {
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('company_name, company_email, company_phone, company_address, company_website')
      .eq('id', job.user_id)
      .single();
    
    if (profile) {
      company = {
        name: profile.company_name || 'Fixlify',
        email: profile.company_email || 'support@fixlify.app',
        phone: profile.company_phone || '',
        address: profile.company_address || '',
        website: profile.company_website || 'fixlify.app'
      };
    }
  }
  
  // Build enriched context with all the data
  const enriched = {
    ...context,
    job: {
      ...job,
      scheduledDate: job.schedule_start ? 
        new Date(job.schedule_start).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' }) : '',
      scheduledTime: job.schedule_start ? 
        new Date(job.schedule_start).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) : '',
      technician: job.technician?.name || 'Not assigned',
      technicianName: job.technician?.name || 'Not assigned',
      technicianEmail: job.technician?.email || ''
    },
    client: job.clients ? {
      ...job.clients,
      firstName: job.clients.first_name || job.clients.name?.split(' ')[0] || '',
      lastName: job.clients.last_name || job.clients.name?.split(' ').slice(1).join(' ') || ''
    } : null,
    company: company
  };
  
  console.log('✨ Enriched context built:', JSON.stringify(enriched, null, 2));
  return enriched;
}

async function executeStep(step: any, context: any, supabaseClient: any) {
  const stepType = step.type || (step.config?.actionType ? 'action' : 'unknown');
  
  switch (stepType) {
    case 'action':
      return await executeAction(step, context, supabaseClient);
    case 'delay':
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { delayed: 1000 };
    default:
      return { type: stepType, status: 'skipped' };
  }
}

async function executeAction(step: any, context: any, supabaseClient: any) {
  const actionType = step.config?.actionType || step.type;
  console.log('🎯 Action type:', actionType);
  
  switch (actionType) {
    case 'email':
      return await sendEmail(step.config, context, supabaseClient);
    case 'sms':
      return await sendSMS(step.config, context, supabaseClient);
    default:
      throw new Error(`Unknown action type: ${actionType}`);
  }
}

async function sendEmail(config: any, context: any, supabaseClient: any) {
  console.log('📧 Preparing email with context:', JSON.stringify(context, null, 2));
  
  // Replace variables in content
  const subject = replaceVariables(config.subject || 'Automated Email', context);
  const message = replaceVariables(config.message || config.body || '', context);
  
  // Get recipient email - check multiple locations
  const recipientEmail = context.client?.email || 
                        context.client?.clients?.email || 
                        context.clientEmail || 
                        'client@example.com';
  
  console.log('📮 Sending email to:', recipientEmail);
  console.log('📮 Subject:', subject);
  console.log('📮 Message preview:', message.substring(0, 200));
  
  try {
    const emailResult = await supabaseClient.functions.invoke('mailgun-email', {
      body: {
        to: recipientEmail,
        subject: subject,
        html: message,
        text: message.replace(/<[^>]*>/g, ''),
        userId: context.job?.user_id || context.userId
      }
    });

    if (emailResult.error) {
      throw new Error(`Email failed: ${emailResult.error.message}`);
    }

    return { 
      type: 'email', 
      status: 'sent',
      subject,
      message,
      recipient: recipientEmail,
      mailgunId: emailResult.data?.messageId
    };
  } catch (error) {
    console.error('📧❌ Email error:', error);
    throw error;
  }
}

async function sendSMS(config: any, context: any, supabaseClient: any) {
  console.log('📱 Preparing SMS with context:', JSON.stringify(context, null, 2));
  
  const message = replaceVariables(config.message || '', context);
  const recipientPhone = context.client?.phone || 
                        context.client?.clients?.phone || 
                        context.clientPhone || 
                        '+1234567890';
  
  console.log('📱 Sending SMS to:', recipientPhone);
  console.log('📱 Message:', message);
  
  try {
    const smsResult = await supabaseClient.functions.invoke('telnyx-sms', {
      body: {
        recipientPhone: recipientPhone,
        message: message,
        user_id: context.job?.user_id || context.userId
      }
    });

    if (smsResult.error) {
      throw new Error(`SMS failed: ${smsResult.error.message}`);
    }

    return { 
      type: 'sms', 
      status: 'sent',
      message,
      recipient: recipientPhone,
      telnyxId: smsResult.data?.messageId
    };
  } catch (error) {
    console.error('📱❌ SMS error:', error);
    throw error;
  }
}

function replaceVariables(template: string, context: any): string {
  if (!template) return '';
  
  console.log('🔄 Replacing variables in template');
  console.log('📝 Template:', template.substring(0, 100));
  console.log('🔧 Available context keys:', Object.keys(context));
  
  let result = template;
  
  // Replace all {{variable}} patterns
  result = result.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
    const value = getNestedValue(context, path.trim());
    console.log(`  Replacing {{${path}}} with:`, value);
    return value !== undefined && value !== null ? String(value) : match;
  });
  
  return result;
}

function getNestedValue(obj: any, path: string): any {
  if (!obj || !path) return undefined;
  
  // Handle special cases
  if (path === 'client.firstName' && obj.client) {
    return obj.client.firstName || obj.client.first_name || obj.client.name?.split(' ')[0] || '';
  }
  if (path === 'client.lastName' && obj.client) {
    return obj.client.lastName || obj.client.last_name || obj.client.name?.split(' ').slice(1).join(' ') || '';
  }
  
  // Handle nested paths
  const keys = path.split('.');
  let value = obj;
  
  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = value[key];
    } else {
      return undefined;
    }
  }
  
  return value;
}

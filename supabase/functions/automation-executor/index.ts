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
    const body = await req.json();
    console.log('📥 Request body:', JSON.stringify(body, null, 2));
    
    const { workflowId, context = {}, executionId, test } = body;

    if (test === true) {
      return new Response(
        JSON.stringify({ success: true, version: '1.8.0' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with service role key for bypassing RLS
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    console.log('🔑 Using service role key:', serviceRoleKey ? 'YES' : 'NO');
    
    const supabaseClient = createClient(supabaseUrl ?? '', serviceRoleKey ?? '');

    // Extract job ID from context
    const jobId = context.job_id || context.jobId || context.trigger_data?.job_id || context.job?.id;
    console.log('🆔 Job ID extracted:', jobId);

    // Get workflow
    const { data: workflow, error: wfError } = await supabaseClient
      .from('automation_workflows')
      .select('*')
      .eq('id', workflowId)
      .single();

    if (wfError) throw new Error(`Workflow error: ${wfError.message}`);
    if (workflow.status !== 'active') throw new Error('Workflow not active');

    const steps = workflow.steps || [];
    console.log(`📋 ${steps.length} steps to execute`);

    // Enrich context with job data
    let enrichedContext = { ...context };
    
    if (jobId) {
      console.log('🔍 Fetching job data for:', jobId);
      
      // Fetch job with client data
      const { data: job, error: jobError } = await supabaseClient
        .from('jobs')
        .select('*, clients!client_id(*)')
        .eq('id', jobId)
        .single();
      
      if (jobError) {
        console.error('❌ Job fetch error:', jobError);
      } else if (job) {
        console.log('✅ Job fetched:', job.id, 'Client:', job.clients?.email);
        
        // Fetch technician if exists
        let technician = null;
        if (job.technician_id) {
          const { data: tech } = await supabaseClient
            .from('profiles')
            .select('name, email')
            .eq('id', job.technician_id)
            .single();
          technician = tech;
        }
        
        // Fetch company info
        let company = { name: 'Fixlify', email: 'support@fixlify.app' };
        if (job.user_id) {
          const { data: profile } = await supabaseClient
            .from('profiles')
            .select('company_name, company_email, company_phone')
            .eq('id', job.user_id)
            .single();
          if (profile?.company_name) {
            company = {
              name: profile.company_name,
              email: profile.company_email || 'support@fixlify.app',
              phone: profile.company_phone || ''
            };
          }
        }
        
        // Build enriched context
        enrichedContext = {
          ...context,
          job: {
            ...job,
            scheduledDate: job.schedule_start ? 
              new Date(job.schedule_start).toLocaleDateString() : '',
            scheduledTime: job.schedule_start ? 
              new Date(job.schedule_start).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '',
            technician: technician?.name || 'Not assigned'
          },
          client: job.clients ? {
            ...job.clients,
            firstName: job.clients.first_name || job.clients.name?.split(' ')[0] || '',
            lastName: job.clients.last_name || job.clients.name?.split(' ').slice(1).join(' ') || ''
          } : null,
          company
        };
        
        console.log('📧 Client email:', enrichedContext.client?.email);
      }
    }

    // Execute steps
    const results = [];
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      try {
        const result = await executeStep(step, enrichedContext, supabaseClient);
        results.push({ stepId: step.id, stepIndex: i, status: 'success', result });
      } catch (error) {
        results.push({ stepId: step.id, stepIndex: i, status: 'failed', error: error.message });
      }
    }

    // Update log if not test
    if (executionId && !executionId.startsWith('test-') && !executionId.startsWith('manual-')) {
      await supabaseClient
        .from('automation_execution_logs')
        .update({ status: 'completed', completed_at: new Date().toISOString(), actions_executed: results })
        .eq('id', executionId);
    }

    return new Response(
      JSON.stringify({ success: true, workflowId, results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('💥 Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function executeStep(step, context, supabaseClient) {
  const actionType = step.config?.actionType || step.type;
  
  switch (actionType) {
    case 'email':
      return await sendEmail(step.config, context, supabaseClient);
    case 'sms':
      return await sendSMS(step.config, context, supabaseClient);
    default:
      return { type: actionType, status: 'skipped' };
  }
}

async function sendEmail(config, context, supabaseClient) {
  const subject = replaceVariables(config.subject || '', context);
  const message = replaceVariables(config.message || config.body || '', context);
  const recipient = context.client?.email || 'client@example.com';
  
  console.log('📧 Email to:', recipient, 'Subject:', subject);
  
  const { data, error } = await supabaseClient.functions.invoke('mailgun-email', {
    body: {
      to: recipient,
      subject: subject,
      html: message,
      text: message.replace(/<[^>]*>/g, ''),
      userId: context.job?.user_id || context.userId
    }
  });
  
  if (error) throw error;
  
  return { 
    type: 'email', 
    status: 'sent',
    subject,
    message,
    recipient,
    mailgunId: data?.messageId
  };
}

async function sendSMS(config, context, supabaseClient) {
  const message = replaceVariables(config.message || '', context);
  const recipient = context.client?.phone || '+1234567890';
  
  console.log('📱 SMS to:', recipient);
  
  const { data, error } = await supabaseClient.functions.invoke('telnyx-sms', {
    body: {
      recipientPhone: recipient,
      message: message,
      user_id: context.job?.user_id || context.userId
    }
  });
  
  if (error) throw error;
  
  return { 
    type: 'sms', 
    status: 'sent',
    message,
    recipient,
    telnyxId: data?.messageId
  };
}

function replaceVariables(template, context) {
  if (!template) return '';
  
  return template.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
    const value = getNestedValue(context, path.trim());
    return value !== undefined ? String(value) : match;
  });
}

function getNestedValue(obj, path) {
  if (!obj || !path) return undefined;
  
  // Handle special cases
  if (path === 'client.firstName') return obj.client?.firstName || '';
  if (path === 'client.lastName') return obj.client?.lastName || '';
  if (path === 'company.name') return obj.company?.name || 'Fixlify';
  if (path === 'job.scheduledDate') return obj.job?.scheduledDate || '';
  if (path === 'job.scheduledTime') return obj.job?.scheduledTime || '';
  if (path === 'job.technician') return obj.job?.technician || 'Not assigned';
  if (path === 'job.title') return obj.job?.title || '';
  if (path === 'job.address') return obj.job?.address || '';
  
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

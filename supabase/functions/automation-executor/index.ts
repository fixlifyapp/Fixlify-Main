import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { workflowId, triggeredBy, entityId, entityType, context } = await req.json()

    // Get workflow details
    const { data: workflow, error: workflowError } = await supabase
      .from('automation_workflows')
      .select('*')
      .eq('id', workflowId)
      .single()

    if (workflowError || !workflow) {
      throw new Error('Workflow not found')
    }

    // Check if workflow is active
    if (workflow.status !== 'active') {
      return new Response(
        JSON.stringify({ message: 'Workflow is not active' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Log execution start
    const { data: executionLog } = await supabase
      .from('automation_execution_logs')
      .insert({
        workflow_id: workflowId,
        status: 'started',
        started_at: new Date().toISOString(),
        trigger_type: triggeredBy,
        trigger_data: { entityId, entityType, context }
      })
      .select()
      .single()

    try {
      // Parse workflow configuration
      const config = workflow.workflow_config || {}
      const steps = config.steps || []

      // Execute each step
      for (const step of steps) {
        await executeStep(step, { 
          workflow, 
          entityId, 
          entityType, 
          context,
          supabase 
        })
      }

      // Update success metrics
      await supabase
        .from('automation_workflows')
        .update({
          execution_count: (workflow.execution_count || 0) + 1,
          success_count: (workflow.success_count || 0) + 1,
          last_executed_at: new Date().toISOString()
        })
        .eq('id', workflowId)

      // Update execution log
      await supabase
        .from('automation_execution_logs')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', executionLog.id)

      return new Response(
        JSON.stringify({ success: true, executionId: executionLog.id }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } catch (error) {
      // Log failure
      await supabase
        .from('automation_execution_logs')
        .update({
          status: 'failed',
          completed_at: new Date().toISOString(),
          error_message: error.message
        })
        .eq('id', executionLog.id)

      throw error
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

async function executeStep(step: any, params: any) {
  const { supabase, entityId, entityType, context } = params
  
  switch (step.type) {
    case 'send_sms':
      await sendSMS(step.config, params)
      break
    case 'send_email':
      await sendEmail(step.config, params)
      break
    case 'delay':
      await delay(step.config)
      break
    case 'send_notification':
      await sendNotification(step.config, params)
      break
    default:
      console.warn('Unknown step type:', step.type)
  }
}

async function sendSMS(config: any, params: any) {
  const { supabase, entityId, context } = params
  const variables = await resolveVariables(params)
  const message = replaceVariables(config.message || '', variables)
  
  // Get client phone
  const { data: client } = await supabase
    .from('clients')
    .select('phone')
    .eq('id', context.clientId)
    .single()
    
  if (!client?.phone) {
    throw new Error('Client phone not found')
  }
  
  // Call Telnyx SMS function
  const response = await fetch(`${params.supabase.supabaseUrl}/functions/v1/telnyx-sms`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${params.supabase.supabaseKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      to: client.phone,
      message: message,
      userId: context.userId
    })
  })
  
  if (!response.ok) {
    throw new Error('Failed to send SMS')
  }
}

async function sendEmail(config: any, params: any) {
  const { supabase, context } = params
  const variables = await resolveVariables(params)
  const subject = replaceVariables(config.subject || '', variables)
  const body = replaceVariables(config.message || config.body || '', variables)
  
  // Get client email
  const { data: client } = await supabase
    .from('clients')
    .select('email')
    .eq('id', context.clientId)
    .single()
    
  if (!client?.email) {
    throw new Error('Client email not found')
  }
  
  // Call Mailgun email function
  const response = await fetch(`${params.supabase.supabaseUrl}/functions/v1/mailgun-email`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${params.supabase.supabaseKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      to: client.email,
      subject: subject,
      html: body,
      text: body.replace(/<[^>]*>/g, ''),
      userId: context.userId
    })
  })
  
  if (!response.ok) {
    throw new Error('Failed to send email')
  }
}

async function sendNotification(config: any, params: any) {
  const { supabase, entityId, entityType, context } = params
  const variables = await resolveVariables(params)
  const message = replaceVariables(config.message || '', variables)
  
  await supabase
    .from('notifications')
    .insert({
      user_id: context.userId,
      title: 'Automation Notification',
      message: message,
      type: 'automation',
      entity_type: entityType,
      entity_id: entityId
    })
}

async function delay(config: any) {
  const ms = calculateDelayMs(config.delayValue, config.delayUnit)
  await new Promise(resolve => setTimeout(resolve, ms))
}

function calculateDelayMs(value: number, unit: string): number {
  switch (unit) {
    case 'minutes': return value * 60 * 1000
    case 'hours': return value * 60 * 60 * 1000
    case 'days': return value * 24 * 60 * 60 * 1000
    default: return value * 1000
  }
}

async function resolveVariables(params: any): Promise<Record<string, any>> {
  const { supabase, entityId, entityType, context } = params
  const variables: Record<string, any> = {}
  
  // Add date/time variables
  const now = new Date()
  variables.current_date = now.toLocaleDateString()
  variables.current_time = now.toLocaleTimeString()
  
  // Get entity data
  if (entityType === 'job') {
    const { data: job } = await supabase
      .from('jobs')
      .select('*, clients!inner(*)')
      .eq('id', entityId)
      .single()
      
    if (job) {
      // Client variables
      variables.client_name = job.clients?.name || ''
      variables.client_first_name = job.clients?.name?.split(' ')[0] || ''
      variables.customer_name = variables.client_name
      variables.customer_first_name = variables.client_first_name
      
      // Job variables
      variables.job_title = job.title || ''
      variables.service_type = job.service || ''
      variables.job_address = job.address || job.clients?.address || ''
      
      // Schedule variables
      if (job.schedule_start) {
        const date = new Date(job.schedule_start)
        variables.appointment_date = date.toLocaleDateString()
        variables.appointment_time = date.toLocaleTimeString()
      }
      
      // Amount
      variables.amount = job.revenue ? `$${job.revenue}` : ''
    }
  }
  
  // Company info
  const { data: profile } = await supabase
    .from('profiles')
    .select('company_name, company_phone, company_email, website')
    .eq('id', context.userId)
    .single()
    
  variables.company_name = profile?.company_name || 'Our Company'
  variables.company_phone = profile?.company_phone || ''
  variables.company_email = profile?.company_email || ''
  
  // Links
  const baseUrl = Deno.env.get('PUBLIC_SITE_URL') || 'https://app.fixlify.com'
  variables.booking_link = `${baseUrl}/book`
  variables.review_link = `${baseUrl}/review`
  variables.payment_link = `${baseUrl}/pay`
  
  return variables
}

function replaceVariables(template: string, variables: Record<string, any>): string {
  let result = template
  
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g')
    result = result.replace(regex, String(value))
  })
  
  return result
}
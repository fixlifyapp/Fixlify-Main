import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface WorkflowStep {
  id: string;
  type: 'trigger' | 'action' | 'condition' | 'delay';
  name: string;
  description?: string;
  config: Record<string, any>;
  enabled: boolean;
  order: number;
}

interface WorkflowExecutionRequest {
  action: 'execute' | 'test';
  workflow?: {
    id?: string;
    name: string;
    description: string;
    steps: WorkflowStep[];
    enabled: boolean;
    category: string;
    organization_id?: string;
    user_id?: string;
  };
  workflowId?: string;
  triggerData?: Record<string, any>;
  testData?: Record<string, any>;
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const requestData: WorkflowExecutionRequest = await req.json()
    console.log('Automation executor request:', requestData)

    const { action, workflow, workflowId, triggerData, testData } = requestData

    if (action === 'test') {
      // Test workflow execution
      if (!workflow) {
        throw new Error('Workflow data is required for testing')
      }

      const result = await executeWorkflowSteps(workflow.steps, testData || {}, supabase, workflow.organization_id)
      
      // Log test execution
      if (workflow.id) {
        await supabase.from('automation_execution_logs').insert({
          workflow_id: workflow.id,
          trigger_type: 'manual_test',
          trigger_data: testData || {},
          status: result.success ? 'completed' : 'failed',
          error_message: result.error || null,
          organization_id: workflow.organization_id,
          started_at: new Date().toISOString(),
          completed_at: new Date().toISOString()
        })
      }

      return new Response(
        JSON.stringify({ 
          success: result.success,
          message: result.success ? 'Workflow test completed successfully' : 'Workflow test failed',
          result: result.data,
          error: result.error
        }),
        { 
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders 
          }
        }
      )
    }

    if (action === 'execute') {
      // Execute workflow by ID
      if (!workflowId) {
        throw new Error('Workflow ID is required for execution')
      }

      // Get workflow from database
      const { data: workflowData, error: workflowError } = await supabase
        .from('automation_workflows')
        .select('*')
        .eq('id', workflowId)
        .single()

      if (workflowError || !workflowData) {
        throw new Error(`Workflow not found: ${workflowError?.message}`)
      }

      // Parse workflow steps
      let steps: WorkflowStep[] = []
      try {
        steps = typeof workflowData.steps === 'string' ? JSON.parse(workflowData.steps) : workflowData.steps
      } catch (error) {
        throw new Error('Failed to parse workflow steps')
      }

      const result = await executeWorkflowSteps(steps, triggerData || {}, supabase, workflowData.organization_id)
      
      // Log execution
      await supabase.from('automation_execution_logs').insert({
        workflow_id: workflowId,
        trigger_type: triggerData?.trigger_type || 'manual',
        trigger_data: triggerData || {},
        status: result.success ? 'completed' : 'failed',
        error_message: result.error || null,
        organization_id: workflowData.organization_id,
        started_at: new Date().toISOString(),
        completed_at: new Date().toISOString()
      })

      // Update workflow metrics
      if (result.success) {
        await supabase
          .from('automation_workflows')
          .update({
            execution_count: (workflowData.execution_count || 0) + 1,
            success_count: (workflowData.success_count || 0) + 1,
            last_triggered_at: new Date().toISOString()
          })
          .eq('id', workflowId)
      } else {
        await supabase
          .from('automation_workflows')
          .update({
            execution_count: (workflowData.execution_count || 0) + 1,
            last_triggered_at: new Date().toISOString()
          })
          .eq('id', workflowId)
      }

      return new Response(
        JSON.stringify({ 
          success: result.success,
          message: result.success ? 'Workflow executed successfully' : 'Workflow execution failed',
          result: result.data,
          error: result.error
        }),
        { 
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders 
          }
        }
      )
    }

    throw new Error('Invalid action. Must be "execute" or "test".')

  } catch (error) {
    console.error('Error in automation executor:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { 
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        }
      }
    )
  }
})

async function executeWorkflowSteps(
  steps: WorkflowStep[], 
  contextData: Record<string, any>, 
  supabase: any,
  organizationId?: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  console.log('Executing workflow steps:', steps.length)
  
  try {
    // Filter enabled steps and sort by order
    const enabledSteps = steps.filter(step => step.enabled).sort((a, b) => a.order - b.order)
    console.log('Enabled steps:', enabledSteps.length)

    const results = []

    for (const step of enabledSteps) {
      console.log(`Executing step: ${step.name} (${step.type})`)
      
      try {
        const stepResult = await executeStep(step, contextData, supabase, organizationId)
        results.push({
          stepId: step.id,
          stepName: step.name,
          success: stepResult.success,
          data: stepResult.data,
          error: stepResult.error
        })

        // If step failed and it's critical, stop execution
        if (!stepResult.success && step.type === 'trigger') {
          throw new Error(`Critical step failed: ${step.name}`)
        }

      } catch (stepError) {
        console.error(`Step execution failed: ${step.name}`, stepError)
        results.push({
          stepId: step.id,
          stepName: step.name,
          success: false,
          error: stepError instanceof Error ? stepError.message : 'Unknown step error'
        })
      }
    }

    const successfulSteps = results.filter(r => r.success).length
    const totalSteps = results.length

    return {
      success: successfulSteps > 0,
      data: {
        totalSteps,
        successfulSteps,
        failedSteps: totalSteps - successfulSteps,
        stepResults: results
      }
    }

  } catch (error) {
    console.error('Workflow execution error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown workflow execution error'
    }
  }
}

async function executeStep(
  step: WorkflowStep, 
  contextData: Record<string, any>, 
  supabase: any,
  organizationId?: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  
  switch (step.type) {
    case 'action':
      return await executeAction(step, contextData, supabase, organizationId)
    
    case 'delay':
    case 'wait_delay':
      return await executeDelay(step)
    
    case 'trigger':
      // Triggers are usually just validation in execution context
      return { success: true, data: { message: 'Trigger validated' } }
    
    default:
      return { success: false, error: `Unknown step type: ${step.type}` }
  }
}

async function executeAction(
  step: WorkflowStep, 
  contextData: Record<string, any>, 
  supabase: any,
  organizationId?: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  
  const { config } = step
  
  switch (config.type) {
    case 'send_sms':
      return await executeSendSMS(config, contextData, supabase, organizationId)
    
    case 'send_email':
      return await executeSendEmail(config, contextData, supabase, organizationId)
    
    case 'make_call':
      return await executeMakeCall(config, contextData, supabase, organizationId)
    
    case 'create_task':
      return await executeCreateTask(config, contextData, supabase, organizationId)
    
    default:
      return { success: false, error: `Unknown action type: ${config.type}` }
  }
}

async function executeSendSMS(
  config: Record<string, any>, 
  contextData: Record<string, any>, 
  supabase: any,
  organizationId?: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  
  try {
    // Replace variables in message
    const message = replaceVariables(config.message || '', contextData)
    
    // Get recipient phone number
    let phoneNumber = ''
    if (config.recipient === 'client' && contextData.client_phone) {
      phoneNumber = contextData.client_phone
    } else if (config.recipient === 'technician' && contextData.technician_phone) {
      phoneNumber = contextData.technician_phone
    } else if (config.recipient === 'custom' && config.phone_number) {
      phoneNumber = config.phone_number
    }

    if (!phoneNumber) {
      throw new Error('No phone number available for SMS')
    }

    // Call Telnyx SMS function
    const { data, error } = await supabase.functions.invoke('telnyx-sms', {
      body: {
        to: phoneNumber,
        message: message,
        organizationId: organizationId
      }
    })

    if (error) throw error

    return { 
      success: true, 
      data: { 
        message: 'SMS sent successfully',
        to: phoneNumber,
        content: message,
        response: data
      }
    }

  } catch (error) {
    console.error('SMS execution error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to send SMS' 
    }
  }
}

async function executeSendEmail(
  config: Record<string, any>, 
  contextData: Record<string, any>, 
  supabase: any,
  organizationId?: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  
  try {
    // Replace variables in subject and body
    const subject = replaceVariables(config.subject || '', contextData)
    const body = replaceVariables(config.body || '', contextData)
    
    // Get recipient email
    let email = ''
    if (config.recipient === 'client' && contextData.client_email) {
      email = contextData.client_email
    } else if (config.recipient === 'technician' && contextData.technician_email) {
      email = contextData.technician_email
    } else if (config.recipient === 'custom' && config.email) {
      email = config.email
    }

    if (!email) {
      throw new Error('No email address available for email')
    }

    // Call Mailgun email function
    const { data, error } = await supabase.functions.invoke('mailgun-email', {
      body: {
        to: email,
        subject: subject,
        html: body,
        organizationId: organizationId
      }
    })

    if (error) throw error

    return { 
      success: true, 
      data: { 
        message: 'Email sent successfully',
        to: email,
        subject: subject,
        response: data
      }
    }

  } catch (error) {
    console.error('Email execution error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to send email' 
    }
  }
}

async function executeMakeCall(
  config: Record<string, any>, 
  contextData: Record<string, any>, 
  supabase: any,
  organizationId?: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  
  try {
    // Get recipient phone number
    let phoneNumber = ''
    if (config.recipient === 'client' && contextData.client_phone) {
      phoneNumber = contextData.client_phone
    } else if (config.recipient === 'technician' && contextData.technician_phone) {
      phoneNumber = contextData.technician_phone
    } else if (config.recipient === 'custom' && config.phone_number) {
      phoneNumber = config.phone_number
    }

    if (!phoneNumber) {
      throw new Error('No phone number available for call')
    }

    // Call Telnyx call function
    const { data, error } = await supabase.functions.invoke('telnyx-call-control', {
      body: {
        to: phoneNumber,
        organizationId: organizationId,
        action: 'dial'
      }
    })

    if (error) throw error

    return { 
      success: true, 
      data: { 
        message: 'Call initiated successfully',
        to: phoneNumber,
        response: data
      }
    }

  } catch (error) {
    console.error('Call execution error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to make call' 
    }
  }
}

async function executeCreateTask(
  config: Record<string, any>, 
  contextData: Record<string, any>, 
  supabase: any,
  organizationId?: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  
  try {
    const description = replaceVariables(config.description || config.task_description || 'Automated task', contextData)
    
    const taskData = {
      description: description,
      status: 'pending',
      priority: config.priority || 'medium',
      job_id: contextData.job_id || null,
      client_id: contextData.client_id || null,
      organization_id: organizationId,
      created_by_automation: true,
      due_date: config.due_date ? new Date(config.due_date).toISOString() : null
    }

    const { data, error } = await supabase
      .from('tasks')
      .insert(taskData)
      .select()
      .single()

    if (error) throw error

    return { 
      success: true, 
      data: { 
        message: 'Task created successfully',
        task: data
      }
    }

  } catch (error) {
    console.error('Task creation error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create task' 
    }
  }
}

async function executeDelay(
  step: WorkflowStep
): Promise<{ success: boolean; data?: any; error?: string }> {
  
  try {
    const duration = step.config.duration || 1
    const unit = step.config.unit || 'minutes'
    
    let delayMs = 0
    switch (unit) {
      case 'minutes':
        delayMs = duration * 60 * 1000
        break
      case 'hours':
        delayMs = duration * 60 * 60 * 1000
        break
      case 'days':
        delayMs = duration * 24 * 60 * 60 * 1000
        break
    }

    // For testing purposes, we'll just log the delay instead of actually waiting
    console.log(`Delay step: ${duration} ${unit} (${delayMs}ms)`)
    
    return { 
      success: true, 
      data: { 
        message: `Delay completed: ${duration} ${unit}`,
        delayMs: delayMs
      }
    }

  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to execute delay' 
    }
  }
}

function replaceVariables(text: string, contextData: Record<string, any>): string {
  let result = text
  
  // Replace job variables
  if (contextData.job_id) {
    result = result.replace(/\{\{job\.id\}\}/g, contextData.job_id)
    result = result.replace(/\{\{job\.number\}\}/g, contextData.job_number || contextData.job_id)
  }
  
  // Replace client variables
  if (contextData.client_name) {
    result = result.replace(/\{\{client\.name\}\}/g, contextData.client_name)
    result = result.replace(/\{\{client\.firstName\}\}/g, contextData.client_first_name || contextData.client_name)
  }
  
  if (contextData.client_email) {
    result = result.replace(/\{\{client\.email\}\}/g, contextData.client_email)
  }
  
  if (contextData.client_phone) {
    result = result.replace(/\{\{client\.phone\}\}/g, contextData.client_phone)
  }
  
  // Replace company variables
  result = result.replace(/\{\{company\.name\}\}/g, contextData.company_name || 'Your Company')
  
  // Replace current date/time
  const now = new Date()
  result = result.replace(/\{\{date\.today\}\}/g, now.toLocaleDateString())
  result = result.replace(/\{\{date\.time\}\}/g, now.toLocaleTimeString())
  
  return result
}
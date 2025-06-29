import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { type, record, old_record } = await req.json()

    // Handle different trigger types
    switch (type) {
      case 'INSERT':
        await handleInsert(record, supabase)
        break
      case 'UPDATE':
        await handleUpdate(record, old_record, supabase)
        break
      case 'DELETE':
        await handleDelete(old_record, supabase)
        break
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
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

async function handleInsert(record: any, supabase: any) {
  const triggers = await getTriggersForEvent(record, 'insert', supabase)
  
  for (const trigger of triggers) {
    await executeAutomation(trigger, record, 'insert', supabase)
  }
}

async function handleUpdate(record: any, oldRecord: any, supabase: any) {
  // Check for status changes
  if (record.status !== oldRecord.status) {
    const triggers = await getTriggersForStatusChange(
      record, 
      oldRecord.status, 
      record.status, 
      supabase
    )
    
    for (const trigger of triggers) {
      await executeAutomation(trigger, record, 'status_change', supabase)
    }
  }
  
  // Check for other updates
  const triggers = await getTriggersForEvent(record, 'update', supabase)
  
  for (const trigger of triggers) {
    await executeAutomation(trigger, record, 'update', supabase)
  }
}

async function handleDelete(record: any, supabase: any) {
  const triggers = await getTriggersForEvent(record, 'delete', supabase)
  
  for (const trigger of triggers) {
    await executeAutomation(trigger, record, 'delete', supabase)
  }
}

async function getTriggersForEvent(record: any, event: string, supabase: any) {
  let triggerType = ''
  
  // Determine trigger type based on table and event
  const tableName = record.table_name || detectTableFromRecord(record)
  
  switch (tableName) {
    case 'jobs':
      if (event === 'insert') triggerType = 'job_created'
      else if (event === 'update' && record.status === 'completed') triggerType = 'job_completed'
      else if (event === 'update' && record.status === 'scheduled') triggerType = 'job_scheduled'
      break
    case 'invoices':
      if (event === 'insert') triggerType = 'invoice_sent'
      else if (event === 'update' && record.status === 'paid') triggerType = 'payment_received'
      else if (event === 'update' && isOverdue(record)) triggerType = 'payment_overdue'
      break
    case 'estimates':
      if (event === 'insert') triggerType = 'estimate_sent'
      else if (event === 'update' && record.status === 'approved') triggerType = 'estimate_approved'
      break
    case 'clients':
      if (event === 'insert') triggerType = 'customer_created'
      break
  }
  
  if (!triggerType) return []
  
  // Get active workflows for this trigger
  const { data: workflows } = await supabase
    .from('automation_workflows')
    .select('*')
    .eq('trigger_type', triggerType)
    .eq('status', 'active')
    
  return workflows || []
}

async function getTriggersForStatusChange(record: any, oldStatus: string, newStatus: string, supabase: any) {
  const { data: workflows } = await supabase
    .from('automation_workflows')
    .select('*')
    .in('trigger_type', ['job_status_changed', 'job_status_to', 'job_status_from'])
    .eq('status', 'active')
    
  // Filter workflows based on status conditions
  return (workflows || []).filter((workflow: any) => {
    const conditions = workflow.trigger_config || {}
    
    if (workflow.trigger_type === 'job_status_changed') {
      return conditions.from_status === oldStatus && conditions.to_status === newStatus
    } else if (workflow.trigger_type === 'job_status_to') {
      return conditions.status === newStatus
    } else if (workflow.trigger_type === 'job_status_from') {
      return conditions.status === oldStatus
    }
    
    return false
  })
}

async function executeAutomation(workflow: any, record: any, triggerType: string, supabase: any) {
  // Call automation executor
  const response = await fetch(`${supabase.supabaseUrl}/functions/v1/automation-executor`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${supabase.supabaseKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      workflowId: workflow.id,
      triggeredBy: triggerType,
      entityId: record.id,
      entityType: detectEntityType(record),
      context: {
        userId: workflow.created_by,
        organizationId: workflow.organization_id,
        clientId: record.client_id || record.id
      }
    })
  })
  
  if (!response.ok) {
    console.error('Failed to execute automation:', await response.text())
  }
}

function detectTableFromRecord(record: any): string {
  // Detect table based on record properties
  if ('schedule_start' in record && 'technician_id' in record) return 'jobs'
  if ('invoice_number' in record && 'due_date' in record) return 'invoices'
  if ('estimate_number' in record) return 'estimates'
  if ('email' in record && 'address' in record && !('schedule_start' in record)) return 'clients'
  return ''
}

function detectEntityType(record: any): string {
  const table = detectTableFromRecord(record)
  switch (table) {
    case 'jobs': return 'job'
    case 'invoices': return 'invoice'
    case 'estimates': return 'estimate'
    case 'clients': return 'client'
    default: return 'unknown'
  }
}

function isOverdue(invoice: any): boolean {
  if (!invoice.due_date || invoice.status === 'paid') return false
  const dueDate = new Date(invoice.due_date)
  return dueDate < new Date()
}
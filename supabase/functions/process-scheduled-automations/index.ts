import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.5";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ScheduledAutomation {
  id: string;
  workflow_id: string;
  trigger_type: string;
  scheduled_time: string;
  trigger_data: any;
  status: string;
  organization_id?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    console.log('🕒 Processing scheduled automations...');

    const now = new Date().toISOString();
    
    // Get pending scheduled automations that are due
    const { data: scheduledAutomations, error: fetchError } = await supabase
      .from('automation_workflows')
      .select(`
        id,
        name,
        trigger_type,
        trigger_conditions,
        actions,
        status,
        organization_id,
        user_id
      `)
      .eq('status', 'active')
      .in('trigger_type', [
        'scheduled_time',
        'invoice_overdue', 
        'job_follow_up',
        'maintenance_reminder',
        'client_check_in'
      ]);

    if (fetchError) {
      console.error('❌ Error fetching scheduled automations:', fetchError);
      throw fetchError;
    }

    console.log(`📋 Found ${scheduledAutomations?.length || 0} active time-based workflows`);

    let processedCount = 0;
    let errors: any[] = [];

    if (scheduledAutomations && scheduledAutomations.length > 0) {
      for (const workflow of scheduledAutomations) {
        try {
          console.log(`🔄 Processing workflow: ${workflow.name} (${workflow.trigger_type})`);
          
          // Check if this workflow should be triggered now
          const shouldTrigger = await checkIfShouldTrigger(supabase, workflow, now);
          
          if (shouldTrigger) {
            // Execute the workflow by calling the automation-executor
            const executionResult = await supabase.functions.invoke('automation-executor', {
              body: {
                workflowId: workflow.id,
                triggerType: workflow.trigger_type,
                triggerData: shouldTrigger.triggerData,
                organizationId: workflow.organization_id
              }
            });

            if (executionResult.error) {
              console.error(`❌ Error executing workflow ${workflow.id}:`, executionResult.error);
              errors.push({ workflowId: workflow.id, error: executionResult.error });
            } else {
              console.log(`✅ Successfully executed workflow: ${workflow.name}`);
              processedCount++;
            }
          }
        } catch (error) {
          console.error(`❌ Error processing workflow ${workflow.id}:`, error);
          errors.push({ workflowId: workflow.id, error: error.message });
        }
      }
    }

    // Process overdue tasks
    await processOverdueTasks(supabase);

    const result = {
      success: true,
      processedCount,
      totalChecked: scheduledAutomations?.length || 0,
      errors: errors.length > 0 ? errors : undefined,
      timestamp: now
    };

    console.log('🎯 Scheduled automation processing complete:', result);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('💥 Critical error in scheduled automation processing:', error);
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
};

async function checkIfShouldTrigger(supabase: any, workflow: any, now: string): Promise<any> {
  const { trigger_type, trigger_conditions } = workflow;
  
  switch (trigger_type) {
    case 'scheduled_time':
      return checkScheduledTime(workflow, now);
    
    case 'invoice_overdue':
      return await checkInvoiceOverdue(supabase, workflow, now);
    
    case 'job_follow_up':
      return await checkJobFollowUp(supabase, workflow, now);
    
    case 'maintenance_reminder':
      return await checkMaintenanceReminder(supabase, workflow, now);
    
    case 'client_check_in':
      return await checkClientCheckIn(supabase, workflow, now);
    
    default:
      return null;
  }
}

function checkScheduledTime(workflow: any, now: string): any {
  const conditions = workflow.trigger_conditions || {};
  const scheduledTime = conditions.scheduled_time;
  
  if (!scheduledTime) return null;
  
  const nowDate = new Date(now);
  const scheduledDate = new Date(scheduledTime);
  
  // Check if it's time to trigger (within 1 minute window)
  const timeDiff = Math.abs(nowDate.getTime() - scheduledDate.getTime());
  if (timeDiff <= 60000) { // 1 minute tolerance
    return {
      triggerData: {
        scheduled_time: scheduledTime,
        actual_time: now,
        workflow_id: workflow.id
      }
    };
  }
  
  return null;
}

async function checkInvoiceOverdue(supabase: any, workflow: any, now: string): Promise<any> {
  const conditions = workflow.trigger_conditions || {};
  const daysOverdue = conditions.days_overdue || 7;
  
  const overdueDate = new Date();
  overdueDate.setDate(overdueDate.getDate() - daysOverdue);
  
  const { data: overdueInvoices } = await supabase
    .from('invoices')
    .select('*')
    .eq('status', 'sent')
    .lt('due_date', overdueDate.toISOString())
    .eq('user_id', workflow.user_id);
  
  if (overdueInvoices && overdueInvoices.length > 0) {
    return {
      triggerData: {
        overdue_invoices: overdueInvoices,
        days_overdue: daysOverdue,
        check_time: now
      }
    };
  }
  
  return null;
}

async function checkJobFollowUp(supabase: any, workflow: any, now: string): Promise<any> {
  const conditions = workflow.trigger_conditions || {};
  const daysAfterCompletion = conditions.days_after_completion || 3;
  
  const followUpDate = new Date();
  followUpDate.setDate(followUpDate.getDate() - daysAfterCompletion);
  
  const { data: completedJobs } = await supabase
    .from('jobs')
    .select('*')
    .eq('status', 'completed')
    .gte('updated_at', followUpDate.toISOString())
    .eq('user_id', workflow.user_id);
  
  if (completedJobs && completedJobs.length > 0) {
    return {
      triggerData: {
        completed_jobs: completedJobs,
        days_after_completion: daysAfterCompletion,
        check_time: now
      }
    };
  }
  
  return null;
}

async function checkMaintenanceReminder(supabase: any, workflow: any, now: string): Promise<any> {
  const conditions = workflow.trigger_conditions || {};
  const monthsAfterLastService = conditions.months_after_last_service || 6;
  
  const reminderDate = new Date();
  reminderDate.setMonth(reminderDate.getMonth() - monthsAfterLastService);
  
  const { data: maintenanceJobs } = await supabase
    .from('jobs')
    .select('*, clients(*)')
    .contains('tags', ['maintenance'])
    .lt('updated_at', reminderDate.toISOString())
    .eq('user_id', workflow.user_id);
  
  if (maintenanceJobs && maintenanceJobs.length > 0) {
    return {
      triggerData: {
        maintenance_due: maintenanceJobs,
        months_since_service: monthsAfterLastService,
        check_time: now
      }
    };
  }
  
  return null;
}

async function checkClientCheckIn(supabase: any, workflow: any, now: string): Promise<any> {
  const conditions = workflow.trigger_conditions || {};
  const daysSinceContact = conditions.days_since_contact || 30;
  
  const checkInDate = new Date();
  checkInDate.setDate(checkInDate.getDate() - daysSinceContact);
  
  const { data: clientsNeedingCheckIn } = await supabase
    .from('clients')
    .select('*')
    .lt('updated_at', checkInDate.toISOString())
    .eq('user_id', workflow.user_id);
  
  if (clientsNeedingCheckIn && clientsNeedingCheckIn.length > 0) {
    return {
      triggerData: {
        clients_needing_check_in: clientsNeedingCheckIn,
        days_since_contact: daysSinceContact,
        check_time: now
      }
    };
  }
  
  return null;
}

async function processOverdueTasks(supabase: any): Promise<void> {
  try {
    const { data: overdueTasks } = await supabase
      .from('tasks')
      .select('*')
      .not('status', 'in', '(completed,cancelled)')
      .lt('due_date', new Date().toISOString());
    
    if (overdueTasks && overdueTasks.length > 0) {
      console.log(`📅 Found ${overdueTasks.length} overdue tasks`);
      
      // Call the check_overdue_tasks function
      const { error } = await supabase.rpc('check_overdue_tasks');
      
      if (error) {
        console.error('❌ Error calling check_overdue_tasks:', error);
      } else {
        console.log('✅ Successfully processed overdue tasks');
      }
    }
  } catch (error) {
    console.error('❌ Error processing overdue tasks:', error);
  }
}

serve(handler);
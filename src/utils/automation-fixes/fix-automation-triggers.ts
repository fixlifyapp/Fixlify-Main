import { supabase } from "@/integrations/supabase/client";

/**
 * Fix automation triggers that are not executing
 * Main issues:
 * 1. Automation workflows have no steps defined (steps: [])
 * 2. Pending logs are created but not processed
 * 3. Database triggers create logs but don't execute actions
 */

export async function fixAutomationTriggers() {
  console.log('🔧 Fixing automation triggers...');
  
  try {
    // Step 1: Add a default email action to the "Job completed" workflow
    const { data: workflow, error: fetchError } = await supabase
      .from('automation_workflows')
      .select('*')
      .eq('id', 'a1e7e5e0-76ef-464f-9b65-ba941a5e5ecd')
      .single();
      
    if (fetchError) {
      console.error('Error fetching workflow:', fetchError);
      return { success: false, error: fetchError.message };
    }
    
    if (!workflow) {
      console.error('Workflow not found');
      return { success: false, error: 'Workflow not found' };
    }
    
    console.log('Current workflow:', workflow);
    
    // Define the email action step
    const emailActionStep = {
      id: 'action-1',
      type: 'action',
      subType: 'email',
      name: 'Send Job Completion Email',
      config: {
        subject: 'Job {{job.title}} Completed',
        body: `
          <h2>Job Completed Successfully!</h2>
          <p>Dear {{client.firstName}} {{client.lastName}},</p>
          <p>We're pleased to inform you that your job has been completed.</p>
          <br>
          <p><strong>Job Details:</strong></p>
          <ul>
            <li>Job ID: {{job.id}}</li>
            <li>Title: {{job.title}}</li>
            <li>Status: {{job.status}}</li>
            <li>Completion Date: {{job.completedAt}}</li>
          </ul>
          <br>
          <p>Thank you for choosing {{company.name}}!</p>
          <br>
          <p>Best regards,<br>{{company.name}} Team</p>
        `,
        sendToClient: true
      }
    };
    
    // Update the workflow with the email action step
    const { error: updateError } = await supabase
      .from('automation_workflows')
      .update({ 
        steps: [emailActionStep],
        updated_at: new Date().toISOString()
      })
      .eq('id', workflow.id);
      
    if (updateError) {
      console.error('Error updating workflow:', updateError);
      return { success: false, error: updateError.message };
    }
    
    console.log('✅ Updated workflow with email action step');
    
    // Step 2: Process existing pending automation logs
    const { data: pendingLogs, error: logsError } = await supabase
      .from('automation_execution_logs')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true });
      
    if (logsError) {
      console.error('Error fetching pending logs:', logsError);
      return { success: false, error: logsError.message };
    }
    
    console.log(`Found ${pendingLogs?.length || 0} pending automation logs`);
    
    return { 
      success: true, 
      message: 'Automation triggers fixed successfully',
      pendingCount: pendingLogs?.length || 0
    };
    
  } catch (error) {
    console.error('Error fixing automation triggers:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Process all pending automation logs
 */
export async function processPendingAutomationLogs() {
  console.log('🔄 Processing pending automation logs...');
  
  try {
    // Get pending logs
    const { data: pendingLogs, error: fetchError } = await supabase
      .from('automation_execution_logs')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(10); // Process 10 at a time
      
    if (fetchError) {
      console.error('Error fetching pending logs:', fetchError);
      return { success: false, error: fetchError.message };
    }
    
    if (!pendingLogs || pendingLogs.length === 0) {
      console.log('No pending logs to process');
      return { success: true, processed: 0 };
    }
    
    let processed = 0;
    let failed = 0;
    
    for (const log of pendingLogs) {
      try {
        console.log(`Processing log ${log.id} for workflow ${log.workflow_id}`);
        
        // Call the automation executor edge function
        const { data, error } = await supabase.functions.invoke('automation-executor', {
          body: {
            workflowId: log.workflow_id,
            context: log.trigger_data
          }
        });
        
        if (error) {
          throw error;
        }
        
        // Update log status to completed
        await supabase
          .from('automation_execution_logs')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
            actions_executed: data?.results || []
          })
          .eq('id', log.id);
          
        processed++;
        console.log(`✅ Processed log ${log.id}`);
        
      } catch (error) {
        console.error(`❌ Error processing log ${log.id}:`, error);
        
        // Update log status to failed
        await supabase
          .from('automation_execution_logs')
          .update({
            status: 'failed',
            error_message: error instanceof Error ? error.message : 'Unknown error',
            completed_at: new Date().toISOString()
          })
          .eq('id', log.id);
          
        failed++;
      }
    }
    
    console.log(`✅ Processing complete. Processed: ${processed}, Failed: ${failed}`);
    
    return {
      success: true,
      processed,
      failed,
      total: pendingLogs.length
    };
    
  } catch (error) {
    console.error('Error processing pending logs:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Create a test automation workflow for job creation
 */
export async function createJobCreationAutomation(userId: string) {
  console.log('📧 Creating job creation automation...');
  
  try {
    const workflowData = {
      user_id: userId,
      name: 'Welcome New Job',
      description: 'Send email when a new job is created',
      trigger_type: 'job_created',
      trigger_config: {
        triggerType: 'job_created'
      },
      steps: [{
        id: 'action-1',
        type: 'action',
        subType: 'email',
        name: 'Send Welcome Email',
        config: {
          subject: 'New Job Created: {{job.title}}',
          body: `
            <h2>New Job Created</h2>
            <p>Hello {{client.firstName}},</p>
            <p>We've created a new job for you:</p>
            <br>
            <p><strong>Job Details:</strong></p>
            <ul>
              <li>Job ID: {{job.id}}</li>
              <li>Title: {{job.title}}</li>
              <li>Scheduled: {{job.scheduledDate}}</li>
              <li>Address: {{job.address}}</li>
            </ul>
            <br>
            <p>We'll keep you updated on the progress.</p>
            <br>
            <p>Best regards,<br>{{company.name}} Team</p>
          `,
          sendToClient: true
        }
      }],
      is_active: true,
      status: 'active'
    };
    
    const { data, error } = await supabase
      .from('automation_workflows')
      .insert(workflowData)
      .select()
      .single();
      
    if (error) {
      console.error('Error creating workflow:', error);
      return { success: false, error: error.message };
    }
    
    console.log('✅ Created job creation automation:', data);
    
    return {
      success: true,
      workflow: data
    };
    
  } catch (error) {
    console.error('Error creating job creation automation:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

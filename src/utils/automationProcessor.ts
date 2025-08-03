import { supabase } from "@/integrations/supabase/client";

export interface ProcessAutomationResult {
  success: boolean;
  processed: number;
  failed: number;
  errors: string[];
}

/**
 * Process all pending automation execution logs
 * This function will call the automation-executor edge function for each pending log
 */
export async function processPendingAutomations(): Promise<ProcessAutomationResult> {
  const result: ProcessAutomationResult = {
    success: true,
    processed: 0,
    failed: 0,
    errors: []
  };

  try {
    // Get all pending automation logs
    const { data: pendingLogs, error: fetchError } = await supabase
      .from('automation_execution_logs')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(50);

    if (fetchError) {
      console.error('Error fetching pending automation logs:', fetchError);
      result.success = false;
      result.errors.push(fetchError.message);
      return result;
    }

    if (!pendingLogs || pendingLogs.length === 0) {
      console.log('No pending automation logs found');
      return result;
    }

    console.log(`Found ${pendingLogs.length} pending automation logs to process`);

    // Process each pending log
    for (const log of pendingLogs) {
      try {
        console.log(`Processing automation log: ${log.id} for workflow: ${log.workflow_id}`);
        
        // Update status to running
        await supabase
          .from('automation_execution_logs')
          .update({ status: 'running', started_at: new Date().toISOString() })
          .eq('id', log.id);

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

        // Update status to completed
        await supabase
          .from('automation_execution_logs')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
            actions_executed: data?.results || []
          })
          .eq('id', log.id);

        result.processed++;
        console.log(`Successfully processed automation log: ${log.id}`);
      } catch (error) {
        console.error(`Error processing automation log ${log.id}:`, error);
        
        // Update status to failed
        await supabase
          .from('automation_execution_logs')
          .update({
            status: 'failed',
            completed_at: new Date().toISOString(),
            error_message: error instanceof Error ? error.message : 'Unknown error'
          })
          .eq('id', log.id);

        result.failed++;
        result.errors.push(`Log ${log.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    console.log(`Automation processing complete. Processed: ${result.processed}, Failed: ${result.failed}`);
  } catch (error) {
    console.error('Error in processPendingAutomations:', error);
    result.success = false;
    result.errors.push(error instanceof Error ? error.message : 'Unknown error');
  }

  return result;
}

/**
 * Process automation logs for a specific workflow
 */
export async function processWorkflowAutomations(workflowId: string): Promise<ProcessAutomationResult> {
  const result: ProcessAutomationResult = {
    success: true,
    processed: 0,
    failed: 0,
    errors: []
  };

  try {
    // Get pending automation logs for this workflow
    const { data: pendingLogs, error: fetchError } = await supabase
      .from('automation_execution_logs')
      .select('*')
      .eq('status', 'pending')
      .eq('workflow_id', workflowId)
      .order('created_at', { ascending: true });

    if (fetchError) {
      console.error('Error fetching workflow automation logs:', fetchError);
      result.success = false;
      result.errors.push(fetchError.message);
      return result;
    }

    if (!pendingLogs || pendingLogs.length === 0) {
      console.log('No pending automation logs found for workflow:', workflowId);
      return result;
    }

    console.log(`Found ${pendingLogs.length} pending logs for workflow ${workflowId}`);

    // Process each log
    for (const log of pendingLogs) {
      try {
        const { data, error } = await supabase.functions.invoke('automation-executor', {
          body: {
            workflowId: log.workflow_id,
            context: log.trigger_data
          }
        });

        if (error) throw error;

        await supabase
          .from('automation_execution_logs')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
            actions_executed: data?.results || []
          })
          .eq('id', log.id);

        result.processed++;
      } catch (error) {
        await supabase
          .from('automation_execution_logs')
          .update({
            status: 'failed',
            completed_at: new Date().toISOString(),
            error_message: error instanceof Error ? error.message : 'Unknown error'
          })
          .eq('id', log.id);

        result.failed++;
        result.errors.push(`Log ${log.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  } catch (error) {
    result.success = false;
    result.errors.push(error instanceof Error ? error.message : 'Unknown error');
  }

  return result;
}

/**
 * Manually trigger an automation workflow
 */
export async function triggerAutomationManually(workflowId: string, testData: any = {}): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  try {
    console.log('Manually triggering automation:', workflowId);
    
    // Call the automation executor directly
    const { data, error } = await supabase.functions.invoke('automation-executor', {
      body: {
        workflowId,
        context: {
          triggerType: 'manual_test',
          testMode: true,
          timestamp: new Date().toISOString(),
          ...testData
        }
      }
    });

    if (error) {
      console.error('Error triggering automation:', error);
      return {
        success: false,
        error: error.message
      };
    }

    console.log('Automation triggered successfully:', data);
    return {
      success: true,
      message: 'Automation triggered successfully'
    };
  } catch (error) {
    console.error('Error in triggerAutomationManually:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

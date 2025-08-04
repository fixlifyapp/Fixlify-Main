import { supabase } from "@/integrations/supabase/client";

class AutomationProcessorService {
  private processingInterval: NodeJS.Timeout | null = null;
  private isProcessing = false;
  private processedLogIds = new Set<string>(); // Track processed logs to avoid duplicates

  /**
   * Start the automation processor
   * Runs every 30 seconds to process pending automations
   */
  start() {
    console.log('🚀 Starting automation processor service...');
    
    // Clear processed logs on start
    this.processedLogIds.clear();
    
    // Process immediately on start
    this.processPending();
    
    // Then process every 30 seconds
    this.processingInterval = setInterval(() => {
      this.processPending();
    }, 30000); // 30 seconds
  }

  /**
   * Stop the automation processor
   */
  stop() {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }
    console.log('🛑 Automation processor service stopped');
  }

  /**
   * Process pending automation logs
   */
  private async processPending() {
    // Prevent multiple simultaneous processing
    if (this.isProcessing) {
      return;
    }

    this.isProcessing = true;

    try {
      // Get all pending logs (remove time restriction to process stuck logs)
      const { data: pendingLogs, error: fetchError } = await supabase
        .from('automation_execution_logs')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: true })
        .limit(10);

      if (fetchError) {
        console.error('Error fetching pending logs:', fetchError);
        return;
      }

      if (!pendingLogs || pendingLogs.length === 0) {
        console.log('✅ No pending automations found');
        return; // No pending logs
      }

      console.log(`📋 Found ${pendingLogs.length} pending automations to process...`);

      // Process each log
      for (const log of pendingLogs) {
        // Skip if already processed in this session
        if (this.processedLogIds.has(log.id)) {
          console.log(`⏭️ Skipping already processed log ${log.id}`);
          continue;
        }
        
        await this.processLog(log);
        this.processedLogIds.add(log.id);
      }
    } catch (error) {
      console.error('Error in automation processor:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Process a single automation log
   */
  private async processLog(log: any) {
    try {
      console.log(`⚙️ Processing automation log ${log.id}`);

      // Check if workflow has steps defined
      const { data: workflow, error: workflowError } = await supabase
        .from('automation_workflows')
        .select('steps')
        .eq('id', log.workflow_id)
        .single();

      if (workflowError || !workflow) {
        console.error('Workflow not found:', log.workflow_id);
        await this.markLogFailed(log.id, 'Workflow not found');
        return;
      }

      // Skip if workflow has no steps
      if (!workflow.steps || workflow.steps.length === 0) {
        console.log(`⚠️ Workflow ${log.workflow_id} has no steps defined`);
        await this.markLogFailed(log.id, 'Workflow has no actions defined');
        return;
      }

      // Update status to running
      await supabase
        .from('automation_execution_logs')
        .update({ 
          status: 'running',
          started_at: new Date().toISOString()
        })
        .eq('id', log.id);

      // Call the automation executor edge function
      const { data, error } = await supabase.functions.invoke('automation-executor', {
        body: {
          workflowId: log.workflow_id,
          executionId: log.id,
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

      // Update workflow success count
      await supabase.rpc('increment', {
        table_name: 'automation_workflows',
        column_name: 'success_count',
        row_id: log.workflow_id
      }).catch(() => {}); // Ignore error if RPC doesn't exist

      console.log(`✅ Successfully processed automation log ${log.id}`);
    } catch (error) {
      console.error(`❌ Error processing log ${log.id}:`, error);
      await this.markLogFailed(log.id, error instanceof Error ? error.message : 'Unknown error');
    }
  }

  /**
   * Mark a log as failed
   */
  private async markLogFailed(logId: string, errorMessage: string) {
    await supabase
      .from('automation_execution_logs')
      .update({
        status: 'failed',
        completed_at: new Date().toISOString(),
        error_message: errorMessage
      })
      .eq('id', logId);
  }

  /**
   * Manually trigger processing of pending automations
   */
  async processNow() {
    console.log('🔄 Manually triggering automation processing...');
    await this.processPending();
  }

  /**
   * Clear old pending logs (older than 1 hour)
   * This prevents processing very old logs that might cause issues
   */
  async clearOldPendingLogs() {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    
    const { error } = await supabase
      .from('automation_execution_logs')
      .update({
        status: 'expired',
        error_message: 'Automation expired - not processed within 1 hour'
      })
      .eq('status', 'pending')
      .lt('created_at', oneHourAgo);

    if (!error) {
      console.log('🧹 Cleared old pending automation logs');
    }
  }
}

// Create singleton instance
export const automationProcessor = new AutomationProcessorService();

// Auto-start when imported (can be disabled if needed)
if (typeof window !== 'undefined') {
  // Only run in browser environment
  automationProcessor.start();
  
  // Clear old logs on start
  automationProcessor.clearOldPendingLogs();
  
  // Stop when page unloads
  window.addEventListener('beforeunload', () => {
    automationProcessor.stop();
  });
}

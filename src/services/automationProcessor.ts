import { supabase } from '@/integrations/supabase/client';

export class AutomationProcessor {
  private static isProcessing = false;
  private static intervalId: number | null = null;

  static async startEngine() {
    if (this.isProcessing) {
      console.log('Automation engine already running');
      return;
    }

    this.isProcessing = true;
    console.log('🚀 Starting automation engine...');

    // Process pending automations every 5 seconds
    this.intervalId = window.setInterval(async () => {
      await this.processPendingAutomations();
    }, 5000);

    // Process immediately on start
    await this.processPendingAutomations();
  }

  static async stopEngine() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isProcessing = false;
    console.log('🛑 Automation engine stopped');
  }

  static isRunning() {
    return this.isProcessing;
  }

  private static async processPendingAutomations() {
    if (!this.isProcessing) return;

    try {
      console.log('🔄 Checking for pending automations...');

      // Get pending automation logs
      const { data: pendingLogs, error } = await supabase
        .from('automation_execution_logs')
        .select('*')
        .eq('status', 'pending')
        .order('started_at', { ascending: true })
        .limit(5);

      if (error) {
        console.error('Error fetching pending automations:', error);
        return;
      }

      if (!pendingLogs || pendingLogs.length === 0) {
        console.log('No pending automations found');
        return;
      }

      console.log(`Found ${pendingLogs.length} pending automations`);

      // Process each pending automation
      for (const log of pendingLogs) {
        try {
          console.log('Processing automation:', log.id, 'Workflow:', log.workflow_id);

          // Call the automation executor edge function
          const { data, error } = await supabase.functions.invoke('automation-executor', {
            body: {
              workflowId: log.workflow_id,
              context: log.trigger_data
            }
          });

          if (error) {
            console.error('Error executing automation:', error);
            // Update log to failed
            await supabase
              .from('automation_execution_logs')
              .update({
                status: 'failed',
                completed_at: new Date().toISOString(),
                error_message: error.message
              })
              .eq('id', log.id);
          } else {
            console.log('Automation executed successfully:', data);
            // Update log to completed
            await supabase
              .from('automation_execution_logs')
              .update({
                status: 'completed',
                completed_at: new Date().toISOString(),
                actions_executed: data?.results || []
              })
              .eq('id', log.id);
          }
        } catch (err) {
          console.error('Error processing automation log:', err);
          // Update log to failed
          await supabase
            .from('automation_execution_logs')
            .update({
              status: 'failed',
              completed_at: new Date().toISOString(),
              error_message: err.message || 'Unknown error'
            })
            .eq('id', log.id);
        }
      }
    } catch (error) {
      console.error('Error in automation processor:', error);
    }
  }
}

// Auto-start the engine when the module loads
if (typeof window !== 'undefined') {
  // Start engine after a short delay to ensure everything is loaded
  setTimeout(() => {
    AutomationProcessor.startEngine();
  }, 2000);
}
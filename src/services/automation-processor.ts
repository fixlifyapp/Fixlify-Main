import { supabase } from '@/integrations/supabase/client';

export class AutomationProcessor {
  private processingInterval: NodeJS.Timeout | null = null;
  private isProcessing = false;

  start() {
    if (this.processingInterval) {
      console.log('🔄 Automation processor already running');
      return;
    }

    console.log('🚀 Starting automation processor...');
    this.processingInterval = setInterval(() => {
      this.processPendingAutomations();
    }, 5000); // Check every 5 seconds

    // Process immediately on start
    this.processPendingAutomations();
  }

  stop() {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
      console.log('⏹️ Automation processor stopped');
    }
  }

  private async processPendingAutomations() {
    if (this.isProcessing) {
      console.log('⏳ Already processing automations, skipping...');
      return;
    }

    this.isProcessing = true;

    try {
      console.log('🔄 Checking for pending automations...');

      // Get pending automation logs
      const { data: pendingLogs, error: logsError } = await supabase
        .from('automation_execution_logs')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: true })
        .limit(5);

      if (logsError) {
        console.error('❌ Error fetching pending logs:', logsError);
        return;
      }

      if (!pendingLogs || pendingLogs.length === 0) {
        console.log('📭 No pending automations found');
        return;
      }

      console.log(`📋 Found ${pendingLogs.length} pending automations`);

      for (const log of pendingLogs) {
        try {
          await this.processAutomationLog(log);
        } catch (error) {
          console.error(`❌ Error processing automation ${log.id}:`, error);
          
          // Mark as failed
          await supabase
            .from('automation_execution_logs')
            .update({
              status: 'failed',
              error_message: error instanceof Error ? error.message : 'Unknown error',
              completed_at: new Date().toISOString()
            })
            .eq('id', log.id);
        }
      }
    } catch (error) {
      console.error('❌ Error in processPendingAutomations:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  private async processAutomationLog(log: any) {
    console.log(`Processing automation: ${log.id} Workflow: ${log.workflow_id}`);

    // Update status to running
    await supabase
      .from('automation_execution_logs')
      .update({
        status: 'running',
        started_at: new Date().toISOString()
      })
      .eq('id', log.id);

    try {
      // Call the automation executor edge function
      const { data, error } = await supabase.functions.invoke('automation-executor', {
        body: {
          workflowId: log.workflow_id,
          context: log.trigger_data,
          executionId: log.id
        }
      });

      if (error) {
        throw error;
      }

      console.log('✅ Automation executed successfully:', data);

      // Mark as completed
      await supabase
        .from('automation_execution_logs')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          actions_executed: data?.results || []
        })
        .eq('id', log.id);

    } catch (error) {
      console.error('❌ Error executing automation:', error);
      throw error;
    }
  }
}

// Global processor instance
export const automationProcessor = new AutomationProcessor();
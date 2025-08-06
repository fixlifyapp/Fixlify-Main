import { supabase } from "@/integrations/supabase/client";

interface WorkflowValidation {
  isValid: boolean;
  error?: string;
  normalizedSteps?: any[];
}

class AutomationProcessorService {
  private processingInterval: NodeJS.Timeout | null = null;
  private isProcessing = false;
  private processedLogIds = new Set<string>(); // Track processed logs to avoid duplicates
  private workflowCache = new Map<string, { workflow: any; cachedAt: number }>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Start the automation processor
   * Runs every 30 seconds to process pending automations
   */
  start() {
    console.log('🚀 Starting automation processor service...');
    
    // Clear processed logs on start
    this.processedLogIds.clear();
    this.workflowCache.clear();
    
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
   * Get cached workflow or fetch from database
   */
  private async getCachedWorkflow(workflowId: string) {
    const cached = this.workflowCache.get(workflowId);
    const now = Date.now();
    
    if (cached && (now - cached.cachedAt) < this.CACHE_TTL) {
      return cached.workflow;
    }
    
    // Fetch fresh workflow
    const { data: workflow, error } = await supabase
      .from('automation_workflows')
      .select('*')
      .eq('id', workflowId)
      .single();
    
    if (!error && workflow) {
      this.workflowCache.set(workflowId, { workflow, cachedAt: now });
    }
    
    return workflow;
  }

  /**
   * Validate workflow configuration
   */
  private async validateWorkflow(workflowId: string): Promise<WorkflowValidation> {
    try {
      const workflow = await this.getCachedWorkflow(workflowId);
      
      if (!workflow) {
        return { 
          isValid: false, 
          error: 'Workflow not found' 
        };
      }

      // Check if workflow is active
      if (!workflow.is_active || workflow.status !== 'active') {
        return { 
          isValid: false, 
          error: `Workflow is not active (status: ${workflow.status})` 
        };
      }

      // Normalize and validate steps
      const steps = this.normalizeWorkflowSteps(workflow);
      
      if (!steps || steps.length === 0) {
        return { 
          isValid: false, 
          error: 'Workflow has no actions defined' 
        };
      }

      // Filter out non-executable steps (like triggers)
      const executableSteps = steps.filter((step: any) => 
        step.type !== 'trigger' && step.type !== 'unknown'
      );

      if (executableSteps.length === 0) {
        return { 
          isValid: false, 
          error: 'Workflow has no executable actions' 
        };
      }

      return { 
        isValid: true, 
        normalizedSteps: steps 
      };
    } catch (error) {
      return { 
        isValid: false, 
        error: `Validation error: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  }

  /**
   * Normalize workflow steps from different possible locations
   */
  private normalizeWorkflowSteps(workflow: any): any[] {
    // Check multiple possible locations for steps
    return workflow.steps || 
           workflow.template_config?.steps || 
           workflow.workflow_config?.steps || 
           [];
  }

  /**
   * Process pending automation logs
   */
  private async processPending() {
    // Prevent multiple simultaneous processing
    if (this.isProcessing) {
      console.log('⏸️ Processing already in progress, skipping...');
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
        // Don't log this every 30 seconds, it's too noisy
        return;
      }

      console.log(`📋 Found ${pendingLogs.length} pending automations to process...`);

      // Group logs by workflow and job to detect duplicates
      const logGroups = new Map<string, typeof pendingLogs>();
      
      for (const log of pendingLogs) {
        const key = `${log.workflow_id}-${log.trigger_data?.job_id || ''}-${log.trigger_data?.new_status || ''}`;
        if (!logGroups.has(key)) {
          logGroups.set(key, []);
        }
        logGroups.get(key)!.push(log);
      }
      
      // Process only one log per group (the oldest one)
      const logsToProcess = [];
      for (const [key, logs] of logGroups) {
        if (logs.length > 1) {
          console.log(`⚠️ Found ${logs.length} duplicate logs for ${key}, processing only the oldest`);
          // Mark duplicates as skipped
          for (let i = 1; i < logs.length; i++) {
            await supabase
              .from('automation_execution_logs')
              .update({
                status: 'skipped',
                completed_at: new Date().toISOString(),
                error_message: 'Duplicate automation detected and skipped'
              })
              .eq('id', logs[i].id);
          }
        }
        logsToProcess.push(logs[0]); // Process the oldest one
      }

      // Process logs sequentially to avoid race conditions
      for (const log of logsToProcess) {
        // Skip if already processed in this session
        if (this.processedLogIds.has(log.id)) {
          console.log(`⏭️ Skipping already processed log ${log.id}`);
          continue;
        }
        
        await this.processLog(log);
      }

    } catch (error) {
      console.error('Error in automation processor:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Process a single automation log with validation
   */
  private async processLog(log: any) {
    const startTime = Date.now();
    
    try {
      console.log(`⚙️ Processing automation log ${log.id}`);
      
      // Mark as processed immediately to avoid reprocessing
      this.processedLogIds.add(log.id);

      // Validate workflow before execution
      const validation = await this.validateWorkflow(log.workflow_id);
      
      if (!validation.isValid) {
        console.error(`❌ Workflow validation failed: ${validation.error}`);
        await this.markLogFailed(log.id, validation.error || 'Workflow validation failed');
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

      const executionTime = Date.now() - startTime;

      // Update status to completed with execution time
      await supabase
        .from('automation_execution_logs')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          actions_executed: data?.results || [],
          details: {
            ...log.details,
            execution_time_ms: executionTime
          }
        })
        .eq('id', log.id);

      // Update workflow metrics
      await this.updateWorkflowMetrics(log.workflow_id, true);

      console.log(`✅ Successfully processed automation log ${log.id} in ${executionTime}ms`);
    } catch (error) {
      const executionTime = Date.now() - startTime;
      console.error(`❌ Error processing log ${log.id}:`, error);
      
      // Check if this is a retryable error
      const isRetryable = this.isRetryableError(error);
      
      await this.markLogFailed(
        log.id, 
        error instanceof Error ? error.message : 'Unknown error',
        isRetryable,
        executionTime
      );
      
      // Update workflow metrics
      await this.updateWorkflowMetrics(log.workflow_id, false);
    }
  }

  /**
   * Check if an error is retryable
   */
  private isRetryableError(error: any): boolean {
    const errorMessage = error?.message || '';
    
    // Network/timeout errors are retryable
    if (errorMessage.includes('network') || 
        errorMessage.includes('timeout') ||
        errorMessage.includes('fetch')) {
      return true;
    }
    
    // Rate limit errors are retryable
    if (errorMessage.includes('rate limit') || 
        errorMessage.includes('too many requests')) {
      return true;
    }
    
    // Temporary service errors
    if (errorMessage.includes('service unavailable') ||
        errorMessage.includes('internal server error')) {
      return true;
    }
    
    return false;
  }

  /**
   * Mark a log as failed with retry support
   */
  private async markLogFailed(
    logId: string, 
    errorMessage: string, 
    isRetryable: boolean = false,
    executionTime?: number
  ) {
    const { data: log } = await supabase
      .from('automation_execution_logs')
      .select('details')
      .eq('id', logId)
      .single();
    
    const retryCount = log?.details?.retry_count || 0;
    const maxRetries = 3;
    
    // If retryable and under retry limit, mark for retry
    if (isRetryable && retryCount < maxRetries) {
      await supabase
        .from('automation_execution_logs')
        .update({
          status: 'pending', // Back to pending for retry
          error_message: `${errorMessage} (Retry ${retryCount + 1}/${maxRetries})`,
          details: {
            ...log?.details,
            retry_count: retryCount + 1,
            last_error: errorMessage,
            last_execution_time_ms: executionTime
          }
        })
        .eq('id', logId);
      
      // Remove from processed IDs so it can be retried
      this.processedLogIds.delete(logId);
    } else {
      // Final failure
      await supabase
        .from('automation_execution_logs')
        .update({
          status: 'failed',
          completed_at: new Date().toISOString(),
          error_message: errorMessage,
          details: {
            ...log?.details,
            final_retry_count: retryCount,
            execution_time_ms: executionTime
          }
        })
        .eq('id', logId);
    }
  }

  /**
   * Update workflow metrics
   */
  private async updateWorkflowMetrics(workflowId: string, success: boolean) {
    try {
      // Try RPC first
      await supabase.rpc('increment_automation_metrics', {
        workflow_id: workflowId,
        success: success
      });
    } catch (error) {
      // Fallback to direct update if RPC doesn't exist
      try {
        const { data: workflow } = await supabase
          .from('automation_workflows')
          .select('execution_count, success_count')
          .eq('id', workflowId)
          .single();
        
        if (workflow) {
          await supabase
            .from('automation_workflows')
            .update({
              execution_count: (workflow.execution_count || 0) + 1,
              success_count: (workflow.success_count || 0) + (success ? 1 : 0),
              last_triggered_at: new Date().toISOString()
            })
            .eq('id', workflowId);
        }
      } catch (updateError) {
        console.warn('Failed to update workflow metrics:', updateError);
      }
    }
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

  /**
   * Get processor health status
   */
  async getHealthStatus() {
    const { data: pendingCount } = await supabase
      .from('automation_execution_logs')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending');
    
    const { data: failedCount } = await supabase
      .from('automation_execution_logs')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'failed')
      .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString());
    
    return {
      isRunning: this.processingInterval !== null,
      isProcessing: this.isProcessing,
      pendingCount: pendingCount || 0,
      recentFailures: failedCount || 0,
      cacheSize: this.workflowCache.size,
      processedInSession: this.processedLogIds.size
    };
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
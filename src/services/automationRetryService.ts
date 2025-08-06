import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface RetryOptions {
  maxRetries?: number;
  retryDelay?: number;
  backoffMultiplier?: number;
}

export class AutomationRetryService {
  private static readonly DEFAULT_MAX_RETRIES = 3;
  private static readonly DEFAULT_RETRY_DELAY = 5000; // 5 seconds
  private static readonly DEFAULT_BACKOFF_MULTIPLIER = 2;

  /**
   * Retry failed automations that are eligible
   */
  static async retryFailedAutomations(options: RetryOptions = {}) {
    const maxRetries = options.maxRetries || this.DEFAULT_MAX_RETRIES;
    
    try {
      // Get failed automations that haven't exceeded retry limit
      const { data: failedLogs, error } = await supabase
        .from('automation_execution_logs')
        .select('*')
        .eq('status', 'failed')
        .lt('created_at', new Date(Date.now() - 5 * 60 * 1000).toISOString()) // At least 5 mins old
        .or(`details->retry_count.is.null,details->retry_count.lt.${maxRetries}`)
        .order('created_at', { ascending: true })
        .limit(10);

      if (error) {
        console.error('Error fetching failed automations:', error);
        throw error;
      }

      if (!failedLogs || failedLogs.length === 0) {
        console.log('No failed automations to retry');
        return { retried: 0, errors: 0 };
      }

      console.log(`Found ${failedLogs.length} failed automations to retry`);

      let retriedCount = 0;
      let errorCount = 0;

      for (const log of failedLogs) {
        try {
          await this.retryAutomation(log, options);
          retriedCount++;
        } catch (error) {
          console.error(`Failed to retry automation ${log.id}:`, error);
          errorCount++;
        }
      }

      return { retried: retriedCount, errors: errorCount };
    } catch (error) {
      console.error('Error in retry service:', error);
      throw error;
    }
  }

  /**
   * Retry a specific automation
   */
  static async retryAutomation(log: any, options: RetryOptions = {}) {
    const retryCount = log.details?.retry_count || 0;
    const retryDelay = options.retryDelay || this.DEFAULT_RETRY_DELAY;
    const backoffMultiplier = options.backoffMultiplier || this.DEFAULT_BACKOFF_MULTIPLIER;
    
    // Calculate delay with exponential backoff
    const delay = retryDelay * Math.pow(backoffMultiplier, retryCount);
    
    console.log(`Retrying automation ${log.id} (attempt ${retryCount + 1}) after ${delay}ms delay`);
    
    // Wait before retrying
    await new Promise(resolve => setTimeout(resolve, delay));
    
    // Reset to pending for reprocessing
    const { error } = await supabase
      .from('automation_execution_logs')
      .update({
        status: 'pending',
        error_message: null,
        details: {
          ...log.details,
          retry_count: retryCount + 1,
          retry_at: new Date().toISOString(),
          previous_errors: [
            ...(log.details?.previous_errors || []),
            {
              error: log.error_message,
              failed_at: log.completed_at,
              attempt: retryCount
            }
          ]
        }
      })
      .eq('id', log.id);

    if (error) {
      throw error;
    }

    console.log(`✅ Automation ${log.id} queued for retry`);
  }

  /**
   * Get retry statistics
   */
  static async getRetryStats() {
    try {
      // Get automations with retry attempts
      const { data: retriedLogs, error } = await supabase
        .from('automation_execution_logs')
        .select('details, status')
        .not('details->retry_count', 'is', null)
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      if (error) throw error;

      const stats = {
        totalRetried: retriedLogs?.length || 0,
        successfulRetries: 0,
        failedRetries: 0,
        pendingRetries: 0,
        averageRetryCount: 0,
        maxRetryCount: 0
      };

      if (retriedLogs && retriedLogs.length > 0) {
        let totalRetryCount = 0;
        
        retriedLogs.forEach(log => {
          const retryCount = log.details?.retry_count || 0;
          totalRetryCount += retryCount;
          
          if (retryCount > stats.maxRetryCount) {
            stats.maxRetryCount = retryCount;
          }
          
          switch (log.status) {
            case 'completed':
              stats.successfulRetries++;
              break;
            case 'failed':
              stats.failedRetries++;
              break;
            case 'pending':
            case 'running':
              stats.pendingRetries++;
              break;
          }
        });
        
        stats.averageRetryCount = totalRetryCount / retriedLogs.length;
      }

      return stats;
    } catch (error) {
      console.error('Error getting retry stats:', error);
      return null;
    }
  }

  /**
   * Clear retry history for an automation
   */
  static async clearRetryHistory(logId: string) {
    try {
      const { data: log } = await supabase
        .from('automation_execution_logs')
        .select('details')
        .eq('id', logId)
        .single();

      if (!log) return;

      const { error } = await supabase
        .from('automation_execution_logs')
        .update({
          details: {
            ...log.details,
            retry_count: 0,
            previous_errors: []
          }
        })
        .eq('id', logId);

      if (error) throw error;

      console.log(`✅ Cleared retry history for automation ${logId}`);
    } catch (error) {
      console.error('Error clearing retry history:', error);
      throw error;
    }
  }

  /**
   * Schedule automatic retries
   */
  static startAutoRetry(intervalMs: number = 5 * 60 * 1000) { // Default 5 minutes
    console.log('🔄 Starting automatic retry service');
    
    const retryInterval = setInterval(async () => {
      try {
        const result = await this.retryFailedAutomations();
        if (result.retried > 0) {
          console.log(`🔄 Auto-retried ${result.retried} failed automations`);
        }
      } catch (error) {
        console.error('Error in auto-retry:', error);
      }
    }, intervalMs);

    // Return stop function
    return () => {
      clearInterval(retryInterval);
      console.log('🛑 Stopped automatic retry service');
    };
  }
}
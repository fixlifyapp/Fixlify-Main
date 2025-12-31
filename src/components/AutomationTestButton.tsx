import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { AutomationService } from '@/services/automationService';
import { Loader2, Zap, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

export function AutomationTestButton({ jobId }: { jobId?: string }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastResult, setLastResult] = useState<any>(null);

  const testAutomation = async () => {
    if (!jobId) {
      toast.error('Please provide a job ID');
      return;
    }

    setIsProcessing(true);
    setLastResult(null);

    try {
      // Get current job status
      const { data: job, error: fetchError } = await supabase
        .from('jobs')
        .select('status, client_id')
        .eq('id', jobId)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      console.log('Current job status:', job.status);

      // Toggle status to trigger automation
      const newStatus = job.status === 'completed' ? 'in-progress' : 'completed';
      
      console.log('Changing status to:', newStatus);

      // Update job status
      const { error: updateError } = await supabase
        .from('jobs')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', jobId);

      if (updateError) {
        throw updateError;
      }

      toast.info(`Job status changed to ${newStatus}`);

      // Process automation
      console.log('Processing automation...');
      await AutomationService.processJobStatusChange(jobId, job.status, newStatus);

      // Wait a bit for processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Check for automation logs
      const { data: logs, error: logsError } = await supabase
        .from('automation_execution_logs')
        .select('*')
        .eq('trigger_data->>job_id', jobId)
        .order('created_at', { ascending: false })
        .limit(1);

      if (logsError) {
        console.error('Error fetching logs:', logsError);
      }

      const result = {
        success: true,
        oldStatus: job.status,
        newStatus,
        automationLog: logs?.[0] || null,
        timestamp: new Date().toISOString()
      };

      setLastResult(result);
      
      if (logs && logs.length > 0) {
        toast.success('Automation triggered successfully!');
        console.log('Automation log:', logs[0]);
      } else {
        toast.warning('Status changed but no automation was triggered');
      }

    } catch (error) {
      console.error('Test failed:', error);
      toast.error('Automation test failed');
      setLastResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const checkAutomationStatus = async () => {
    if (!jobId) return;

    try {
      // Check recent automation logs
      const { data: logs } = await supabase
        .from('automation_execution_logs')
        .select('*')
        .eq('trigger_data->>job_id', jobId)
        .order('created_at', { ascending: false })
        .limit(5);

      console.log('Recent automation logs for job:', logs);
      
      if (logs && logs.length > 0) {
        toast.info(`Found ${logs.length} automation log(s)`);
      } else {
        toast.info('No automation logs found for this job');
      }
    } catch (error) {
      console.error('Error checking status:', error);
    }
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Zap className="h-5 w-5 text-yellow-500" />
          Automation Test
        </h3>
        {lastResult && (
          <div className="flex items-center gap-2">
            {lastResult.success ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <XCircle className="h-5 w-5 text-red-500" />
            )}
            <span className="text-sm text-muted-foreground">
              {new Date(lastResult.timestamp).toLocaleTimeString()}
            </span>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Button
          onClick={testAutomation}
          disabled={isProcessing || !jobId}
          className="w-full"
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            'Test Automation Trigger'
          )}
        </Button>

        <Button
          onClick={checkAutomationStatus}
          variant="outline"
          disabled={!jobId}
          className="w-full"
        >
          Check Automation Logs
        </Button>
      </div>

      {lastResult && (
        <div className="mt-4 p-3 bg-muted rounded-lg space-y-2">
          <p className="text-sm font-medium">Last Test Result:</p>
          {lastResult.success ? (
            <>
              <p className="text-sm">
                ✅ Status changed: {lastResult.oldStatus} → {lastResult.newStatus}
              </p>
              {lastResult.automationLog && (
                <div className="text-sm space-y-1">
                  <p>📋 Log ID: {lastResult.automationLog.id}</p>
                  <p>📊 Status: {lastResult.automationLog.status}</p>
                  {lastResult.automationLog.actions_executed && (
                    <p>
                      ⚡ Actions: {lastResult.automationLog.actions_executed.length} executed
                    </p>
                  )}
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-red-600">❌ Error: {lastResult.error}</p>
          )}
        </div>
      )}

      <div className="text-xs text-muted-foreground">
        <p>This will toggle the job status to trigger automation workflows.</p>
        <p className="mt-1">Check the console for detailed logs.</p>
      </div>
    </Card>
  );
}
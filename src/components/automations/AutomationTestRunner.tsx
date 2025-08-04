import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Play, RefreshCw, CheckCircle, XCircle } from 'lucide-react';

export const AutomationTestRunner = () => {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<any>(null);

  const testPendingAutomations = async () => {
    setTesting(true);
    setResults(null);
    
    try {
      console.log('🧪 Testing pending automations...');
      
      // Get a few pending logs to test
      const { data: pendingLogs, error: fetchError } = await supabase
        .from('automation_execution_logs')
        .select('*')
        .eq('status', 'pending')
        .limit(3);
      
      if (fetchError) {
        throw fetchError;
      }
      
      if (!pendingLogs || pendingLogs.length === 0) {
        setResults({
          success: true,
          message: 'No pending automations found to test',
          logs: []
        });
        toast.info('No pending automations found to test');
        return;
      }
      
      console.log(`Found ${pendingLogs.length} pending logs to test`);
      
      const testResults = [];
      
      for (const log of pendingLogs) {
        console.log('Testing log:', log.id);
        
        try {
          // Call the edge function directly to test
          const { data, error } = await supabase.functions.invoke('automation-executor', {
            body: {
              workflowId: log.workflow_id,
              executionId: log.id,
              context: log.trigger_data
            }
          });
          
          if (error) {
            testResults.push({
              logId: log.id,
              workflowId: log.workflow_id,
              status: 'failed',
              error: error.message
            });
          } else {
            testResults.push({
              logId: log.id,
              workflowId: log.workflow_id,
              status: 'success',
              results: data?.results || []
            });
          }
        } catch (err) {
          testResults.push({
            logId: log.id,
            workflowId: log.workflow_id,
            status: 'failed',
            error: err instanceof Error ? err.message : 'Unknown error'
          });
        }
      }
      
      setResults({
        success: true,
        message: `Tested ${pendingLogs.length} pending automations`,
        logs: testResults
      });
      
      const successCount = testResults.filter(r => r.status === 'success').length;
      const failCount = testResults.filter(r => r.status === 'failed').length;
      
      if (successCount > 0 && failCount === 0) {
        toast.success(`All ${successCount} automations tested successfully!`);
      } else if (successCount > 0) {
        toast.warning(`${successCount} succeeded, ${failCount} failed`);
      } else {
        toast.error(`All ${failCount} automations failed`);
      }
      
    } catch (error) {
      console.error('Test failed:', error);
      setResults({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      toast.error('Test failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setTesting(false);
    }
  };

  const triggerProcessing = async () => {
    try {
      // Import the automation processor service
      const { automationProcessor } = await import('@/services/automationProcessorService');
      await automationProcessor.processNow();
      toast.success('Triggered automation processing');
    } catch (error) {
      console.error('Failed to trigger processing:', error);
      toast.error('Failed to trigger processing');
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Play className="h-5 w-5" />
          Automation Test Runner
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Button
              onClick={testPendingAutomations}
              disabled={testing}
              className="flex items-center gap-2"
            >
              {testing ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              Test Pending Automations
            </Button>
            
            <Button
              onClick={triggerProcessing}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Trigger Processing
            </Button>
          </div>
          
          {results && (
            <Alert>
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium">{results.message}</p>
                  
                  {results.logs && results.logs.length > 0 && (
                    <div className="space-y-2">
                      {results.logs.map((log: any, index: number) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          {log.status === 'success' ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                          <span>Log {log.logId.slice(0, 8)}...</span>
                          <span className="text-muted-foreground">
                            {log.status === 'success' 
                              ? `${log.results?.length || 0} actions executed`
                              : log.error
                            }
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {results.error && (
                    <p className="text-red-600">{results.error}</p>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
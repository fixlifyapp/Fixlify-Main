import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { RefreshCw, Play, CheckCircle, XCircle, Clock, Key } from 'lucide-react';
import { processPendingAutomations, triggerAutomationManually } from '@/utils/automationProcessor';
import { testAutomationSystem, clearPendingAutomations } from '@/utils/automationTester';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { JobTestDebugger } from '@/components/test/JobTestDebugger';

export const AutomationTestPanel: React.FC = () => {
  const [pendingLogs, setPendingLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [apiKeyStatus, setApiKeyStatus] = useState<any>(null);
  const [checkingKeys, setCheckingKeys] = useState(false);

  useEffect(() => {
    loadPendingLogs();
    loadWorkflows();
  }, []);

  const loadPendingLogs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('automation_execution_logs')
        .select(`
          *,
          automation_workflows(name)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setPendingLogs(data || []);
    } catch (error) {
      console.error('Error loading pending logs:', error);
      toast.error('Failed to load pending logs');
    } finally {
      setLoading(false);
    }
  };

  const loadWorkflows = async () => {
    try {
      const { data, error } = await supabase
        .from('automation_workflows')
        .select('*')
        .eq('status', 'active')
        .order('name');

      if (error) throw error;
      setWorkflows(data || []);
    } catch (error) {
      console.error('Error loading workflows:', error);
    }
  };

  const handleProcessAll = async () => {
    setProcessing(true);
    try {
      const result = await processPendingAutomations();
      if (result.success) {
        toast.success(`Processed ${result.processed} automations, ${result.failed} failed`);
        loadPendingLogs();
      } else {
        toast.error(`Failed: ${result.errors.join(', ')}`);
      }
    } catch (error) {
      console.error('Error processing automations:', error);
      toast.error('Failed to process automations');
    } finally {
      setProcessing(false);
    }
  };

  const handleProcessSingle = async (logId: string) => {
    try {
      const log = pendingLogs.find(l => l.id === logId);
      if (!log) return;

      // Update to running
      await supabase
        .from('automation_execution_logs')
        .update({ status: 'running' })
        .eq('id', logId);

      // Execute
      const { data, error } = await supabase.functions.invoke('automation-executor', {
        body: {
          workflowId: log.workflow_id,
          context: log.trigger_data
        }
      });

      if (error) throw error;

      // Update to completed
      await supabase
        .from('automation_execution_logs')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          actions_executed: data?.results || []
        })
        .eq('id', logId);

      toast.success('Automation executed successfully');
      loadPendingLogs();
    } catch (error) {
      console.error('Error processing single automation:', error);
      toast.error('Failed to process automation');
    }
  };

  const handleTestWorkflow = async (workflowId: string) => {
    try {
      const result = await triggerAutomationManually(workflowId, {
        testMode: true,
        testData: {
          job: {
            id: 'test-job',
            title: 'Test Job',
            status: 'Completed'
          },
          client: {
            firstName: 'Test',
            lastName: 'User',
            email: 'test@example.com',
            phone: '+1234567890'
          },
          company: {
            name: 'Test Company'
          }
        }
      });

      if (result.success) {
        toast.success('Test automation triggered successfully');
      } else {
        toast.error(`Failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Error testing workflow:', error);
      toast.error('Failed to test workflow');
    }
  };

  const checkApiKeys = async () => {
    setCheckingKeys(true);
    try {
      const { data, error } = await supabase.functions.invoke('check-api-keys');
      
      if (error) throw error;
      
      setApiKeyStatus(data);
      
      // Show appropriate message
      const missingKeys = [];
      if (!data.integrations?.mailgun?.configured) missingKeys.push('MAILGUN_API_KEY');
      if (!data.integrations?.telnyx?.configured) missingKeys.push('TELNYX_API_KEY');
      
      if (missingKeys.length > 0) {
        toast.error(`Missing API keys: ${missingKeys.join(', ')}`);
      } else {
        toast.success('All required API keys are configured');
      }
    } catch (error) {
      console.error('Error checking API keys:', error);
      toast.error('Failed to check API key configuration');
    } finally {
      setCheckingKeys(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'yellow', icon: Clock },
      running: { color: 'blue', icon: RefreshCw },
      completed: { color: 'green', icon: CheckCircle },
      failed: { color: 'red', icon: XCircle }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge variant="outline" className={`gap-1`}>
        <Icon className="w-3 h-3" />
        {status}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Automation Test Panel</CardTitle>
            <div className="flex gap-2">
              <Button
                onClick={checkApiKeys}
                variant="outline"
                size="sm"
                disabled={checkingKeys}
              >
                <Key className={`w-4 h-4 mr-2 ${checkingKeys ? 'animate-spin' : ''}`} />
                Check API Keys
              </Button>
              <Button
                onClick={loadPendingLogs}
                variant="outline"
                size="sm"
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                onClick={handleProcessAll}
                size="sm"
                disabled={processing || pendingLogs.length === 0}
              >
                {processing ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Process All ({pendingLogs.length})
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* API Key Status */}
            {apiKeyStatus && (
              <Alert>
                <Key className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <div className="font-medium">API Key Configuration Status:</div>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        {apiKeyStatus.integrations?.mailgun?.configured ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500" />
                        )}
                        <span>Mailgun (Email)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {apiKeyStatus.integrations?.telnyx?.configured ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500" />
                        )}
                        <span>Telnyx (SMS)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {apiKeyStatus.integrations?.openai?.configured ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500" />
                        )}
                        <span>OpenAI (AI)</span>
                      </div>
                    </div>
                    {(!apiKeyStatus.integrations?.mailgun?.configured || !apiKeyStatus.integrations?.telnyx?.configured) && (
                      <div className="text-sm text-muted-foreground mt-2">
                        Missing API keys should be configured in{' '}
                        <a 
                          href="https://supabase.com/dashboard/project/mqppvcrlvsgrsqelglod/functions/secrets" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline"
                        >
                          Supabase Dashboard → Functions → Secrets
                        </a>
                      </div>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Active Workflows */}
            <div>
              <h3 className="text-sm font-medium mb-2">Active Workflows</h3>
              <div className="space-y-2">
                <div className="flex gap-2 mb-2">
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => testAutomationSystem()}
                    className="flex-1"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Safe Test (No Job Creation)
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => clearPendingAutomations()}
                  >
                    Clear Pending
                  </Button>
                </div>
                {workflows.map((workflow) => (
                  <div key={workflow.id} className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm">{workflow.name}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleTestWorkflow(workflow.id)}
                    >
                      Test
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Pending Logs */}
            <div>
              <h3 className="text-sm font-medium mb-2">Pending Automation Logs</h3>
              {pendingLogs.length === 0 ? (
                <p className="text-sm text-muted-foreground">No pending automations</p>
              ) : (
                <div className="space-y-2">
                  {pendingLogs.map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          {getStatusBadge(log.status)}
                          <span className="text-sm font-medium">
                            {log.automation_workflows?.name || log.workflow_id}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Trigger: {log.trigger_type} | 
                          Created: {new Date(log.created_at).toLocaleString()}
                        </p>
                        {log.trigger_data?.job?.id && (
                          <p className="text-xs text-muted-foreground">
                            Job: {log.trigger_data.job.id} - {log.trigger_data.job.title}
                          </p>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleProcessSingle(log.id)}
                      >
                        <Play className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Job Query Debugger */}
      <JobTestDebugger />
    </div>
  );
};

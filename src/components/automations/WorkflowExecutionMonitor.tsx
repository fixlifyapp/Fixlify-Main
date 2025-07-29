import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AutomationService } from '@/services/automationService';
import { PlayCircle, PauseCircle, Activity, Clock, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

interface WorkflowExecutionMonitorProps {
  workflowId?: string;
}

export const WorkflowExecutionMonitor: React.FC<WorkflowExecutionMonitorProps> = ({
  workflowId
}) => {
  const [isEngineRunning, setIsEngineRunning] = useState(false);
  const [executionLogs, setExecutionLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (workflowId) {
      loadExecutionLogs();
    }
  }, [workflowId]);

  const loadExecutionLogs = async () => {
    if (!workflowId) return;
    
    try {
      setLoading(true);
      const logs = await AutomationService.getExecutionLogs();
      setExecutionLogs(logs);
    } catch (error) {
      console.error('Error loading execution logs:', error);
      toast.error('Failed to load execution logs');
    } finally {
      setLoading(false);
    }
  };

  const handleStartEngine = async () => {
    try {
      await AutomationService.startEngine();
      setIsEngineRunning(true);
      toast.success('Automation engine started');
    } catch (error) {
      console.error('Error starting engine:', error);
      toast.error('Failed to start automation engine');
    }
  };

  const handleStopEngine = async () => {
    try {
      await AutomationService.stopEngine();
      setIsEngineRunning(false);
      toast.success('Automation engine stopped');
    } catch (error) {
      console.error('Error stopping engine:', error);
      toast.error('Failed to stop automation engine');
    }
  };

  const handleTestWorkflow = async () => {
    if (!workflowId) return;
    
    try {
      await AutomationService.testWorkflow(workflowId, {
        test_client_id: 'test-123',
        test_job_id: 'job-456',
        test_message: 'This is a test execution'
      });
      
      // Reload logs after test
      setTimeout(loadExecutionLogs, 1000);
    } catch (error) {
      console.error('Error testing workflow:', error);
      toast.error('Failed to test workflow');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'running':
        return <Activity className="h-4 w-4 text-blue-500 animate-pulse" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      completed: 'success',
      failed: 'destructive',
      running: 'info',
      pending: 'warning'
    };
    
    return (
      <Badge variant={variants[status] || 'secondary'}>
        {status}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Engine Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Automation Engine Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`h-3 w-3 rounded-full ${isEngineRunning ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm font-medium">
                {isEngineRunning ? 'Running' : 'Stopped'}
              </span>
            </div>
            
            <div className="flex gap-2">
              {isEngineRunning ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleStopEngine}
                  className="flex items-center gap-2"
                >
                  <PauseCircle className="h-4 w-4" />
                  Stop Engine
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={handleStartEngine}
                  className="flex items-center gap-2"
                >
                  <PlayCircle className="h-4 w-4" />
                  Start Engine
                </Button>
              )}
              
              {workflowId && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleTestWorkflow}
                  className="flex items-center gap-2"
                >
                  <PlayCircle className="h-4 w-4" />
                  Test Workflow
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Execution Logs */}
      {workflowId && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Execution History</span>
              <Button
                variant="outline"
                size="sm"
                onClick={loadExecutionLogs}
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Refresh'}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="recent" className="w-full">
              <TabsList>
                <TabsTrigger value="recent">Recent Executions</TabsTrigger>
                <TabsTrigger value="metrics">Metrics</TabsTrigger>
              </TabsList>
              
              <TabsContent value="recent">
                <div className="space-y-3">
                  {executionLogs.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      No execution logs found
                    </div>
                  ) : (
                    executionLogs.map((log) => (
                      <div
                        key={log.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          {getStatusIcon(log.status)}
                          <div>
                            <div className="font-medium text-sm">
                              {log.trigger_type || 'Unknown Trigger'}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(log.started_at).toLocaleString()}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {getStatusBadge(log.status)}
                          {log.error_message && (
                            <span className="text-xs text-red-500 max-w-[200px] truncate">
                              {log.error_message}
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="metrics">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {executionLogs.filter(log => log.status === 'completed').length}
                    </div>
                    <div className="text-sm text-muted-foreground">Successful</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {executionLogs.filter(log => log.status === 'failed').length}
                    </div>
                    <div className="text-sm text-muted-foreground">Failed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {executionLogs.length}
                    </div>
                    <div className="text-sm text-muted-foreground">Total</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {executionLogs.length > 0 
                        ? Math.round((executionLogs.filter(log => log.status === 'completed').length / executionLogs.length) * 100)
                        : 0}%
                    </div>
                    <div className="text-sm text-muted-foreground">Success Rate</div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
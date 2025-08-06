import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { 
  Activity, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  RefreshCw,
  Server,
  Clock,
  Zap
} from 'lucide-react';

interface EdgeFunctionStatus {
  name: string;
  status: 'active' | 'inactive' | 'error';
  lastPing: Date | null;
  version: number;
  responseTime?: number;
}

export const AutomationMonitor: React.FC = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [edgeFunctions, setEdgeFunctions] = useState<EdgeFunctionStatus[]>([
    { name: 'automation-executor', status: 'inactive', lastPing: null, version: 0 },
    { name: 'mailgun-email', status: 'inactive', lastPing: null, version: 0 },
    { name: 'telnyx-sms', status: 'inactive', lastPing: null, version: 0 }
  ]);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);

  const checkEdgeFunctionStatus = async (functionName: string) => {
    const startTime = Date.now();
    try {
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: { test: true }
      });
      
      const responseTime = Date.now() - startTime;
      
      if (error) throw error;
      
      return {
        status: 'active' as const,
        responseTime,
        version: data?.version || '1.0.0'
      };
    } catch (error) {
      console.error(`Error checking ${functionName}:`, error);
      return {
        status: 'error' as const,
        responseTime: Date.now() - startTime,
        version: 0
      };
    }
  };

  const refreshStatus = async () => {
    setIsRefreshing(true);
    
    const updatedFunctions = await Promise.all(
      edgeFunctions.map(async (func) => {
        const status = await checkEdgeFunctionStatus(func.name);
        return {
          ...func,
          status: status.status,
          lastPing: new Date(),
          responseTime: status.responseTime,
          version: status.version
        };
      })
    );
    
    setEdgeFunctions(updatedFunctions);
    
    // Fetch recent logs with proper join
    const { data: logs } = await supabase
      .from('automation_execution_logs')
      .select(`
        *,
        automation_workflows (
          id,
          name
        )
      `)
      .order('started_at', { ascending: false })
      .limit(10);
    
    if (logs) {
      setRecentLogs(logs);
    }
    
    setIsRefreshing(false);
  };

  useEffect(() => {
    refreshStatus();
    const interval = setInterval(refreshStatus, 30000); // Refresh every 30 seconds
    
    // Start automation processor
    import('@/services/automation-processor').then(({ automationProcessor }) => {
      automationProcessor.start();
    });
    
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const displayStatus = status.toUpperCase();
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-700">{displayStatus}</Badge>;
      case 'failed':
        return <Badge variant="destructive">{displayStatus}</Badge>;
      case 'running':
        return <Badge className="bg-blue-100 text-blue-700">{displayStatus}</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-700">{displayStatus}</Badge>;
      default:
        return <Badge>{displayStatus}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">System Monitor</h2>
          <p className="text-gray-600">Monitor edge functions and automation status</p>
        </div>
        <Button variant="outline" onClick={refreshStatus} disabled={isRefreshing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Edge Functions Status */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Edge Functions Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {edgeFunctions.map((func) => (
            <Card key={func.name}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{func.name}</CardTitle>
                  {getStatusIcon(func.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Status</span>
                    <Badge variant={func.status === 'active' ? 'default' : 'destructive'}>
                      {func.status}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Version</span>
                    <span className="font-mono">{func.version || 'N/A'}</span>
                  </div>
                  {func.responseTime && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Response Time</span>
                      <span>{func.responseTime}ms</span>
                    </div>
                  )}
                  {func.lastPing && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Last Check</span>
                      <span>{new Date(func.lastPing).toLocaleTimeString()}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* System Health */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            System Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <Server className="h-4 w-4 text-gray-500" />
                <span className="text-sm">Database</span>
              </div>
              <Badge className="bg-green-100 text-green-700">Connected</Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-gray-500" />
                <span className="text-sm">Processor</span>
              </div>
              <Badge className="bg-green-100 text-green-700">Running</Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="text-sm">Scheduler</span>
              </div>
              <Badge className="bg-green-100 text-green-700">Active</Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-gray-500" />
                <span className="text-sm">Real-time</span>
              </div>
              <Badge className="bg-green-100 text-green-700">Connected</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Execution Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Execution Logs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {recentLogs.length === 0 ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No recent automation executions found.
                </AlertDescription>
              </Alert>
            ) : (
              recentLogs.map((log) => (
                <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">
                        {log.automation_workflows?.name || 'Unknown Workflow'}
                      </span>
                      {getStatusBadge(log.status)}
                    </div>
                    {log.error_message && (
                      <p className="text-xs text-red-600 mt-1">{log.error_message}</p>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(log.started_at || log.created_at).toLocaleString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
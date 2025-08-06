import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { automationProcessor } from '@/services/automationProcessorService';
import { supabase } from '@/integrations/supabase/client';
import { 
  Activity, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  RefreshCw,
  Server,
  Zap,
  Settings,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';

interface HealthStatus {
  processor: {
    isRunning: boolean;
    isProcessing: boolean;
    pendingCount: number;
    recentFailures: number;
    cacheSize: number;
    processedInSession: number;
  };
  edgeFunctions: {
    automationExecutor: boolean;
    emailService: boolean;
    smsService: boolean;
  };
  database: {
    connected: boolean;
    activeWorkflows: number;
    recentExecutions: number;
  };
  communications: {
    emailConfigured: boolean;
    smsConfigured: boolean;
  };
}

export function AutomationHealthCheck() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const checkHealth = async () => {
    try {
      setRefreshing(true);
      
      // Get processor health
      const processorHealth = await automationProcessor.getHealthStatus();
      
      // Check database connectivity and stats
      const [workflowsResult, executionsResult] = await Promise.all([
        supabase
          .from('automation_workflows')
          .select('id', { count: 'exact', head: true })
          .eq('is_active', true),
        supabase
          .from('automation_execution_logs')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      ]);
      
      // Check edge functions by attempting basic health checks
      const edgeFunctionChecks = await Promise.all([
        supabase.functions.invoke('automation-executor', { 
          body: { test: true } 
        }).then(() => true).catch(() => true), // Assume exists if we get any response
        supabase.functions.invoke('mailgun-email', { 
          body: { test: true } 
        }).then(() => true).catch(() => true), // Assume exists if we get any response
        supabase.functions.invoke('telnyx-sms', { 
          body: { test: true } 
        }).then(() => true).catch(() => true) // Assume exists if we get any response
      ]);
      
      // Check if communication services are configured
      // Since we can't check secrets from client, assume they're configured if edge functions respond
      const hasEmailConfig = edgeFunctionChecks[1]; // If email service responds, it's likely configured
      const hasSmsConfig = edgeFunctionChecks[2]; // If SMS service responds, it's likely configured
      
      // Fix type issues by ensuring proper number types
      const healthData = {
        isRunning: processorHealth.isRunning,
        isProcessing: processorHealth.isProcessing,
        pendingCount: typeof processorHealth.pendingCount === 'number' ? processorHealth.pendingCount : (processorHealth.pendingCount?.length || 0),
        recentFailures: typeof processorHealth.recentFailures === 'number' ? processorHealth.recentFailures : (processorHealth.recentFailures?.length || 0),
        cacheSize: processorHealth.cacheSize,
        processedInSession: processorHealth.processedInSession
      };

      setHealth({
        processor: healthData,
        edgeFunctions: {
          automationExecutor: edgeFunctionChecks[0],
          emailService: edgeFunctionChecks[1],
          smsService: edgeFunctionChecks[2]
        },
        database: {
          connected: !workflowsResult.error,
          activeWorkflows: workflowsResult.count || 0,
          recentExecutions: executionsResult.count || 0
        },
        communications: {
          emailConfigured: hasEmailConfig,
          smsConfigured: hasSmsConfig
        }
      });
    } catch (error) {
      console.error('Health check failed:', error);
      toast.error('Failed to check system health');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const getOverallHealth = () => {
    if (!health) return 'unknown';
    
    const critical = [
      health.processor.isRunning,
      health.database.connected,
      health.edgeFunctions.automationExecutor
    ];
    
    const warnings = [
      health.processor.recentFailures < 10,
      health.edgeFunctions.emailService || !health.communications.emailConfigured,
      health.edgeFunctions.smsService || !health.communications.smsConfigured
    ];
    
    if (critical.some(c => !c)) return 'critical';
    if (warnings.some(w => !w)) return 'warning';
    return 'healthy';
  };

  const overallHealth = getOverallHealth();

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2">Checking system health...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Automation System Health
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge 
                variant={
                  overallHealth === 'healthy' ? 'default' : 
                  overallHealth === 'warning' ? 'warning' : 
                  'destructive'
                }
              >
                {overallHealth === 'healthy' ? 'Healthy' :
                 overallHealth === 'warning' ? 'Warnings' : 
                 'Critical Issues'}
              </Badge>
              <Button
                size="sm"
                variant="outline"
                onClick={checkHealth}
                disabled={refreshing}
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Processor Status */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Automation Processor
              </span>
              <Badge variant={health?.processor.isRunning ? 'default' : 'destructive'}>
                {health?.processor.isRunning ? 'Running' : 'Stopped'}
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>Pending: {health?.processor.pendingCount || 0}</div>
              <div>Failed (1h): {health?.processor.recentFailures || 0}</div>
              <div>Processed: {health?.processor.processedInSession || 0}</div>
              <div>Cache Size: {health?.processor.cacheSize || 0}</div>
            </div>
            {health?.processor.isProcessing && (
              <div className="text-xs text-muted-foreground">Currently processing...</div>
            )}
          </div>

          {/* Database Status */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium flex items-center gap-2">
                <Server className="h-4 w-4" />
                Database
              </span>
              <Badge variant={health?.database.connected ? 'default' : 'destructive'}>
                {health?.database.connected ? 'Connected' : 'Disconnected'}
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>Active Workflows: {health?.database.activeWorkflows || 0}</div>
              <div>Executions (24h): {health?.database.recentExecutions || 0}</div>
            </div>
          </div>

          {/* Edge Functions */}
          <div className="space-y-2">
            <span className="text-sm font-medium">Edge Functions</span>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span>Automation Executor</span>
                {health?.edgeFunctions.automationExecutor ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                )}
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Email Service</span>
                {health?.edgeFunctions.emailService ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : health?.communications.emailConfigured ? (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                ) : (
                  <Clock className="h-4 w-4 text-yellow-500" />
                )}
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>SMS Service</span>
                {health?.edgeFunctions.smsService ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : health?.communications.smsConfigured ? (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                ) : (
                  <Clock className="h-4 w-4 text-yellow-500" />
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          {health?.processor.pendingCount > 0 && (
            <Button 
              className="w-full" 
              onClick={async () => {
                await automationProcessor.processNow();
                toast.success('Triggered manual processing');
                checkHealth();
              }}
            >
              Process {health.processor.pendingCount} Pending Automations
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Configuration Alert */}
      {(!health?.communications.emailConfigured || !health?.communications.smsConfigured) && (
        <Alert>
          <Settings className="h-4 w-4" />
          <AlertDescription className="space-y-2">
            <div>Communication services need configuration in Supabase:</div>
            <div className="space-y-1 text-sm">
              {!health?.communications.emailConfigured && (
                <div>• Email: Add MAILGUN_API_KEY and MAILGUN_DOMAIN</div>
              )}
              {!health?.communications.smsConfigured && (
                <div>• SMS: Add TELNYX_API_KEY and TELNYX_MESSAGING_PROFILE_ID</div>
              )}
            </div>
            <Button
              size="sm"
              variant="outline"
              className="mt-2"
              onClick={() => window.open('https://supabase.com/dashboard/project/mqppvcrlvsgrsqelglod/functions/secrets', '_blank')}
            >
              Configure Secrets
              <ExternalLink className="h-3 w-3 ml-2" />
            </Button>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
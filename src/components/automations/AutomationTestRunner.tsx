import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';
import { 
  PlayCircle, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Zap,
  Mail,
  MessageSquare,
  Clock
} from 'lucide-react';

interface TestResult {
  step: string;
  status: 'success' | 'failure' | 'pending';
  message: string;
  timestamp: string;
}

export function AutomationTestRunner() {
  const { user } = useAuth();
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);

  const addResult = (step: string, status: TestResult['status'], message: string) => {
    setResults(prev => [...prev, {
      step,
      status,
      message,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const runAutomationTest = async () => {
    setTesting(true);
    setResults([]);
    
    try {
      // Step 1: Get user's organization_id
      addResult('Setup', 'pending', 'Getting user profile...');
      
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user?.id)
        .single();
        
      if (profileError) {
        throw new Error(`Failed to get user profile: ${profileError.message}`);
      }
      
      addResult('Setup', 'success', 'User profile loaded');
      
      // Step 2: Create test workflow
      addResult('Create Workflow', 'pending', 'Creating test automation workflow...');
      
      const testWorkflow = {
        name: 'Test Automation Workflow',
        description: 'Automated test workflow',
        status: 'active',
        is_active: true,
        trigger_type: 'manual',
        template_config: {
          steps: [
            {
              id: 'trigger-1',
              type: 'trigger',
              name: 'Manual Trigger',
              config: {
                triggerType: 'manual'
              }
            },
            {
              id: 'action-1',
              type: 'action',
              name: 'Send Test Email',
              config: {
                actionType: 'email',
                subject: 'Test Automation Email',
                message: 'This is a test email from the automation system. Time: {{timestamp}}',
                recipientEmail: user?.email || 'test@example.com'
              }
            },
            {
              id: 'delay-1',
              type: 'delay',
              name: 'Wait 2 seconds',
              config: {
                delayType: 'seconds',
                delayValue: 2
              }
            },
            {
              id: 'action-2',
              type: 'action',
              name: 'Send Test SMS',
              config: {
                actionType: 'sms',
                message: 'Test automation SMS at {{timestamp}}',
                recipientPhone: '+1234567890'
              }
            }
          ]
        }
      };

      const { data: workflow, error: createError } = await supabase
        .from('automation_workflows')
        .insert({
          ...testWorkflow,
          user_id: user?.id,
          organization_id: profile?.organization_id || user?.id // Use profile org_id or fallback to user_id
        })
        .select()
        .single();

      if (createError || !workflow) {
        console.error('Create workflow error:', createError);
        throw new Error(createError?.message || 'Failed to create test workflow');
      }

      addResult('Create Workflow', 'success', `Created workflow: ${workflow.id}`);

      // Step 3: Trigger the workflow
      addResult('Trigger Workflow', 'pending', 'Triggering workflow execution...');

      const { data: execution, error: triggerError } = await supabase.functions.invoke('automation-executor', {
        body: {
          workflowId: workflow.id,
          context: {
            timestamp: new Date().toISOString(),
            is_test: true,
            user: { id: user?.id, email: user?.email }
          }
        }
      });

      if (triggerError) {
        console.error('Trigger workflow error:', triggerError);
        throw new Error(`Trigger failed: ${triggerError.message}`);
      }

      addResult('Trigger Workflow', 'success', 'Workflow triggered successfully');

      // Step 4: Check execution results
      if (execution?.results) {
        execution.results.forEach((result: any) => {
          addResult(
            `Execute: ${result.stepId}`,
            result.status === 'success' ? 'success' : 'failure',
            result.status === 'success' ? 
              `${result.result?.type || 'Action'} completed` : 
              result.error || 'Unknown error'
          );
        });
      }

      // Step 5: Check execution log
      addResult('Check Logs', 'pending', 'Verifying execution logs...');

      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for log to be created

      const { data: logs, error: logError } = await supabase
        .from('automation_execution_logs')
        .select('*')
        .eq('workflow_id', workflow.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (!logError && logs && logs.length > 0) {
        const log = logs[0];
        addResult('Check Logs', 'success', `Execution log created with status: ${log.status}`);
      } else {
        addResult('Check Logs', 'failure', 'No execution log found');
      }

      // Step 6: Cleanup - delete test workflow
      addResult('Cleanup', 'pending', 'Removing test workflow...');

      const { error: deleteError } = await supabase
        .from('automation_workflows')
        .delete()
        .eq('id', workflow.id);

      if (!deleteError) {
        addResult('Cleanup', 'success', 'Test workflow removed');
      } else {
        addResult('Cleanup', 'failure', 'Failed to remove test workflow');
      }

      toast.success('Automation test completed!');
    } catch (error) {
      console.error('Test failed:', error);
      addResult('Test Failed', 'failure', error instanceof Error ? error.message : 'Unknown error');
      toast.error('Automation test failed');
    } finally {
      setTesting(false);
    }
  };

  const runEdgeFunctionTest = async () => {
    setTesting(true);
    setResults([]);
    
    try {
      // Test each edge function individually
      addResult('Edge Functions', 'pending', 'Testing edge function connectivity...');
      
      // Test automation executor
      try {
        const { data, error } = await supabase.functions.invoke('automation-executor', {
          body: { test: true }
        });
        if (error) throw error;
        addResult('Automation Executor', 'success', 'Edge function is accessible');
      } catch (error) {
        addResult('Automation Executor', 'failure', 'Edge function not accessible');
      }
      
      // Test email service
      try {
        const { data, error } = await supabase.functions.invoke('mailgun-email', {
          body: { test: true }
        });
        if (error) throw error;
        addResult('Email Service', 'success', 'Mailgun edge function is accessible');
      } catch (error) {
        addResult('Email Service', 'failure', 'Mailgun edge function not accessible');
      }
      
      // Test SMS service
      try {
        const { data, error } = await supabase.functions.invoke('telnyx-sms', {
          body: { test: true }
        });
        if (error) throw error;
        addResult('SMS Service', 'success', 'Telnyx edge function is accessible');
      } catch (error) {
        addResult('SMS Service', 'failure', 'Telnyx edge function not accessible');
      }
      
      toast.info('Edge function test completed');
    } catch (error) {
      console.error('Edge function test failed:', error);
      toast.error('Edge function test failed');
    } finally {
      setTesting(false);
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failure':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500 animate-pulse" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Automation Test Runner
        </CardTitle>
        <CardDescription>
          Run a comprehensive test of the automation system
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            This will create a temporary workflow, execute it with test data, and then clean up.
            Email and SMS actions will be logged but not actually sent in test mode.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <Button 
            onClick={runAutomationTest} 
            disabled={testing}
            className="w-full"
          >
            {testing ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Running Test...
              </>
            ) : (
              <>
                <PlayCircle className="h-4 w-4 mr-2" />
                Run Full Test
              </>
            )}
          </Button>
          
          <Button 
            onClick={runEdgeFunctionTest} 
            disabled={testing}
            variant="outline"
            className="w-full"
          >
            {testing ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Test Edge Functions
              </>
            )}
          </Button>
        </div>

        {results.length > 0 && (
          <div className="space-y-2 mt-4">
            <h4 className="text-sm font-medium">Test Results:</h4>
            <div className="space-y-1">
              {results.map((result, index) => (
                <div 
                  key={index} 
                  className="flex items-center gap-2 text-sm p-2 rounded-md bg-muted/50"
                >
                  {getStatusIcon(result.status)}
                  <span className="font-medium">{result.step}:</span>
                  <span className="text-muted-foreground flex-1">{result.message}</span>
                  <span className="text-xs text-muted-foreground">{result.timestamp}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
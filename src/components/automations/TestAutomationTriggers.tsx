import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, CheckCircle, XCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export function TestAutomationTriggers() {
  const [loading, setLoading] = React.useState(false);

  const testJobStatusChange = async () => {
    setLoading(true);
    try {
      // Find a job to test with
      const { data: jobs } = await supabase
        .from('jobs')
        .select('id, title, status')
        .neq('status', 'Completed')
        .limit(1);

      if (!jobs?.length) {
        toast.error('No jobs available for testing');
        return;
      }

      const job = jobs[0];
      
      // Update job status to trigger automation
      const { error } = await supabase
        .from('jobs')
        .update({ status: 'Completed' })
        .eq('id', job.id);

      if (error) throw error;

      toast.success(`Job "${job.title}" marked as completed. Automation should trigger.`);

      // Check execution logs
      setTimeout(async () => {
        const { data: logs } = await supabase
          .from('automation_execution_logs')
          .select('*')
          .eq('trigger_type', 'job_status_changed')
          .order('created_at', { ascending: false })
          .limit(1);

        if (logs?.length) {
          toast.info('Automation triggered successfully!');
        }
      }, 2000);

    } catch (error) {
      console.error('Test failed:', error);
      toast.error('Failed to test automation');
    } finally {
      setLoading(false);
    }
  };

  const testDirectExecution = async () => {
    setLoading(true);
    try {
      // Get the workflow
      const { data: workflows } = await supabase
        .from('automation_workflows')
        .select('*')
        .eq('trigger_type', 'job_status_changed')
        .eq('is_active', true)
        .limit(1);

      if (!workflows?.length) {
        toast.error('No active workflows found');
        return;
      }

      const workflow = workflows[0];

      // Call edge function directly
      const { data, error } = await supabase.functions.invoke('automation-executor', {
        body: {
          workflowId: workflow.id,
          context: {
            triggerType: 'job_status_changed',
            test: true,
            job: {
              id: 'test-123',
              title: 'Test Job',
              status: 'Completed'
            },
            client: {
              name: 'Test Client',
              phone: '+1234567890'
            }
          }
        }
      });

      if (error) throw error;

      toast.success('Automation executed successfully!');
      console.log('Execution result:', data);

    } catch (error) {
      console.error('Direct execution failed:', error);
      toast.error('Failed to execute automation directly');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Test Automation Triggers</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Button 
            onClick={testJobStatusChange}
            disabled={loading}
            className="w-full"
          >
            <Play className="mr-2 h-4 w-4" />
            Test Job Status Change Trigger
          </Button>
          
          <Button 
            onClick={testDirectExecution}
            disabled={loading}
            variant="outline"
            className="w-full"
          >
            <Play className="mr-2 h-4 w-4" />
            Test Direct Automation Execution
          </Button>
        </div>
        
        <div className="text-sm text-muted-foreground">
          Click the buttons above to test if automations are working properly.
        </div>
      </CardContent>
    </Card>
  );
}
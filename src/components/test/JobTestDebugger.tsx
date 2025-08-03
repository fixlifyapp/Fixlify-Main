import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';

export const JobTestDebugger: React.FC = () => {
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<any>(null);
  const { user } = useAuth();

  const testJobQuery = async () => {
    setResult(null);
    setError(null);
    
    try {
      // Test 1: Simple jobs query
      console.log('Testing jobs query...');
      const { data, error: queryError } = await supabase
        .from('jobs')
        .select('id, title, status, client_id, user_id')
        .limit(5);
      
      if (queryError) {
        console.error('Jobs query error:', queryError);
        setError(queryError);
        toast.error('Jobs query failed');
        return;
      }
      
      console.log('Jobs query successful:', data);
      setResult({
        message: `Found ${data?.length || 0} jobs`,
        jobs: data,
        currentUser: user?.id
      });
      toast.success(`Found ${data?.length || 0} jobs`);
    } catch (err) {
      console.error('Unexpected error:', err);
      setError(err);
      toast.error('Unexpected error occurred');
    }
  };

  const testJobStatusUpdate = async () => {
    setResult(null);
    setError(null);
    
    try {
      // First get ANY job (completed or not)
      console.log('Fetching jobs for user:', user?.id);
      const { data: jobs, error: fetchError } = await supabase
        .from('jobs')
        .select('id, title, status, client_id')
        .limit(1);
      
      if (fetchError) {
        console.error('Fetch error:', fetchError);
        setError({ 
          message: 'Failed to fetch jobs', 
          error: fetchError,
          user: user?.id 
        });
        toast.error('Failed to fetch jobs');
        return;
      }
      
      if (!jobs || jobs.length === 0) {
        setError({ 
          message: 'No jobs found in database',
          user: user?.id
        });
        toast.error('No jobs found');
        return;
      }
      
      const job = jobs[0];
      console.log('Found job:', job);
      
      // Determine new status (cycle through statuses)
      const statusCycle = ['New', 'In Progress', 'Completed', 'On Hold', 'Cancelled'];
      const currentIndex = statusCycle.indexOf(job.status);
      const newStatus = statusCycle[(currentIndex + 1) % statusCycle.length];
      
      console.log(`Updating job ${job.id} from ${job.status} to ${newStatus}`);
      
      // Try to update status
      const { data: updatedJob, error: updateError } = await supabase
        .from('jobs')
        .update({ status: newStatus })
        .eq('id', job.id)
        .select();
      
      if (updateError) {
        console.error('Update error:', updateError);
        setError({
          message: 'Failed to update job status',
          error: updateError,
          job: job
        });
        toast.error('Update failed');
        return;
      }
      
      console.log('Update successful:', updatedJob);
      setResult({
        message: `Updated job status from ${job.status} to ${newStatus}`,
        job: updatedJob?.[0],
        automation: 'This should trigger automation workflows for job_status_changed'
      });
      toast.success(`Updated status: ${job.status} → ${newStatus}`);
      
      // Check for automation logs after a delay
      setTimeout(async () => {
        const { data: logs } = await supabase
          .from('automation_execution_logs')
          .select('*')
          .eq('trigger_type', 'job_status_changed')
          .order('created_at', { ascending: false })
          .limit(1);
        
        if (logs && logs.length > 0) {
          toast.info('Automation triggered! Check the logs.');
        }
      }, 2000);
      
    } catch (err) {
      console.error('Unexpected error:', err);
      setError(err);
      toast.error('Unexpected error occurred');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Job Query Debugger</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={testJobQuery}>Test Jobs Query</Button>
          <Button onClick={testJobStatusUpdate}>Test Status Update</Button>
        </div>
        
        {result && (
          <div>
            <h3 className="text-sm font-medium mb-2">Result:</h3>
            <pre className="text-xs bg-muted p-2 rounded overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
        
        {error && (
          <div>
            <h3 className="text-sm font-medium mb-2 text-red-500">Error:</h3>
            <pre className="text-xs bg-red-50 p-2 rounded overflow-auto text-red-800">
              {JSON.stringify(error, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
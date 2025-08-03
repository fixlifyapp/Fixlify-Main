// Test component for debugging job status updates
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useJobDetails } from '@/components/jobs/context/JobDetailsContext';

export const JobStatusDebugger = ({ jobId }: { jobId: string }) => {
  const [dbStatus, setDbStatus] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const { job, currentStatus, updateJobStatus } = useJobDetails();

  const loadDbStatus = async () => {
    const { data, error } = await supabase
      .from('jobs')
      .select('status')
      .eq('id', jobId)
      .single();
    
    if (error) {
      console.error('Error loading status:', error);
    } else {
      setDbStatus(data.status);
    }
  };

  useEffect(() => {
    loadDbStatus();
    
    // Subscribe to changes
    const channel = supabase
      .channel(`job-status-debug-${jobId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'jobs',
          filter: `id=eq.${jobId}`
        },
        (payload) => {
          console.log('Debug: Status update detected', payload);
          if (payload.new?.status) {
            setDbStatus(payload.new.status);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [jobId]);

  const directDbUpdate = async (newStatus: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('jobs')
        .update({ status: newStatus })
        .eq('id', jobId);
      
      if (error) throw error;
      
      toast.success('Direct DB update successful');
      await loadDbStatus();
    } catch (error) {
      console.error('Direct update error:', error);
      toast.error('Direct update failed');
    } finally {
      setLoading(false);
    }
  };

  const contextUpdate = async (newStatus: string) => {
    setLoading(true);
    try {
      await updateJobStatus(newStatus);
      toast.success('Context update successful');
      await loadDbStatus();
    } catch (error) {
      console.error('Context update error:', error);
      toast.error('Context update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Job Status Debugger</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="font-medium">Database Status:</p>
            <p className="text-lg">{dbStatus}</p>
          </div>
          <div>
            <p className="font-medium">Context Status:</p>
            <p className="text-lg">{currentStatus}</p>
          </div>
          <div>
            <p className="font-medium">Job Object Status:</p>
            <p className="text-lg">{job?.status || 'N/A'}</p>
          </div>
        </div>
        
        <div className="space-y-2">
          <p className="text-sm font-medium">Direct DB Update:</p>
          <Select onValueChange={directDbUpdate} disabled={loading}>
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="New">New</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="Cancelled">Cancelled</SelectItem>
              <SelectItem value="On Hold">On Hold</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <p className="text-sm font-medium">Context Update:</p>
          <Select onValueChange={contextUpdate} disabled={loading}>
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="New">New</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="Cancelled">Cancelled</SelectItem>
              <SelectItem value="On Hold">On Hold</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Button 
          onClick={loadDbStatus} 
          variant="outline" 
          size="sm"
          disabled={loading}
        >
          Refresh DB Status
        </Button>
      </CardContent>
    </Card>
  );
};

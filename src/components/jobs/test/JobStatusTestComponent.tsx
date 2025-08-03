// Test component to verify job status updates
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useJobStatuses } from '@/hooks/useConfigItems';

export const JobStatusTestComponent = ({ jobId }: { jobId: string }) => {
  const [currentStatus, setCurrentStatus] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const { items: jobStatuses } = useJobStatuses();

  // Load current status
  useEffect(() => {
    const loadStatus = async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select('status')
        .eq('id', jobId)
        .single();
      
      if (error) {
        console.error('Error loading job status:', error);
        toast.error('Failed to load job status');
      } else if (data) {
        setCurrentStatus(data.status || '');
      }
    };
    
    loadStatus();
  }, [jobId]);

  // Subscribe to real-time updates
  useEffect(() => {
    const channel = supabase
      .channel(`job-status-test-${jobId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'jobs',
          filter: `id=eq.${jobId}`
        },
        (payload) => {
          console.log('Real-time update received:', payload);
          if (payload.new && payload.new.status) {
            setCurrentStatus(payload.new.status);
            toast.info(`Status updated to: ${payload.new.status} (real-time)`);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [jobId]);

  const handleStatusUpdate = async (newStatus: string) => {
    setIsLoading(true);
    
    try {
      console.log('Updating job status:', { jobId, currentStatus, newStatus });
      
      const { data, error } = await supabase
        .from('jobs')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', jobId)
        .select()
        .single();
      
      if (error) {
        console.error('Update error:', error);
        toast.error(`Failed to update status: ${error.message}`);
      } else {
        console.log('Update successful:', data);
        setCurrentStatus(newStatus);
        toast.success(`Status updated to: ${newStatus}`);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('Unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Job Status Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground mb-2">Job ID: {jobId}</p>
          <p className="text-sm text-muted-foreground mb-2">Current Status: <strong>{currentStatus}</strong></p>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Update Status:</label>
          <Select
            value={currentStatus}
            onValueChange={handleStatusUpdate}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {jobStatuses.map((status) => (
                <SelectItem key={status.id} value={status.name}>
                  {status.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="text-xs text-muted-foreground">
          <p>Open browser console to see detailed logs</p>
        </div>
      </CardContent>
    </Card>
  );
};

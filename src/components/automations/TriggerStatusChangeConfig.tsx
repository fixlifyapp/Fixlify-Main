import React, { useEffect, useState } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';

interface TriggerStatusChangeConfigProps {
  config: any;
  onUpdate: (config: any) => void;
}

interface JobStatus {
  id: string;
  name: string;
  color?: string;
  sequence: number;
}

export const TriggerStatusChangeConfig: React.FC<TriggerStatusChangeConfigProps> = ({ 
  config, 
  onUpdate 
}) => {
  const { user } = useAuth();
  const [jobStatuses, setJobStatuses] = useState<JobStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchStatuses = async () => {
      if (!user?.id) {
        console.log('No user ID available for fetching job statuses');
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      
      try {
        console.log('Fetching job statuses for user:', user.id);
        
        const { data, error } = await supabase
          .from('job_statuses')
          .select('*')
          .eq('user_id', user.id)
          .order('sequence', { ascending: true });
        
        if (error) {
          console.error('Error fetching job statuses:', error);
          throw error;
        }
        
        console.log('Fetched job statuses:', data);
        setJobStatuses(data || []);
      } catch (error) {
        console.error('Failed to fetch job statuses:', error);
        setJobStatuses([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStatuses();
  }, [user?.id]);
  
  if (isLoading) {
    return (
      <div className="space-y-3 p-3 bg-muted/10 rounded-lg">
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-sm text-muted-foreground">Loading statuses...</span>
        </div>
      </div>
    );
  }
  
  if (!user?.id) {
    return (
      <div className="space-y-3 p-3 bg-muted/10 rounded-lg">
        <div className="text-sm text-amber-600">Please log in to configure status triggers.</div>
      </div>
    );
  }
  
  if (jobStatuses.length === 0) {
    return (
      <div className="space-y-3 p-3 bg-muted/10 rounded-lg">
        <div className="text-sm text-amber-600">
          No job statuses found. Please configure job statuses in Settings → Job Configuration.
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-3 p-3 bg-muted/10 rounded-lg">
      <div className="text-sm font-medium text-muted-foreground">Job Status Change Configuration</div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* From Status */}
        <div className="space-y-2">
          <Label className="text-xs">From Status</Label>
          <Select
            value={config.from_status?.[0] || 'any'}
            onValueChange={(value) => {
              console.log('From status changed to:', value);
              onUpdate({ ...config, from_status: value === 'any' ? [] : [value] });
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select from status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any Status</SelectItem>
              {jobStatuses.map((status) => (
                <SelectItem key={status.id} value={status.name}>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full border" 
                      style={{ 
                        backgroundColor: status.color || '#6b7280',
                        borderColor: status.color || '#6b7280'
                      }}
                    />
                    {status.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* To Status */}
        <div className="space-y-2">
          <Label className="text-xs">To Status</Label>
          <Select
            value={config.to_status?.[0] || 'any'}
            onValueChange={(value) => {
              console.log('To status changed to:', value);
              onUpdate({ ...config, to_status: value === 'any' ? [] : [value] });
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select to status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any Status</SelectItem>
              {jobStatuses.map((status) => (
                <SelectItem key={status.id} value={status.name}>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full border" 
                      style={{ 
                        backgroundColor: status.color || '#6b7280',
                        borderColor: status.color || '#6b7280'
                      }}
                    />
                    {status.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="text-xs text-muted-foreground">
        Triggers when a job status changes. Optionally filter by specific status transitions.
      </div>
    </div>
  );
};

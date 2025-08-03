import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';

export interface JobStatus {
  id: string;
  company_id: string;
  name: string;
  color: string;
  order: number;
  is_default: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useJobStatuses = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: items = [], isLoading, error } = useQuery({
    queryKey: ['jobStatuses', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('job_statuses')
        .select('*')
        .eq('company_id', user?.user_metadata?.company_id)
        .order('order', { ascending: true });

      if (error) throw error;
      return data as JobStatus[];
    },
    enabled: !!user?.user_metadata?.company_id,
  });

  const createMutation = useMutation({
    mutationFn: async (newStatus: Partial<JobStatus>) => {
      const { data, error } = await supabase
        .from('job_statuses')
        .insert({
          ...newStatus,
          company_id: user?.user_metadata?.company_id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobStatuses'] });
      toast.success('Job status created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create job status');
      console.error('Error creating job status:', error);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<JobStatus> & { id: string }) => {
      const { data, error } = await supabase
        .from('job_statuses')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobStatuses'] });
      toast.success('Job status updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update job status');
      console.error('Error updating job status:', error);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('job_statuses')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobStatuses'] });
      toast.success('Job status deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete job status');
      console.error('Error deleting job status:', error);
    },
  });

  return {
    items,
    isLoading,
    error,
    createStatus: createMutation.mutate,
    updateStatus: updateMutation.mutate,
    deleteStatus: deleteMutation.mutate,
  };
};

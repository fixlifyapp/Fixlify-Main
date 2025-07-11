import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Task, CreateTaskInput, UpdateTaskInput } from '@/types/task';
import { toast } from 'sonner';
import { useOrganization } from './use-organization';

export const useTasks = (filters?: {
  job_id?: string;
  client_id?: string;
  assigned_to?: string;
  status?: string;
}) => {
  const { organization } = useOrganization();

  return useQuery({
    queryKey: ['tasks', organization?.id, filters],
    queryFn: async () => {
      let query = supabase
        .from('tasks')
        .select('*')
        .eq('organization_id', organization?.id)
        .order('created_at', { ascending: false });

      if (filters?.job_id) {
        query = query.eq('job_id', filters.job_id);
      }
      if (filters?.client_id) {
        query = query.eq('client_id', filters.client_id);
      }
      if (filters?.assigned_to) {
        query = query.eq('assigned_to', filters.assigned_to);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Task[];
    },
    enabled: !!organization?.id,
  });
};

export const useCreateTask = () => {
  const queryClient = useQueryClient();
  const { organization } = useOrganization();

  return useMutation({
    mutationFn: async (input: CreateTaskInput) => {
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          ...input,
          organization_id: organization?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data as Task;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Task created successfully');
    },
    onError: (error) => {
      console.error('Failed to create task:', error);
      toast.error('Failed to create task');
    },
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...input }: UpdateTaskInput & { id: string }) => {
      const updates: any = { ...input, updated_at: new Date().toISOString() };
      
      // If marking as completed, set completed_at and completed_by
      if (input.status === 'completed' && !updates.completed_at) {
        const { data: { user } } = await supabase.auth.getUser();
        updates.completed_at = new Date().toISOString();
        updates.completed_by = user?.id;
      }

      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Task;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Task updated successfully');
    },
    onError: (error) => {
      console.error('Failed to update task:', error);
      toast.error('Failed to update task');
    },
  });
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Task deleted successfully');
    },
    onError: (error) => {
      console.error('Failed to delete task:', error);
      toast.error('Failed to delete task');
    },
  });
};

// Get tasks for a specific job
export const useJobTasks = (jobId: string) => {
  return useTasks({ job_id: jobId });
};

// Get tasks assigned to current user
export const useMyTasks = () => {
  const { data: { user } } = supabase.auth.getUser();
  return useTasks({ assigned_to: user?.id });
};

// Get overdue tasks
export const useOverdueTasks = () => {
  const { organization } = useOrganization();

  return useQuery({
    queryKey: ['tasks', 'overdue', organization?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('organization_id', organization?.id)
        .lt('due_date', new Date().toISOString())
        .in('status', ['pending', 'in_progress'])
        .order('due_date', { ascending: true });

      if (error) throw error;
      return data as Task[];
    },
    enabled: !!organization?.id,
  });
};

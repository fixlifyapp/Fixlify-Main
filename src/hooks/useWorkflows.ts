import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './use-auth';
import { useOrganization } from './use-organization';
import { toast } from 'sonner';

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  triggers: any[];
  steps: any[];
  settings: any;
  enabled: boolean;
  status: string;
  execution_count: number;
  success_count: number;
  created_at: string;
  updated_at: string;
}

export const useWorkflows = () => {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const { user } = useAuth();
  const { organization } = useOrganization();

  const fetchWorkflows = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('automation_workflows')
        .select('*')
        .eq('user_id', user.id)
        .eq('workflow_type', 'workflow')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWorkflows(data || []);
    } catch (error) {
      console.error('Error fetching workflows:', error);
      toast.error('Failed to fetch workflows');
    } finally {
      setIsLoading(false);
    }
  };

  const createWorkflow = async (workflowData: any) => {
    if (!user?.id || !organization?.id) {
      toast.error('User not authenticated');
      return;
    }

    try {
      setIsCreating(true);
      const { data, error } = await supabase
        .from('automation_workflows')
        .insert({
          user_id: user.id,
          organization_id: organization.id,
          name: workflowData.name,
          description: workflowData.description,
          workflow_type: 'workflow',
          triggers: workflowData.triggers,
          steps: workflowData.steps,
          settings: workflowData.settings,
          enabled: workflowData.enabled,
          status: workflowData.enabled ? 'active' : 'paused',
          category: 'workflow',
          execution_count: 0,
          success_count: 0
        })
        .select()
        .single();

      if (error) throw error;

      setWorkflows([data, ...workflows]);
      toast.success('Workflow created successfully!');
      return data;
    } catch (error) {
      console.error('Error creating workflow:', error);
      toast.error('Failed to create workflow');
      throw error;
    } finally {
      setIsCreating(false);
    }
  };

  const updateWorkflow = async ({ id, updates }: { id: string; updates: any }) => {
    try {
      setIsUpdating(true);
      const { data, error } = await supabase
        .from('automation_workflows')
        .update({
          name: updates.name,
          description: updates.description,
          triggers: updates.triggers,
          steps: updates.steps,
          settings: updates.settings,
          enabled: updates.enabled,
          status: updates.enabled ? 'active' : 'paused',
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setWorkflows(workflows.map(w => w.id === id ? data : w));
      toast.success('Workflow updated successfully!');
      return data;
    } catch (error) {
      console.error('Error updating workflow:', error);
      toast.error('Failed to update workflow');
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  const deleteWorkflow = async (id: string) => {
    try {
      const { error } = await supabase
        .from('automation_workflows')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setWorkflows(workflows.filter(w => w.id !== id));
      toast.success('Workflow deleted successfully!');
    } catch (error) {
      console.error('Error deleting workflow:', error);
      toast.error('Failed to delete workflow');
    }
  };

  useEffect(() => {
    fetchWorkflows();
  }, [user?.id]);

  return {
    workflows,
    isLoading,
    isCreating,
    isUpdating,
    fetchWorkflows,
    createWorkflow,
    updateWorkflow,
    deleteWorkflow
  };
};

export const useWorkflow = (id: string) => {
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const fetchWorkflow = async () => {
    if (!user?.id || !id) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('automation_workflows')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      setWorkflow(data);
    } catch (error) {
      console.error('Error fetching workflow:', error);
      toast.error('Failed to fetch workflow');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchWorkflow();
    }
  }, [id, user?.id]);

  return {
    workflow,
    isLoading,
    refetch: fetchWorkflow
  };
};

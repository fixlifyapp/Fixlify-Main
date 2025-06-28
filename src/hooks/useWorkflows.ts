import { useState, useEffect } from 'react';
import { workflowService, Workflow } from '@/services/workflowService';
import { toast } from 'sonner';

export const useWorkflows = () => {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchWorkflows = async () => {
    try {
      setIsLoading(true);
      const data = await workflowService.getWorkflows();
      setWorkflows(data);
    } catch (error) {
      console.error('Error fetching workflows:', error);
      toast.error('Failed to fetch workflows');
    } finally {
      setIsLoading(false);
    }
  };

  const createWorkflow = async (workflowData: Workflow) => {
    try {
      setIsCreating(true);
      const data = await workflowService.createWorkflow(workflowData);
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

  const updateWorkflow = async (id: string, updates: Partial<Workflow>) => {
    try {
      setIsUpdating(true);
      const data = await workflowService.updateWorkflow(id, updates);
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
      await workflowService.deleteWorkflow(id);
      setWorkflows(workflows.filter(w => w.id !== id));
      toast.success('Workflow deleted successfully!');
    } catch (error) {
      console.error('Error deleting workflow:', error);
      toast.error('Failed to delete workflow');
    }
  };

  const toggleWorkflow = async ({ id, enabled }: { id: string; enabled: boolean }) => {
    try {
      const data = await workflowService.toggleWorkflow(id, enabled);
      setWorkflows(workflows.map(w => w.id === id ? data : w));
      toast.success(enabled ? 'Workflow enabled' : 'Workflow disabled');
      return data;
    } catch (error) {
      console.error('Error toggling workflow:', error);
      toast.error('Failed to toggle workflow');
    }
  };

  const executeWorkflow = async ({ workflowId }: { workflowId: string }) => {
    try {
      await workflowService.executeWorkflow(workflowId);
      await fetchWorkflows(); // Refresh to get updated metrics
    } catch (error) {
      console.error('Error executing workflow:', error);
      toast.error('Failed to execute workflow');
    }
  };

  useEffect(() => {
    fetchWorkflows();
  }, []);

  return {
    workflows,
    isLoading,
    isCreating,
    isUpdating,
    fetchWorkflows,
    createWorkflow,
    updateWorkflow,
    deleteWorkflow,
    toggleWorkflow,
    executeWorkflow
  };
};

export const useWorkflow = (id: string) => {
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchWorkflow = async () => {
    if (!id) return;

    try {
      setIsLoading(true);
      const data = await workflowService.getWorkflow(id);
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
  }, [id]);

  return {
    workflow,
    isLoading,
    refetch: fetchWorkflow
  };
};
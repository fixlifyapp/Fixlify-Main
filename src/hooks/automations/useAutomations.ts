import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/OrganizationContext';
import { toast } from 'sonner';

export interface AutomationWorkflow {
  id: string;
  organization_id: string;
  name: string;
  description?: string;
  status: 'active' | 'paused' | 'draft' | 'archived';
  category?: string;
  template_id?: string;
  visual_config?: any;
  performance_metrics?: any;
  last_triggered_at?: string;
  execution_count: number;
  success_count: number;
  created_at: string;
  updated_at: string;
}

export interface AutomationTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  template_config: any;
  usage_count: number;
  success_rate?: number;
  average_revenue?: number;
  estimated_time_saved?: string;
  required_integrations: string[];
  tags: string[];
  is_featured: boolean;
}

export interface AutomationHistory {
  id: string;
  workflow_id: string;
  execution_status: 'success' | 'failed' | 'partial';
  execution_time_ms?: number;
  error_details?: any;
  variables_used?: any;
  actions_executed?: any;
  created_at: string;
}

export const useAutomations = () => {
  const [workflows, setWorkflows] = useState<AutomationWorkflow[]>([]);
  const [templates, setTemplates] = useState<AutomationTemplate[]>([]);
  const [history, setHistory] = useState<AutomationHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { organization } = useOrganization();

  // Fetch workflows
  const fetchWorkflows = async () => {
    try {
      // First, get the current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('User not authenticated');
        return;
      }

      // Use organization.id if available, otherwise use user.id
      const orgId = organization?.id || user.id;
      
      console.log('Fetching workflows for org:', orgId);
      
      const { data, error } = await supabase
        .from('automation_workflows')
        .select('*')
        .eq('organization_id', orgId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      console.log('Workflows fetched:', data);
      setWorkflows(data || []);
    } catch (err) {
      console.error('Error fetching workflows:', err);
      setError('Failed to load automations');
      toast.error('Failed to load automations');
    }
  };

  // Fetch templates
  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('automation_templates')
        .select('*')
        .order('usage_count', { ascending: false });
      
      if (error) throw error;
      setTemplates(data || []);
    } catch (err) {
      console.error('Error fetching templates:', err);
    }
  };

  // Fetch history
  const fetchHistory = async (workflowId?: string) => {
    if (!organization?.id) return;
    
    try {
      let query = supabase
        .from('automation_history')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (workflowId) {
        query = query.eq('workflow_id', workflowId);
      } else {
        // Get history for all workflows in the organization
        const workflowIds = workflows.map(w => w.id);
        if (workflowIds.length > 0) {
          query = query.in('workflow_id', workflowIds);
        }
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      setHistory(data || []);
    } catch (err) {
      console.error('Error fetching history:', err);
    }
  };

  // Create workflow
  const createWorkflow = async (workflow: Partial<AutomationWorkflow>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('User not authenticated');
        return null;
      }

      const orgId = organization?.id || user.id;
      
      const { data, error } = await supabase
        .from('automation_workflows')
        .insert({
          ...workflow,
          organization_id: orgId,
          status: workflow.status || 'draft',
          execution_count: 0,
          success_count: 0
        })
        .select()
        .single();
      
      if (error) throw error;
      
      setWorkflows([data, ...workflows]);
      toast.success('Automation created successfully');
      return data;
    } catch (err) {
      console.error('Error creating workflow:', err);
      toast.error('Failed to create automation');
      return null;
    }
  };

  // Update workflow
  const updateWorkflow = async (id: string, updates: Partial<AutomationWorkflow>) => {
    try {
      const { data, error } = await supabase
        .from('automation_workflows')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      setWorkflows(workflows.map(w => w.id === id ? data : w));
      toast.success('Automation updated successfully');
      return data;
    } catch (err) {
      console.error('Error updating workflow:', err);
      toast.error('Failed to update automation');
      return null;
    }
  };

  // Toggle workflow status
  const toggleWorkflowStatus = async (id: string) => {
    const workflow = workflows.find(w => w.id === id);
    if (!workflow) return;
    
    const newStatus = workflow.status === 'active' ? 'paused' : 'active';
    return updateWorkflow(id, { status: newStatus });
  };

  // Delete workflow
  const deleteWorkflow = async (id: string) => {
    try {
      const { error } = await supabase
        .from('automation_workflows')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setWorkflows(workflows.filter(w => w.id !== id));
      toast.success('Automation deleted successfully');
      return true;
    } catch (err) {
      console.error('Error deleting workflow:', err);
      toast.error('Failed to delete automation');
      return false;
    }
  };

  // Execute workflow manually
  const executeWorkflow = async (id: string, variables?: any) => {
    try {
      // Call edge function to execute workflow
      const { data, error } = await supabase.functions.invoke('execute-automation', {
        body: { workflow_id: id, variables }
      });
      
      if (error) throw error;
      
      toast.success('Automation executed successfully');
      // Refresh history
      fetchHistory(id);
      return data;
    } catch (err) {
      console.error('Error executing workflow:', err);
      toast.error('Failed to execute automation');
      return null;
    }
  };

  // Calculate performance metrics
  const calculateMetrics = () => {
    const totalExecutions = workflows.reduce((sum, w) => sum + w.execution_count, 0);
    const totalSuccesses = workflows.reduce((sum, w) => sum + w.success_count, 0);
    const successRate = totalExecutions > 0 ? (totalSuccesses / totalExecutions) * 100 : 0;
    
    const activeWorkflows = workflows.filter(w => w.status === 'active').length;
    const recentExecutions = history.filter(h => {
      const date = new Date(h.created_at);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return date > weekAgo;
    }).length;
    
    return {
      totalWorkflows: workflows.length,
      activeWorkflows,
      totalExecutions,
      successRate,
      recentExecutions
    };
  };

  // Initialize data
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      setError(null);
      await Promise.all([
        fetchWorkflows(),
        fetchTemplates()
      ]);
      setLoading(false);
    };
    
    init();
  }, []); // Remove organization dependency

  // Fetch history when workflows change
  useEffect(() => {
    if (workflows.length > 0) {
      fetchHistory();
    }
  }, [workflows]);

  // Real-time subscriptions
  useEffect(() => {
    const setupSubscriptions = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const orgId = organization?.id || user.id;
      
      // Subscribe to workflow changes
      const workflowSubscription = supabase
        .channel(`workflows-${orgId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'automation_workflows',
            filter: `organization_id=eq.${orgId}`
          },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              setWorkflows(prev => [payload.new as AutomationWorkflow, ...prev]);
            } else if (payload.eventType === 'UPDATE') {
              setWorkflows(prev => prev.map(w => 
                w.id === payload.new.id ? payload.new as AutomationWorkflow : w
              ));
            } else if (payload.eventType === 'DELETE') {
              setWorkflows(prev => prev.filter(w => w.id !== payload.old.id));
            }
          }
        )
        .subscribe();
      
      // Subscribe to history changes
      const historySubscription = supabase
        .channel(`history-${orgId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'automation_history'
          },
          (payload) => {
            const workflowIds = workflows.map(w => w.id);
            if (workflowIds.includes(payload.new.workflow_id)) {
              setHistory(prev => [payload.new as AutomationHistory, ...prev]);
            }
          }
        )
        .subscribe();
      
      return () => {
        workflowSubscription.unsubscribe();
        historySubscription.unsubscribe();
      };
    };

    setupSubscriptions();
  }, [workflows]);

  return {
    workflows,
    templates,
    history,
    loading,
    error,
    createWorkflow,
    updateWorkflow,
    deleteWorkflow,
    toggleWorkflowStatus,
    executeWorkflow,
    metrics: calculateMetrics(),
    refetch: {
      workflows: fetchWorkflows,
      templates: fetchTemplates,
      history: fetchHistory
    }
  };
};

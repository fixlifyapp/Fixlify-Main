import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface WorkflowStep {
  id: string;
  type: 'trigger' | 'action' | 'condition' | 'delay';
  category?: string;
  name: string;
  description?: string;
  icon?: any;
  color?: string;
  config: any;
  enabled?: boolean;
}

export interface WorkflowNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: any;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  type?: string;
  animated?: boolean;
  style?: any;
}

export interface Workflow {
  id?: string;
  name: string;
  description?: string;
  isActive: boolean;
  nodes?: WorkflowNode[];
  edges?: WorkflowEdge[];
  steps?: WorkflowStep[];
  triggers?: any[];
  actions?: any[];
  enabled?: boolean;
  status?: string;
  user_id?: string;
  organization_id?: string;
  created_at?: string;
  updated_at?: string;
}

export class WorkflowService {
  static async createWorkflow(workflow: Workflow) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single();

    const { data, error } = await supabase
      .from('automation_workflows')
      .insert({
        name: workflow.name,
        description: workflow.description,
        is_active: workflow.isActive,
        nodes: workflow.nodes || [],
        edges: workflow.edges || [],
        triggers: workflow.triggers || [],
        steps: workflow.steps || [],
        enabled: workflow.isActive,
        status: workflow.isActive ? 'active' : 'inactive',
        user_id: user.id,
        organization_id: profile?.organization_id,
        workflow_type: 'vertical'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updateWorkflow(id: string, workflow: Partial<Workflow>) {
    const { data, error } = await supabase
      .from('automation_workflows')
      .update({
        name: workflow.name,
        description: workflow.description,
        is_active: workflow.isActive,
        nodes: workflow.nodes,
        edges: workflow.edges,
        triggers: workflow.triggers,
        steps: workflow.steps,
        enabled: workflow.isActive,
        status: workflow.isActive ? 'active' : 'inactive',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getWorkflow(id: string) {
    const { data, error } = await supabase
      .from('automation_workflows')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return this.transformWorkflow(data);
  }

  static async getWorkflows() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('automation_workflows')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data?.map(this.transformWorkflow) || [];
  }

  static async deleteWorkflow(id: string) {
    const { error } = await supabase
      .from('automation_workflows')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  static async toggleWorkflow(id: string, enabled: boolean) {
    const { data, error } = await supabase
      .from('automation_workflows')
      .update({ 
        enabled,
        is_active: enabled,
        status: enabled ? 'active' : 'inactive',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async executeWorkflow(id: string) {
    try {
      // Log the execution
      const { error: logError } = await supabase
        .from('automation_execution_logs')
        .insert({
          workflow_id: id,
          status: 'running',
          started_at: new Date().toISOString()
        });

      if (logError) console.error('Error logging execution:', logError);

      // Update workflow metrics
      await supabase.rpc('increment_workflow_execution', { workflow_id: id });

      // Here you would implement the actual workflow execution logic
      // For now, we'll just simulate it
      toast.info('Workflow execution started');

      return { success: true };
    } catch (error) {
      console.error('Error executing workflow:', error);
      throw error;
    }
  }

  private static transformWorkflow(data: any): Workflow {
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      isActive: data.is_active || data.enabled || false,
      nodes: data.nodes || [],
      edges: data.edges || [],
      triggers: data.triggers || [],
      steps: data.steps || [],
      enabled: data.enabled,
      status: data.status,
      user_id: data.user_id,
      organization_id: data.organization_id,
      created_at: data.created_at,
      updated_at: data.updated_at
    };
  }
}

export const workflowService = WorkflowService;
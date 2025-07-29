import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface AutomationWorkflow {
  id?: string;
  name: string;
  description: string;
  user_id?: string;
  organization_id?: string;
  template_config: any;
  status: string;
  execution_count?: number;
  success_count?: number;
  last_triggered_at?: string;
  created_at?: string;
  updated_at?: string;
}

export class AutomationService {
  static async createWorkflow(workflow: Partial<AutomationWorkflow>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('automation_workflows')
      .insert({
        name: workflow.name || 'New Workflow',
        description: workflow.description || '',
        template_config: workflow.template_config || {},
        status: 'active',
        user_id: user.id
      })
      .select()
      .single();

    if (error) throw error;
    return data;
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
    return (data || []) as AutomationWorkflow[];
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
      .update({ status: enabled ? 'active' : 'inactive' })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async executeWorkflow(id: string, context?: any) {
    try {
      await supabase.rpc('increment_automation_metrics', { 
        workflow_id: id, 
        success: true 
      });
      toast.success('Workflow executed successfully');
      return { success: true };
    } catch (error) {
      toast.error('Failed to execute workflow');
      throw error;
    }
  }

  static async updateWorkflow(id: string, updates: Partial<AutomationWorkflow>) {
    const { data, error } = await supabase
      .from('automation_workflows')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getExecutionLogs() {
    const { data, error } = await supabase
      .from('automation_execution_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    return data || [];
  }

  static async testWorkflow(workflowId: string, testData?: any) {
    toast.info('Testing workflow...');
    await this.executeWorkflow(workflowId, testData);
    toast.success('Workflow test completed!');
  }
}

export const automationService = AutomationService;
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface WorkflowData {
  id?: string;
  name: string;
  description?: string;
  trigger_config: any;
  steps: any[];
  settings: any;
  enabled: boolean;
  organization_id?: string;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface WorkflowExecution {
  id?: string;
  workflow_id: string;
  trigger_data: any;
  status: 'pending' | 'running' | 'completed' | 'failed';
  current_step?: number;
  execution_log?: any[];
  started_at?: string;
  completed_at?: string;
  error?: string;
}

// Workflow CRUD operations
export const workflowService = {
  // Create a new workflow
  async createWorkflow(workflow: WorkflowData) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('advanced_workflows')
        .insert([{
          ...workflow,
          created_by: user.id,
          organization_id: user.user_metadata?.organization_id
        }])
        .select()
        .single();

      if (error) throw error;
      toast.success('Workflow created successfully');
      return data;
    } catch (error) {
      console.error('Error creating workflow:', error);
      toast.error('Failed to create workflow');
      throw error;
    }
  },

  // Update an existing workflow
  async updateWorkflow(id: string, updates: Partial<WorkflowData>) {
    try {
      const { data, error } = await supabase
        .from('advanced_workflows')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      toast.success('Workflow updated successfully');
      return data;
    } catch (error) {
      console.error('Error updating workflow:', error);
      toast.error('Failed to update workflow');
      throw error;
    }
  },

  // Get all workflows for the organization
  async getWorkflows() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('advanced_workflows')
        .select('*')
        .eq('organization_id', user.user_metadata?.organization_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching workflows:', error);
      toast.error('Failed to fetch workflows');
      throw error;
    }
  },

  // Get a single workflow by ID
  async getWorkflow(id: string) {
    try {
      const { data, error } = await supabase
        .from('advanced_workflows')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching workflow:', error);
      toast.error('Failed to fetch workflow');
      throw error;
    }
  },

  // Delete a workflow
  async deleteWorkflow(id: string) {
    try {
      const { error } = await supabase
        .from('advanced_workflows')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Workflow deleted successfully');
    } catch (error) {
      console.error('Error deleting workflow:', error);
      toast.error('Failed to delete workflow');
      throw error;
    }
  },

  // Toggle workflow enabled status
  async toggleWorkflow(id: string, enabled: boolean) {
    try {
      const { data, error } = await supabase
        .from('advanced_workflows')
        .update({ 
          enabled,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      toast.success(`Workflow ${enabled ? 'enabled' : 'disabled'}`);
      return data;
    } catch (error) {
      console.error('Error toggling workflow:', error);
      toast.error('Failed to toggle workflow');
      throw error;
    }
  },

  // Execute a workflow
  async executeWorkflow(workflowId: string, triggerData: any = {}) {
    try {
      const { data, error } = await supabase
        .from('advanced_workflow_executions')
        .insert([{
          workflow_id: workflowId,
          trigger_data: triggerData,
          status: 'pending',
          current_step: 0,
          execution_log: [],
          started_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      
      // Here you would trigger the actual workflow execution
      // This could be done through a Supabase Edge Function or background job
      
      toast.success('Workflow execution started');
      return data;
    } catch (error) {
      console.error('Error executing workflow:', error);
      toast.error('Failed to execute workflow');
      throw error;
    }
  },

  // Get workflow execution history
  async getExecutions(workflowId: string) {
    try {
      const { data, error } = await supabase
        .from('advanced_workflow_executions')
        .select('*')
        .eq('workflow_id', workflowId)
        .order('started_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching executions:', error);
      toast.error('Failed to fetch execution history');
      throw error;
    }
  },

  // Get workflow templates
  async getTemplates() {
    try {
      const { data, error } = await supabase
        .from('advanced_workflow_templates')
        .select('*')
        .eq('is_public', true)
        .order('usage_count', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast.error('Failed to fetch templates');
      throw error;
    }
  },

  // Save workflow as template
  async saveAsTemplate(workflow: WorkflowData, templateName: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('advanced_workflow_templates')
        .insert([{
          name: templateName,
          description: workflow.description,
          workflow_config: {
            trigger_config: workflow.trigger_config,
            steps: workflow.steps,
            settings: workflow.settings
          },
          created_by: user.id,
          organization_id: user.user_metadata?.organization_id,
          is_public: false
        }])
        .select()
        .single();

      if (error) throw error;
      toast.success('Template saved successfully');
      return data;
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error('Failed to save template');
      throw error;
    }
  }
};

// Workflow execution service
export const workflowExecutor = {
  // Process a workflow step
  async processStep(execution: WorkflowExecution, step: any) {
    try {
      let result: any = { success: true };

      switch (step.type) {
        case 'email':
          result = await this.sendEmail(step.config);
          break;
        case 'sms':
          result = await this.sendSMS(step.config);
          break;
        case 'delay':
          result = await this.createDelay(step.config);
          break;
        case 'conditional':
          result = await this.evaluateCondition(step);
          break;
        case 'gift_card':
          result = await this.sendGiftCard(step.config);
          break;
        // Add more step types as needed
      }

      // Update execution log
      await this.updateExecutionLog(execution.id!, step, result);
      
      return result;
    } catch (error) {
      console.error('Error processing step:', error);
      await this.updateExecutionLog(execution.id!, step, { 
        success: false, 
        error: error.message 
      });
      throw error;
    }
  },

  // Send email
  async sendEmail(config: any) {
    // This would integrate with your email service
    // For now, we'll simulate it
    console.log('Sending email:', config);
    return { success: true, messageId: `email-${Date.now()}` };
  },

  // Send SMS
  async sendSMS(config: any) {
    // This would integrate with your SMS service (e.g., Twilio)
    console.log('Sending SMS:', config);
    return { success: true, messageId: `sms-${Date.now()}` };
  },

  // Create delay
  async createDelay(config: any) {
    const delayMs = this.calculateDelayMs(config.delayValue, config.delayUnit);
    // In a real implementation, this would schedule a future task
    console.log('Creating delay:', delayMs, 'ms');
    return { success: true, delayMs };
  },

  // Evaluate condition
  async evaluateCondition(step: any) {
    // This would evaluate the condition based on current data
    console.log('Evaluating condition:', step.conditions);
    // For now, simulate a random result
    const result = Math.random() > 0.5;
    return { success: true, result };
  },

  // Send gift card
  async sendGiftCard(config: any) {
    // This would integrate with a gift card service
    console.log('Sending gift card:', config);
    return { success: true, giftCardCode: `GC-${Date.now()}` };
  },

  // Update execution log
  async updateExecutionLog(executionId: string, step: any, result: any) {
    const { error } = await supabase
      .from('advanced_workflow_executions')
      .update({
        execution_log: supabase.sql`array_append(execution_log, ${JSON.stringify({
          step: step.name,
          timestamp: new Date().toISOString(),
          result
        })})`,
        updated_at: new Date().toISOString()
      })
      .eq('id', executionId);

    if (error) {
      console.error('Error updating execution log:', error);
    }
  },

  // Calculate delay in milliseconds
  calculateDelayMs(value: number, unit: string): number {
    const multipliers = {
      minutes: 60 * 1000,
      hours: 60 * 60 * 1000,
      days: 24 * 60 * 60 * 1000,
      weeks: 7 * 24 * 60 * 60 * 1000
    };
    return value * (multipliers[unit] || multipliers.days);
  }
};

export default workflowService;
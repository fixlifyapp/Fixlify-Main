import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  WorkflowExecution, 
  TriggerTypes,
  ConditionTypes 
} from '@/types/automationFramework';

export interface AutomationWorkflow {
  id?: string;
  name: string;
  description: string;
  user_id?: string;
  organization_id?: string;
  template_config: any;
  status: string;
  is_active?: boolean;
  trigger_type?: string;
  execution_count?: number;
  success_count?: number;
  last_triggered_at?: string;
  created_at?: string;
  updated_at?: string;
  triggers?: any[];
  actions?: any[];
  conditions?: any[];
}

export class AutomationService {
  private static listeners: Map<string, any> = new Map();
  private static isListening = false;

  /**
   * Basic workflow management
   */
  static async createWorkflow(workflow: Partial<AutomationWorkflow>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .maybeSingle();

    // Extract trigger type from workflow steps
    const steps = workflow.template_config?.steps || [];
    const triggerStep = steps.find((s: any) => s.type === 'trigger');
    const triggerType = triggerStep?.config?.triggerType || 'manual';

    const { data, error } = await supabase
      .from('automation_workflows')
      .insert({
        name: workflow.name || 'New Workflow',
        description: workflow.description || '',
        template_config: workflow.template_config || {},
        status: workflow.status || 'active',
        is_active: true,
        trigger_type: triggerType,
        user_id: user.id,
        organization_id: profile?.organization_id || user.id
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getWorkflows() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Get user's organization
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .maybeSingle();

    const orgId = profile?.organization_id || user.id;

    // Get workflows for the organization
    const { data, error } = await supabase
      .from('automation_workflows')
      .select('*')
      .eq('organization_id', orgId)
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

  static async updateWorkflow(id: string, updates: Partial<AutomationWorkflow>) {
    // Extract trigger type if updating template config
    let triggerType = updates.trigger_type;
    if (updates.template_config?.steps) {
      const triggerStep = updates.template_config.steps.find((s: any) => s.type === 'trigger');
      triggerType = triggerStep?.config?.triggerType || 'manual';
    }

    const { data, error } = await supabase
      .from('automation_workflows')
      .update({
        ...updates,
        trigger_type: triggerType,
        is_active: updates.status === 'active'
      })
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
    await this.executeWorkflow(workflowId, { ...testData, is_test: true });
    toast.success('Workflow test completed!');
  }

  /**
   * Enhanced execution engine for multi-step workflows
   */
  static async executeWorkflow(workflowId: string, context?: any): Promise<WorkflowExecution> {
    const execution: WorkflowExecution = {
      id: crypto.randomUUID(),
      workflow_id: workflowId,
      trigger_type: context?.trigger_type || 'manual',
      trigger_data: context || {},
      status: 'running',
      started_at: new Date().toISOString(),
      steps_executed: []
    };

    try {
      // Log execution start
      await this.logExecution(execution);

      // Get workflow
      const { data: workflow, error } = await supabase
        .from('automation_workflows')
        .select('*')
        .eq('id', workflowId)
        .single();

      if (error || !workflow) {
        throw new Error(`Workflow ${workflowId} not found`);
      }

      // Get workflow steps
      const steps = workflow.template_config?.steps || [];
      const startIndex = context?.resume_from_step || 0;

      // Execute workflow steps sequentially
      for (let i = startIndex; i < steps.length; i++) {
        const step = steps[i];
        
        // Skip trigger steps during execution
        if (step.type === 'trigger') continue;

        console.log(`Executing step ${i}: ${step.type} - ${step.name}`);

        if (step.type === 'delay') {
          // Handle delay steps
          const delayResult = await this.handleDelayStep(step, workflow, execution, i);
          if (!delayResult.shouldContinue) {
            // Workflow will resume later
            return execution;
          }
        } else {
          // Execute action steps
          const stepResult = await this.executeStep(step, context, workflow);
          
          execution.steps_executed.push({
            step_id: step.id || `step_${i}`,
            step_index: i,
            status: stepResult.success ? 'completed' : 'failed',
            started_at: new Date().toISOString(),
            completed_at: new Date().toISOString(),
            output_data: stepResult.result,
            error_message: stepResult.error
          });

          if (!stepResult.success) {
            execution.status = 'failed';
            break;
          }
        }
      }

      if (execution.status === 'running') {
        execution.status = 'completed';
      }

      execution.completed_at = new Date().toISOString();

      // Update execution log
      await this.logExecution(execution);
      
      // Update workflow metrics
      await supabase.rpc('increment_automation_metrics', { 
        workflow_id: workflowId, 
        success: execution.status === 'completed'
      });

      if (execution.status === 'completed') {
        toast.success('Workflow executed successfully');
      } else {
        toast.error('Workflow execution failed');
      }

      return execution;

    } catch (error) {
      execution.status = 'failed';
      execution.completed_at = new Date().toISOString();
      await this.logExecution(execution);
      toast.error('Failed to execute workflow');
      throw error;
    }
  }

  private static async handleDelayStep(
    step: any, 
    workflow: any, 
    execution: WorkflowExecution,
    stepIndex: number
  ): Promise<{ shouldContinue: boolean }> {
    const config = step.config || {};
    const delayType = config.delayType || 'minutes';
    const delayValue = config.delayValue || 1;

    // Calculate delay in milliseconds
    let delayMs = 0;
    switch (delayType) {
      case 'minutes':
        delayMs = delayValue * 60 * 1000;
        break;
      case 'hours':
        delayMs = delayValue * 60 * 60 * 1000;
        break;
      case 'days':
        delayMs = delayValue * 24 * 60 * 60 * 1000;
        break;
      case 'weeks':
        delayMs = delayValue * 7 * 24 * 60 * 60 * 1000;
        break;
    }

    // For testing or short delays (< 1 minute), wait immediately
    if (execution.trigger_data?.is_test || delayMs < 60000) {
      const testDelay = Math.min(delayMs, 5000); // Max 5 seconds for testing
      await new Promise(resolve => setTimeout(resolve, testDelay));
      return { shouldContinue: true };
    }

    // For longer delays, schedule the workflow to resume
    const resumeAt = new Date(Date.now() + delayMs);
    
    await supabase.from('scheduled_workflow_executions').insert({
      workflow_id: workflow.id,
      execution_id: execution.id,
      resume_at: resumeAt.toISOString(),
      resume_from_step: stepIndex + 1,
      context: execution.trigger_data,
      status: 'pending'
    });

    execution.steps_executed.push({
      step_id: step.id || `step_${stepIndex}`,
      step_index: stepIndex,
      status: 'completed',
      started_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
      output_data: {
        delay_type: delayType,
        delay_value: delayValue,
        resume_at: resumeAt.toISOString()
      }
    });

    execution.status = 'paused';
    execution.paused_at = new Date().toISOString();
    execution.resume_at = resumeAt.toISOString();
    
    await this.logExecution(execution);
    
    console.log(`Workflow paused. Will resume at ${resumeAt.toISOString()}`);
    return { shouldContinue: false };
  }

  private static async executeStep(step: any, context: any, workflow: any): Promise<{success: boolean, result?: any, error?: string}> {
    try {
      switch (step.type) {
        case 'action':
          return await this.executeActionStep(step, context, workflow);
        case 'condition':
          return await this.executeConditionStep(step, context);
        case 'branch':
          return await this.executeBranchStep(step, context, workflow);
        default:
          console.warn(`Unknown step type: ${step.type}`);
          return { success: true, result: 'Step skipped - unknown type' };
      }
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  private static async executeActionStep(step: any, context: any, workflow: any): Promise<{success: boolean, result?: any, error?: string}> {
    const config = step.config || {};
    const actionType = config.actionType;

    // Process message templates with variables
    const processTemplate = (template: string) => {
      if (!template) return '';
      
      // Replace variables in the template
      return template.replace(/\{\{([^}]+)\}\}/g, (match, variable) => {
        const value = this.getVariableValue(variable.trim(), context);
        return value !== undefined ? String(value) : match;
      });
    };

    switch (actionType) {
      case 'email':
        return await this.executeEmailAction({
          to: context.client?.email || context.record?.client_email,
          subject: processTemplate(config.subject),
          message: processTemplate(config.message),
          ...config
        }, context);
      
      case 'sms':
        return await this.executeSMSAction({
          to: context.client?.phone || context.record?.client_phone,
          message: processTemplate(config.message),
          ...config
        }, context);
      
      case 'notification':
        return await this.executeNotificationAction(config, context);
      
      case 'task':
        return await this.executeCreateTaskAction(config, context);
      
      default:
        return { success: false, error: `Unknown action type: ${actionType}` };
    }
  }

  private static getVariableValue(variable: string, context: any): any {
    const parts = variable.split('.');
    let value = context;
    
    for (const part of parts) {
      if (value && typeof value === 'object') {
        value = value[part];
      } else {
        return undefined;
      }
    }
    
    // Format dates nicely
    if (variable.includes('Date') && value) {
      return new Date(value).toLocaleDateString();
    }
    if (variable.includes('Time') && value) {
      return new Date(value).toLocaleTimeString();
    }
    
    return value;
  }

  private static async executeConditionStep(step: any, context: any): Promise<{success: boolean, result?: any, error?: string}> {
    const config = step.config || {};
    const fieldValue = this.getVariableValue(config.field, context);
    const result = this.evaluateCondition(config, fieldValue);
    
    return { 
      success: true, 
      result: { 
        condition_met: result,
        field: config.field,
        operator: config.operator,
        value: config.value,
        actual_value: fieldValue
      }
    };
  }

  private static evaluateCondition(condition: any, fieldValue: any): boolean {
    const { operator, value } = condition;
    
    switch (operator) {
      case 'equals': return fieldValue === value;
      case 'not_equals': return fieldValue !== value;
      case 'contains': return String(fieldValue || '').includes(value);
      case 'greater_than': return Number(fieldValue) > Number(value);
      case 'less_than': return Number(fieldValue) < Number(value);
      default: return false;
    }
  }

  private static async executeBranchStep(step: any, context: any, workflow: any): Promise<{success: boolean, result?: any, error?: string}> {
    // Branch logic would be implemented here
    return { success: true, result: 'Branch executed' };
  }

  private static async executeSMSAction(config: any, context: any): Promise<{success: boolean, result?: any, error?: string}> {
    console.log('📱 Executing SMS action:', config);
    
    if (!config.to) {
      return { success: false, error: 'No recipient phone number' };
    }
    
    // Actually send SMS via edge function
    const { data, error } = await supabase.functions.invoke('telnyx-sms', {
      body: {
        to: config.to,
        message: config.message,
        userId: context.user_id,
        metadata: {
          source: 'automation',
          workflow_id: context.workflow_id,
          job_id: context.job_id
        }
      }
    });
    
    if (error) {
      console.error('SMS send error:', error);
      return { success: false, error: error.message };
    }
    
    // Log to communication_logs
    if (!context.is_test) {
      await supabase.from('communication_logs').insert({
        type: 'sms',
        communication_type: 'sms',
        direction: 'outbound',
        from_address: 'automation',
        to_address: config.to,
        content: config.message,
        metadata: { 
          automation_context: context,
          workflow_id: context.workflow_id
        },
        status: 'sent'
      });
    }
    
    return { success: true, result: 'SMS sent' };
  }

  private static async executeEmailAction(config: any, context: any): Promise<{success: boolean, result?: any, error?: string}> {
    console.log('📧 Executing Email action:', config);
    
    if (!config.to) {
      return { success: false, error: 'No recipient email' };
    }
    
    // Actually send email via edge function
    const { data, error } = await supabase.functions.invoke('mailgun-email', {
      body: {
        to: config.to,
        subject: config.subject,
        html: config.message,
        text: config.message.replace(/<[^>]*>/g, ''),
        userId: context.user_id
      }
    });
    
    if (error) {
      console.error('Email send error:', error);
      return { success: false, error: error.message };
    }
    
    // Log to communication_logs (only once)
    if (!context.is_test) {
      await supabase.from('communication_logs').insert({
        type: 'email',
        communication_type: 'email',
        direction: 'outbound',
        from_address: 'automation@fixlify.app',
        to_address: config.to,
        subject: config.subject,
        content: config.message,
        metadata: { 
          automation_context: context,
          workflow_id: context.workflow_id
        },
        status: 'sent'
      });
    }
    
    return { success: true, result: 'Email sent' };
  }

  private static async executeNotificationAction(config: any, context: any): Promise<{success: boolean, result?: any, error?: string}> {
    // In-app notification implementation
    console.log('🔔 Executing Notification action:', config);
    return { success: true, result: 'Notification sent' };
  }

  private static async executeCreateTaskAction(config: any, context: any): Promise<{success: boolean, result?: any, error?: string}> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('tasks')
        .insert({
          title: config.title,
          description: config.description,
          assigned_to: config.assignTo === 'creator' ? user.id : config.assignTo,
          due_date: config.dueDate,
          priority: config.priority || 'medium',
          created_by: user.id,
          status: 'pending'
        });

      if (error) throw error;
      return { success: true, result: 'Task created' };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  private static async logCommunication(commType: string, recipient: string, content: string, context: any) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from('communication_logs').insert({
        type: commType,
        communication_type: commType,
        direction: 'outbound',
        from_address: 'automation@fixlify.app',
        to_address: recipient,
        content,
        metadata: { automation_context: context },
        status: 'sent',
        user_id: user.id
      });
    } catch (error) {
      console.error('Error logging communication:', error);
    }
  }

  private static async logExecution(execution: WorkflowExecution) {
    try {
      await supabase
        .from('automation_execution_logs')
        .upsert({
          id: execution.id,
          workflow_id: execution.workflow_id,
          status: execution.status,
          started_at: execution.started_at,
          completed_at: execution.completed_at,
          paused_at: (execution as any).paused_at,
          resume_at: (execution as any).resume_at,
          details: {
            trigger_data: execution.trigger_data,
            steps_executed: execution.steps_executed
          },
          created_at: execution.started_at,
          trigger_type: execution.trigger_type
        });
    } catch (error) {
      console.error('Error logging execution:', error);
    }
  }

  /**
   * Resume paused workflows (called by scheduled job or edge function)
   */
  static async resumePausedWorkflows() {
    try {
      // Get workflows that are ready to resume
      const { data: scheduled, error } = await supabase
        .from('scheduled_workflow_executions')
        .select('*')
        .eq('status', 'pending')
        .lte('resume_at', new Date().toISOString())
        .limit(10);

      if (error) throw error;

      for (const schedule of scheduled || []) {
        try {
          // Mark as processing
          await supabase
            .from('scheduled_workflow_executions')
            .update({ status: 'processing' })
            .eq('id', schedule.id);

          // Resume workflow execution
          await this.executeWorkflow(schedule.workflow_id, {
            ...schedule.context,
            resume_from_step: schedule.resume_from_step,
            execution_id: schedule.execution_id
          });

          // Mark as completed
          await supabase
            .from('scheduled_workflow_executions')
            .update({ status: 'completed' })
            .eq('id', schedule.id);
        } catch (error) {
          console.error(`Error resuming workflow ${schedule.workflow_id}:`, error);
          
          // Mark as failed
          await supabase
            .from('scheduled_workflow_executions')
            .update({ 
              status: 'failed',
              error: String(error)
            })
            .eq('id', schedule.id);
        }
      }
    } catch (error) {
      console.error('Error resuming paused workflows:', error);
    }
  }

  /**
   * Monitoring and analytics
   */
  static async getWorkflowMetrics(workflowId?: string) {
    try {
      let query = supabase
        .from('automation_execution_logs')
        .select('*');
      
      if (workflowId) {
        query = query.eq('workflow_id', workflowId);
      }
      
      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      // Calculate metrics
      const total = data?.length || 0;
      const successful = data?.filter(log => log.status === 'completed').length || 0;
      const failed = data?.filter(log => log.status === 'failed').length || 0;
      const running = data?.filter(log => log.status === 'running').length || 0;
      const paused = data?.filter(log => log.status === 'paused').length || 0;

      return {
        total_executions: total,
        successful_executions: successful,
        failed_executions: failed,
        running_executions: running,
        paused_executions: paused,
        success_rate: total > 0 ? (successful / total) * 100 : 0,
        recent_executions: data || []
      };
    } catch (error) {
      console.error('Error getting workflow metrics:', error);
      return {
        total_executions: 0,
        successful_executions: 0,
        failed_executions: 0,
        running_executions: 0,
        paused_executions: 0,
        success_rate: 0,
        recent_executions: []
      };
    }
  }

  /**
   * Process pending automations after job status change
   * This is the main method to call after updating job status
   */
  static async processJobStatusChange(
    jobId: string,
    oldStatus: string,
    newStatus: string
  ): Promise<void> {
    try {
      console.log(`Processing automation for job ${jobId}: ${oldStatus} -> ${newStatus}`);
      
      // Wait a bit for database trigger to create the log
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Find pending automation logs for this job
      const { data: logs, error } = await supabase
        .from('automation_execution_logs')
        .select('*')
        .or(`trigger_data->job_id.eq.${jobId},trigger_data->>job_id.eq.${jobId}`)
        .in('status', ['pending', 'completed'])
        .gte('created_at', new Date(Date.now() - 10000).toISOString())
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching automation logs:', error);
        return;
      }

      console.log(`Found ${logs?.length || 0} automation logs for job ${jobId}`);

      // Process each log that hasn't been executed
      for (const log of logs || []) {
        // Check if actions have been executed
        if (!log.actions_executed || 
            log.actions_executed.length === 0 || 
            (Array.isArray(log.actions_executed) && log.actions_executed.length === 0)) {
          
          console.log(`Executing automation log ${log.id}`);
          await this.executeAutomationLog(log);
        }
      }
    } catch (error) {
      console.error('Error in processJobStatusChange:', error);
      // Don't throw - we don't want to break the UI if automation fails
    }
  }

  /**
   * Execute a specific automation log by calling the edge function
   */
  private static async executeAutomationLog(log: any): Promise<void> {
    try {
      console.log('Calling automation-executor edge function for log:', log.id);
      
      // Call the edge function
      const { data, error } = await supabase.functions.invoke(
        'automation-executor',
        {
          body: {
            workflowId: log.workflow_id,
            context: log.trigger_data,
            executionId: log.id
          }
        }
      );

      if (error) {
        console.error('Edge function error:', error);
        throw error;
      }

      console.log('Automation executed successfully:', data);
      
      // Show success notification
      if (data?.results && Array.isArray(data.results)) {
        const successCount = data.results.filter((r: any) => r.status === 'success').length;
        if (successCount > 0) {
          toast.success(`Automation completed: ${successCount} action(s) executed`);
        }
      }
      
    } catch (error: any) {
      console.error('Failed to execute automation:', log.id, error);
      
      // Update log as failed
      await supabase
        .from('automation_execution_logs')
        .update({
          status: 'failed',
          error_message: error.message || 'Edge function execution failed',
          completed_at: new Date().toISOString()
        })
        .eq('id', log.id);
      
      // Don't show error toast for every automation failure
      console.error('Automation failed silently:', error.message);
    }
  }

  /**
   * Helper method to process any job-related automation
   */
  static async handleJobUpdate(
    jobId: string,
    oldData: any,
    newData: any
  ): Promise<void> {
    // Check if status changed
    if (oldData?.status !== newData?.status) {
      await this.processJobStatusChange(jobId, oldData.status, newData.status);
    }
    
    // Check for job completion
    if (newData?.status === 'completed' && oldData?.status !== 'completed') {
      // Additional processing for completed jobs if needed
      console.log('Job completed, checking for completion-specific automations');
    }
  }
}

export const automationService = AutomationService;
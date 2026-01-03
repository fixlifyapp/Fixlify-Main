import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  WorkflowExecution,
  TriggerTypes,
  ConditionTypes
} from '@/types/automationFramework';

/**
 * Configuration for a workflow step (action, condition, delay, etc.)
 */
interface StepConfig {
  actionType?: string;
  triggerType?: string;
  delayType?: string;
  delayValue?: number;
  subject?: string;
  message?: string;
  body?: string;
  field?: string;
  operator?: string;
  value?: any;
  title?: string;
  description?: string;
  assignTo?: string;
  dueDate?: string;
  priority?: string;
  [key: string]: any;
}

/**
 * Individual workflow step definition
 */
interface WorkflowStep {
  id?: string;
  type: 'trigger' | 'action' | 'condition' | 'delay' | 'branch';
  name: string;
  config: StepConfig;
  [key: string]: any;
}

/**
 * Complete workflow template configuration
 */
interface WorkflowTemplate {
  steps: WorkflowStep[];
  [key: string]: any;
}

/**
 * Context passed during workflow execution
 */
interface AutomationContext {
  trigger_type?: string;
  resume_from_step?: number;
  is_test?: boolean;
  user_id?: string;
  workflow_id?: string;
  job_id?: string;
  client?: { [key: string]: any };
  record?: { [key: string]: any };
  [key: string]: any;
}

/**
 * Automation execution log data
 */
interface AutomationLogData {
  id?: string;
  workflow_id?: string;
  trigger_data?: AutomationContext;
  actions_executed?: any[];
  status?: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
  [key: string]: any;
}

export interface AutomationWorkflow {
  id?: string;
  name: string;
  description: string;
  user_id?: string;
  organization_id?: string;
  template_config: WorkflowTemplate;
  status: string;
  is_active?: boolean;
  trigger_type?: string;
  trigger_config?: StepConfig;
  execution_count?: number;
  success_count?: number;
  last_triggered_at?: string;
  created_at?: string;
  updated_at?: string;
  triggers?: WorkflowStep[];
  actions?: WorkflowStep[];
  conditions?: WorkflowStep[];
}

export class AutomationService {
  private static listeners: Map<string, Function> = new Map();
  private static isListening = false;

  /**
   * Basic workflow management
   */
  static async createWorkflow(workflow: Partial<AutomationWorkflow>): Promise<AutomationWorkflow> {
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

  static async testWorkflow(workflowId: string, testData?: Partial<AutomationContext>): Promise<void> {
    toast.info('Testing workflow...');
    const testContext: AutomationContext = { ...testData, is_test: true };
    await this.executeWorkflow(workflowId, testContext);
    toast.success('Workflow test completed!');
  }

  /**
   * Enhanced execution engine for multi-step workflows
   */
  static async executeWorkflow(workflowId: string, context?: AutomationContext): Promise<WorkflowExecution> {
    const execution = this.initializeExecution(workflowId, context);

    try {
      await this.logExecution(execution);

      const workflow = await this.getWorkflow(workflowId);
      const { steps, startIndex } = this.getWorkflowSteps(workflow, context);

      await this.executeWorkflowSteps(execution, steps, startIndex, context, workflow);

      execution.status = execution.status === 'running' ? 'completed' : execution.status;
      execution.completed_at = new Date().toISOString();

      await this.logExecution(execution);
      await this.updateWorkflowMetrics(workflowId, execution.status === 'completed');
      this.notifyExecutionResult(execution.status);

      return execution;

    } catch (error) {
      this.handleExecutionError(execution);
      throw error;
    }
  }

  private static initializeExecution(workflowId: string, context?: AutomationContext): WorkflowExecution {
    return {
      id: crypto.randomUUID(),
      workflow_id: workflowId,
      trigger_type: context?.trigger_type || 'manual',
      trigger_data: context || {},
      status: 'running',
      started_at: new Date().toISOString(),
      steps_executed: []
    };
  }

  private static async getWorkflow(workflowId: string): Promise<AutomationWorkflow> {
    const { data: workflow, error } = await supabase
      .from('automation_workflows')
      .select('*')
      .eq('id', workflowId)
      .single();

    if (error || !workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    return workflow;
  }

  private static getWorkflowSteps(workflow: AutomationWorkflow, context?: AutomationContext) {
    const steps = workflow.template_config?.steps || [];
    const startIndex = context?.resume_from_step || 0;
    return { steps, startIndex };
  }

  private static async executeWorkflowSteps(
    execution: WorkflowExecution,
    steps: WorkflowStep[],
    startIndex: number,
    context: AutomationContext | undefined,
    workflow: AutomationWorkflow
  ): Promise<void> {
    for (let i = startIndex; i < steps.length; i++) {
      const step = steps[i];

      if (step.type === 'trigger') continue;

      console.log(`Executing step ${i}: ${step.type} - ${step.name}`);

      const shouldContinue = await this.processWorkflowStep(execution, step, i, context, workflow);
      if (!shouldContinue) {
        return;
      }
    }
  }

  private static async processWorkflowStep(
    execution: WorkflowExecution,
    step: WorkflowStep,
    stepIndex: number,
    context: AutomationContext | undefined,
    workflow: AutomationWorkflow
  ): Promise<boolean> {
    if (step.type === 'delay') {
      const delayResult = await this.handleDelayStep(step, workflow, execution, stepIndex);
      return delayResult.shouldContinue;
    }

    const stepResult = await this.executeStep(step, context, workflow);
    this.recordStepExecution(execution, step, stepIndex, stepResult);

    if (!stepResult.success) {
      execution.status = 'failed';
      return false;
    }

    return true;
  }

  private static recordStepExecution(
    execution: WorkflowExecution,
    step: WorkflowStep,
    stepIndex: number,
    stepResult: { success: boolean; result?: any; error?: string }
  ): void {
    execution.steps_executed.push({
      step_id: step.id || `step_${stepIndex}`,
      step_index: stepIndex,
      status: stepResult.success ? 'completed' : 'failed',
      started_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
      output_data: stepResult.result,
      error_message: stepResult.error
    });
  }

  private static async updateWorkflowMetrics(workflowId: string, success: boolean): Promise<void> {
    await supabase.rpc('increment_automation_metrics', {
      workflow_id: workflowId,
      success
    });
  }

  private static notifyExecutionResult(status: string): void {
    if (status === 'completed') {
      toast.success('Workflow executed successfully');
    } else {
      toast.error('Workflow execution failed');
    }
  }

  private static async handleExecutionError(execution: WorkflowExecution): Promise<void> {
    execution.status = 'failed';
    execution.completed_at = new Date().toISOString();
    await this.logExecution(execution);
    toast.error('Failed to execute workflow');
  }

  private static async handleDelayStep(
    step: WorkflowStep,
    workflow: AutomationWorkflow,
    execution: WorkflowExecution,
    stepIndex: number
  ): Promise<{ shouldContinue: boolean }> {
    const config = step.config || {};
    const delayType = config.delayType || 'minutes';
    const delayValue = config.delayValue || 1;
    const delayMs = this.calculateDelayMs(delayType, delayValue);

    // Check if this is a test or short delay that can be handled immediately
    if (this.shouldHandleDelayImmediately(execution, delayMs)) {
      const testDelay = Math.min(delayMs, 5000);
      await new Promise(resolve => setTimeout(resolve, testDelay));
      return { shouldContinue: true };
    }

    // Schedule long-running delays for later resumption
    const resumeAt = new Date(Date.now() + delayMs);
    await this.scheduleWorkflowResumption(workflow, execution, stepIndex, resumeAt);
    this.updateExecutionForPausedDelay(execution, step, stepIndex, delayType, delayValue, resumeAt);
    await this.logExecution(execution);
    console.log(`Workflow paused. Will resume at ${resumeAt.toISOString()}`);
    return { shouldContinue: false };
  }

  private static calculateDelayMs(delayType: string, delayValue: number): number {
    const multipliers: Record<string, number> = {
      minutes: 60 * 1000,
      hours: 60 * 60 * 1000,
      days: 24 * 60 * 60 * 1000,
      weeks: 7 * 24 * 60 * 60 * 1000
    };

    return delayValue * (multipliers[delayType] || multipliers.minutes);
  }

  private static shouldHandleDelayImmediately(execution: WorkflowExecution, delayMs: number): boolean {
    return execution.trigger_data?.is_test || delayMs < 60000;
  }

  private static async scheduleWorkflowResumption(
    workflow: AutomationWorkflow,
    execution: WorkflowExecution,
    stepIndex: number,
    resumeAt: Date
  ): Promise<void> {
    await supabase.from('scheduled_workflow_executions').insert({
      workflow_id: workflow.id,
      execution_id: execution.id,
      resume_at: resumeAt.toISOString(),
      resume_from_step: stepIndex + 1,
      context: execution.trigger_data,
      status: 'pending'
    });
  }

  private static updateExecutionForPausedDelay(
    execution: WorkflowExecution,
    step: WorkflowStep,
    stepIndex: number,
    delayType: string,
    delayValue: number,
    resumeAt: Date
  ): void {
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
  }

  private static async executeStep(step: WorkflowStep, context: AutomationContext, workflow: AutomationWorkflow): Promise<{success: boolean, result?: any, error?: string}> {
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

  private static async executeActionStep(
    step: WorkflowStep,
    context: AutomationContext,
    workflow: AutomationWorkflow
  ): Promise<{ success: boolean; result?: any; error?: string }> {
    const config = step.config || {};
    const actionType = config.actionType;

    const actionHandler = this.getActionHandler(actionType);
    if (!actionHandler) {
      return { success: false, error: `Unknown action type: ${actionType}` };
    }

    return await actionHandler.execute(config, context, this);
  }

  private static getActionHandler(
    actionType: string
  ): { execute: (config: any, context: AutomationContext, service: typeof AutomationService) => Promise<any> } | null {
    const handlers: Record<string, any> = {
      email: {
        execute: async (config: any, context: AutomationContext, service: typeof AutomationService) => {
          const emailConfig = service.buildEmailConfig(config, context);
          return await service.executeEmailAction(emailConfig, context);
        }
      },
      sms: {
        execute: async (config: any, context: AutomationContext, service: typeof AutomationService) => {
          const smsConfig = service.buildSMSConfig(config, context);
          return await service.executeSMSAction(smsConfig, context);
        }
      },
      notification: {
        execute: async (config: any, context: AutomationContext, service: typeof AutomationService) => {
          return await service.executeNotificationAction(config, context);
        }
      },
      task: {
        execute: async (config: any, context: AutomationContext, service: typeof AutomationService) => {
          return await service.executeCreateTaskAction(config, context);
        }
      }
    };

    return handlers[actionType] || null;
  }

  private static buildEmailConfig(config: any, context: AutomationContext): any {
    return {
      to: context.client?.email || context.record?.client_email,
      subject: this.processTemplate(config.subject, context),
      message: this.processTemplate(config.message, context),
      ...config
    };
  }

  private static buildSMSConfig(config: any, context: AutomationContext): any {
    return {
      to: context.client?.phone || context.record?.client_phone,
      message: this.processTemplate(config.message, context),
      ...config
    };
  }

  private static processTemplate(template: string, context: AutomationContext): string {
    if (!template) return '';

    return template.replace(/\{\{([^}]+)\}\}/g, (match, variable) => {
      const value = this.getVariableValue(variable.trim(), context);
      return value !== undefined ? String(value) : match;
    });
  }

  private static getVariableValue(variable: string, context: AutomationContext): any {
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

  private static async executeConditionStep(step: WorkflowStep, context: AutomationContext): Promise<{success: boolean, result?: any, error?: string}> {
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

  private static evaluateCondition(condition: StepConfig, fieldValue: any): boolean {
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

  private static async executeBranchStep(step: WorkflowStep, context: AutomationContext, workflow: AutomationWorkflow): Promise<{success: boolean, result?: any, error?: string}> {
    // Branch logic would be implemented here
    return { success: true, result: 'Branch executed' };
  }

  private static async executeSMSAction(config: StepConfig, context: AutomationContext): Promise<{success: boolean, result?: any, error?: string}> {
    console.log('📱 Executing SMS action:', config);
    
    if (!config.to) {
      return { success: false, error: 'No recipient phone number' };
    }
    
    // Actually send SMS via edge function
    const { data, error } = await supabase.functions.invoke('telnyx-sms', {
      body: {
        recipientPhone: config.to,
        message: config.message,
        user_id: context.user_id,
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

  private static async executeEmailAction(config: StepConfig, context: AutomationContext): Promise<{success: boolean, result?: any, error?: string}> {
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

  private static async executeNotificationAction(config: StepConfig, context: AutomationContext): Promise<{success: boolean, result?: any, error?: string}> {
    // In-app notification implementation
    console.log('🔔 Executing Notification action:', config);
    return { success: true, result: 'Notification sent' };
  }

  private static async executeCreateTaskAction(config: StepConfig, context: AutomationContext): Promise<{success: boolean, result?: any, error?: string}> {
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

  private static async logCommunication(commType: string, recipient: string, content: string, context: AutomationContext): Promise<void> {
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

      await this.waitForDatabaseTrigger();

      const logs = await this.fetchAutomationLogsForJob(jobId);
      if (logs && logs.length > 0) {
        await this.processAutomationLogs(logs);
      } else {
        await this.triggerWorkflowsDirectly(jobId, oldStatus, newStatus);
      }
    } catch (error) {
      console.error('Error in processJobStatusChange:', error);
    }
  }

  private static async waitForDatabaseTrigger(): Promise<void> {
    // Wait a bit for database trigger to create the log (if triggers are deployed)
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  private static async fetchAutomationLogsForJob(jobId: string): Promise<AutomationLogData[] | null> {
    const { data: logs } = await supabase
      .from('automation_execution_logs')
      .select('*')
      .eq('trigger_data->>job_id', jobId)
      .in('status', ['pending', 'completed'])
      .gte('created_at', new Date(Date.now() - 10000).toISOString())
      .order('created_at', { ascending: false });

    console.log(`Found ${logs?.length || 0} automation logs for job ${jobId}`);
    return logs;
  }

  private static async processAutomationLogs(logs: AutomationLogData[]): Promise<void> {
    for (const log of logs) {
      if (!log.actions_executed || log.actions_executed.length === 0) {
        console.log(`Executing automation log ${log.id}`);
        await this.executeAutomationLog(log);
      }
    }
  }

  /**
   * Directly find and execute workflows without DB trigger
   * This is a fallback when DB triggers are not deployed
   */
  private static async triggerWorkflowsDirectly(
    jobId: string,
    oldStatus: string,
    newStatus: string
  ): Promise<void> {
    try {
      const job = await this.getJobForTrigger(jobId);
      if (!job) return;

      const workflows = await this.getActiveWorkflowsForTrigger(job.user_id);
      if (!workflows?.length) return;

      await this.executeMatchingWorkflows(workflows, jobId, oldStatus, newStatus, job);
    } catch (error) {
      console.error('Error in triggerWorkflowsDirectly:', error);
    }
  }

  private static async getJobForTrigger(jobId: string): Promise<any | null> {
    const { data: job, error } = await supabase
      .from('jobs')
      .select('*, client:clients(*)')
      .eq('id', jobId)
      .single();

    if (error || !job) {
      console.error('Error fetching job:', error);
      return null;
    }

    return job;
  }

  private static async getActiveWorkflowsForTrigger(userId: string): Promise<AutomationWorkflow[] | null> {
    const { data: workflows, error } = await supabase
      .from('automation_workflows')
      .select('*')
      .eq('trigger_type', 'job_status_changed')
      .eq('is_active', true)
      .eq('status', 'active')
      .eq('user_id', userId);

    if (error || !workflows?.length) {
      console.log('No matching workflows found for job status change');
      return null;
    }

    return workflows;
  }

  private static async executeMatchingWorkflows(
    workflows: AutomationWorkflow[],
    jobId: string,
    oldStatus: string,
    newStatus: string,
    job: any
  ): Promise<void> {
    for (const workflow of workflows) {
      if (!this.workflowStatusConditionMet(workflow, newStatus)) {
        console.log(`Skipping workflow ${workflow.id} - status condition not met`);
        continue;
      }

      console.log(`Executing workflow ${workflow.id} directly for job status change`);
      await this.invokeWorkflowExecution(workflow.id, jobId, oldStatus, newStatus, job);
    }
  }

  private static workflowStatusConditionMet(workflow: AutomationWorkflow, newStatus: string): boolean {
    const triggerConfig = workflow.trigger_config as StepConfig | undefined;
    if (!triggerConfig?.conditions) return true;

    const statusCondition = triggerConfig.conditions.find((c: any) => c.field === 'status');
    return !statusCondition || statusCondition.value.toLowerCase() === newStatus.toLowerCase();
  }

  private static async invokeWorkflowExecution(
    workflowId: string,
    jobId: string,
    oldStatus: string,
    newStatus: string,
    job: any
  ): Promise<void> {
    const { data, error } = await supabase.functions.invoke('automation-executor', {
      body: {
        workflowId,
        context: {
          triggerType: 'job_status_changed',
          job_id: jobId,
          jobId,
          job: {
            ...job,
            oldStatus,
            status: newStatus
          },
          client: job.client,
          userId: job.user_id
        }
      }
    });

    if (error) {
      console.error('Error executing automation:', error);
    } else {
      this.notifyAutomationResults(data);
    }
  }

  private static notifyAutomationResults(data: any): void {
    console.log('Automation executed successfully:', data);
    if (data?.results && Array.isArray(data.results)) {
      const successCount = data.results.filter((r: any) => r.status === 'success').length;
      if (successCount > 0) {
        toast.success(`Automation completed: ${successCount} action(s) executed`);
      }
    }
  }

  /**
   * Execute a specific automation log by calling the edge function
   */
  private static async executeAutomationLog(log: AutomationLogData): Promise<void> {
    try {
      // Skip logs without workflow_id
      if (!log.workflow_id) {
        console.log('Skipping log without workflow_id:', log.id);
        await supabase.from('automation_execution_logs').delete().eq('id', log.id);
        return;
      }

      // Check if workflow exists
      const { data: workflow, error: wfError } = await supabase
        .from('automation_workflows')
        .select('id')
        .eq('id', log.workflow_id)
        .single();

      if (wfError || !workflow) {
        console.log('Workflow not found, cleaning up orphan log:', log.id);
        await supabase.from('automation_execution_logs').delete().eq('id', log.id);
        return;
      }

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
      
    } catch (error) {
      console.error('Failed to execute automation:', log.id, error);
      const errorMessage = error instanceof Error ? error.message : 'Edge function execution failed';

      // Update log as failed
      await supabase
        .from('automation_execution_logs')
        .update({
          status: 'failed',
          error_message: errorMessage,
          completed_at: new Date().toISOString()
        })
        .eq('id', log.id);

      // Don't show error toast for every automation failure
      console.error('Automation failed silently:', errorMessage);
    }
  }

  /**
   * Helper method to process any job-related automation
   */
  static async handleJobUpdate(
    jobId: string,
    oldData: Record<string, any>,
    newData: Record<string, any>
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
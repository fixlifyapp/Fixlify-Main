import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { 
  AutomationTrigger, 
  AutomationAction, 
  TriggerCondition,
  WorkflowExecution 
} from '@/types/automationFramework';

/**
 * Core automation execution engine that processes workflow triggers and actions
 */
export class AutomationExecutionEngine {
  private static instance: AutomationExecutionEngine;
  private isInitialized = false;
  private eventListeners: Map<string, Function[]> = new Map();

  static getInstance(): AutomationExecutionEngine {
    if (!AutomationExecutionEngine.instance) {
      AutomationExecutionEngine.instance = new AutomationExecutionEngine();
    }
    return AutomationExecutionEngine.instance;
  }

  /**
   * Initialize the execution engine with real-time listeners
   */
  async initialize() {
    if (this.isInitialized) return;

    try {
      // Set up real-time listeners for trigger events
      await this.setupRealtimeListeners();
      
      // Initialize periodic checks for time-based triggers
      this.initializePeriodicTriggers();
      
      this.isInitialized = true;
      console.log('Automation execution engine initialized');
    } catch (error) {
      console.error('Failed to initialize automation engine:', error);
    }
  }

  /**
   * Set up real-time database listeners for trigger events
   */
  private async setupRealtimeListeners() {
    // Listen for job creation/updates
    supabase
      .channel('job-automation-triggers')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'jobs' },
        (payload) => this.handleJobCreated(payload.new)
      )
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'jobs' },
        (payload) => this.handleJobUpdated(payload.old, payload.new)
      )
      .subscribe();

    // Listen for client creation
    supabase
      .channel('client-automation-triggers')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'clients' },
        (payload) => this.handleClientCreated(payload.new)
      )
      .subscribe();

    // Listen for invoice events
    supabase
      .channel('invoice-automation-triggers')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'invoices' },
        (payload) => this.handleInvoiceCreated(payload.new)
      )
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'invoices' },
        (payload) => this.handleInvoiceUpdated(payload.old, payload.new)
      )
      .subscribe();

    // Listen for task events
    supabase
      .channel('task-automation-triggers')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'tasks' },
        (payload) => this.handleTaskCreated(payload.new)
      )
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'tasks' },
        (payload) => this.handleTaskUpdated(payload.old, payload.new)
      )
      .subscribe();
  }

  /**
   * Initialize periodic checks for time-based triggers
   */
  private initializePeriodicTriggers() {
    // Check for scheduled automations every minute
    setInterval(() => {
      this.processScheduledTriggers();
    }, 60000);

    // Check for overdue tasks every hour
    setInterval(() => {
      this.processOverdueTasks();
    }, 3600000);
  }

  /**
   * Handle job creation trigger
   */
  private async handleJobCreated(job: any) {
    await this.processTrigger('job_created', {
      job_id: job.id,
      job_type: job.job_type,
      priority: job.priority,
      client_id: job.client_id,
      technician_id: job.technician_id,
      status: job.status,
      created_at: job.created_at
    });
  }

  /**
   * Handle job status updates
   */
  private async handleJobUpdated(oldJob: any, newJob: any) {
    // Job status changed
    if (oldJob.status !== newJob.status) {
      await this.processTrigger('job_status_changed', {
        job_id: newJob.id,
        from_status: oldJob.status,
        to_status: newJob.status,
        job_type: newJob.job_type,
        client_id: newJob.client_id
      });

      // Specific trigger for job completion
      if (newJob.status === 'completed' && oldJob.status !== 'completed') {
        await this.processTrigger('job_completed', {
          job_id: newJob.id,
          job_type: newJob.job_type,
          client_id: newJob.client_id,
          completed_at: new Date().toISOString()
        });
      }
    }

    // Job scheduled (date assigned)
    if (!oldJob.scheduled_date && newJob.scheduled_date) {
      await this.processTrigger('job_scheduled', {
        job_id: newJob.id,
        job_type: newJob.job_type,
        scheduled_date: newJob.scheduled_date,
        technician_id: newJob.technician_id,
        client_id: newJob.client_id
      });
    }
  }

  /**
   * Handle client creation
   */
  private async handleClientCreated(client: any) {
    await this.processTrigger('client_created', {
      client_id: client.id,
      client_type: client.client_type,
      lead_source: client.lead_source,
      location: client.address,
      created_at: client.created_at
    });
  }

  /**
   * Handle invoice creation and updates
   */
  private async handleInvoiceCreated(invoice: any) {
    await this.processTrigger('invoice_created', {
      invoice_id: invoice.id,
      invoice_number: invoice.invoice_number,
      amount: invoice.total,
      client_id: invoice.client_id,
      job_id: invoice.job_id,
      status: invoice.status
    });
  }

  private async handleInvoiceUpdated(oldInvoice: any, newInvoice: any) {
    // Payment received
    if (oldInvoice.status !== 'paid' && newInvoice.status === 'paid') {
      await this.processTrigger('payment_received', {
        invoice_id: newInvoice.id,
        amount: newInvoice.total,
        client_id: newInvoice.client_id,
        job_id: newInvoice.job_id,
        payment_date: new Date().toISOString()
      });
    }

    // Invoice becomes overdue
    if (oldInvoice.status !== 'overdue' && newInvoice.status === 'overdue') {
      await this.processTrigger('invoice_overdue', {
        invoice_id: newInvoice.id,
        amount: newInvoice.total,
        client_id: newInvoice.client_id,
        days_overdue: this.calculateDaysOverdue(newInvoice.due_date)
      });
    }
  }

  /**
   * Handle task creation and updates
   */
  private async handleTaskCreated(task: any) {
    await this.processTrigger('task_created', {
      task_id: task.id,
      description: task.description,
      assigned_to: task.assigned_to,
      job_id: task.job_id,
      client_id: task.client_id,
      due_date: task.due_date,
      priority: task.priority
    });
  }

  private async handleTaskUpdated(oldTask: any, newTask: any) {
    // Task completed
    if (oldTask.status !== 'completed' && newTask.status === 'completed') {
      await this.processTrigger('task_completed', {
        task_id: newTask.id,
        description: newTask.description,
        job_id: newTask.job_id,
        client_id: newTask.client_id,
        completed_at: new Date().toISOString()
      });
    }
  }

  /**
   * Process a specific trigger type with context data
   */
  private async processTrigger(triggerType: string, contextData: any) {
    try {
      // Get active workflows that match this trigger
      const { data: workflows, error } = await supabase
        .from('automation_workflows')
        .select(`
          id, name, triggers, steps, settings, 
          trigger_config, action_config,
          organization_id, user_id
        `)
        .eq('status', 'active')
        .eq('enabled', true);

      if (error) {
        console.error('Error fetching workflows:', error);
        return;
      }

      // Process each matching workflow
      for (const workflow of workflows || []) {
        if (this.shouldTriggerWorkflow(workflow, triggerType, contextData)) {
          await this.executeWorkflow(workflow, triggerType, contextData);
        }
      }
    } catch (error) {
      console.error(`Error processing trigger ${triggerType}:`, error);
    }
  }

  /**
   * Check if a workflow should be triggered based on conditions
   */
  private shouldTriggerWorkflow(workflow: any, triggerType: string, contextData: any): boolean {
    // Check if workflow has triggers defined
    const triggers = workflow.triggers || [];
    const matchingTrigger = triggers.find((t: any) => t.type === triggerType);
    
    if (!matchingTrigger) return false;

    // Check trigger conditions
    const conditions = matchingTrigger.conditions || [];
    return this.evaluateConditions(conditions, contextData);
  }

  /**
   * Evaluate trigger conditions against context data
   */
  private evaluateConditions(conditions: TriggerCondition[], contextData: any): boolean {
    if (!conditions.length) return true;

    return conditions.every(condition => {
      const value = this.getValueFromContext(condition.field, contextData);
      return this.evaluateCondition(condition, value);
    });
  }

  /**
   * Evaluate a single condition
   */
  private evaluateCondition(condition: TriggerCondition, value: any): boolean {
    switch (condition.operator) {
      case 'equals':
        return value === condition.value;
      case 'not_equals':
        return value !== condition.value;
      case 'greater_than':
        return Number(value) > Number(condition.value);
      case 'less_than':
        return Number(value) < Number(condition.value);
      case 'contains':
        return String(value).toLowerCase().includes(String(condition.value).toLowerCase());
      case 'not_contains':
        return !String(value).toLowerCase().includes(String(condition.value).toLowerCase());
      case 'in':
        return Array.isArray(condition.value) && condition.value.includes(value);
      case 'not_in':
        return Array.isArray(condition.value) && !condition.value.includes(value);
      default:
        return true;
    }
  }

  /**
   * Extract value from context data using field path
   */
  private getValueFromContext(field: string, contextData: any): any {
    return field.split('.').reduce((obj, key) => obj?.[key], contextData);
  }

  /**
   * Execute a workflow with all its steps
   */
  private async executeWorkflow(workflow: any, triggerType: string, contextData: any) {
    const executionId = crypto.randomUUID();
    
    try {
      // Log execution start
      await this.logExecution(executionId, workflow.id, triggerType, contextData, 'started');

      // Execute workflow steps in sequence
      const steps = workflow.steps || [];
      let currentContext = { ...contextData };

      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        
        try {
          // Check if step should be executed (conditions)
          if (step.conditions && !this.evaluateConditions(step.conditions, currentContext)) {
            continue;
          }

          // Execute the step
          await this.executeStep(step, currentContext, workflow);

          // Add delay if specified
          if (step.delay_minutes && step.delay_minutes > 0) {
            await this.scheduleDelayedExecution(
              workflow.id, 
              steps.slice(i + 1), 
              currentContext, 
              step.delay_minutes
            );
            break; // Stop current execution, will continue after delay
          }
        } catch (stepError) {
          console.error(`Error executing step ${i} in workflow ${workflow.id}:`, stepError);
          await this.logExecution(executionId, workflow.id, triggerType, contextData, 'failed', String(stepError));
          break;
        }
      }

      // Log successful completion
      await this.logExecution(executionId, workflow.id, triggerType, contextData, 'completed');
      
      // Update workflow metrics
      await this.updateWorkflowMetrics(workflow.id, true);
      
    } catch (error) {
      console.error(`Error executing workflow ${workflow.id}:`, error);
      await this.logExecution(executionId, workflow.id, triggerType, contextData, 'failed', String(error));
      await this.updateWorkflowMetrics(workflow.id, false);
    }
  }

  /**
   * Execute a single workflow step
   */
  private async executeStep(step: any, context: any, workflow: any) {
    const actionType = step.actionType || step.type;

    switch (actionType) {
      case 'send_sms':
        await this.executeSMSAction(step.config, context);
        break;
      case 'send_email':
        await this.executeEmailAction(step.config, context);
        break;
      case 'create_task':
        await this.executeCreateTaskAction(step.config, context);
        break;
      case 'update_job_status':
        await this.executeUpdateJobStatusAction(step.config, context);
        break;
      case 'send_notification':
        await this.executeNotificationAction(step.config, context);
        break;
      case 'create_job':
        await this.executeCreateJobAction(step.config, context);
        break;
      case 'wait':
        // Wait/delay is handled in executeWorkflow
        break;
      default:
        console.warn(`Unknown action type: ${actionType}`);
    }
  }

  /**
   * Execute SMS action
   */
  private async executeSMSAction(config: any, context: any) {
    try {
      const message = this.processTemplate(config.message, context);
      const recipient = this.resolveRecipient(config.to, context);

      // Call SMS service (placeholder - would integrate with actual SMS service)
      console.log(`Sending SMS to ${recipient}: ${message}`);
      
      // Log communication
      await this.logCommunication('sms', recipient, message, context);
      
    } catch (error) {
      console.error('Error sending SMS:', error);
      throw error;
    }
  }

  /**
   * Execute email action
   */
  private async executeEmailAction(config: any, context: any) {
    try {
      const subject = this.processTemplate(config.subject, context);
      const body = this.processTemplate(config.body, context);
      const recipient = this.resolveRecipient(config.to, context);

      // Call email service (placeholder - would integrate with actual email service)
      console.log(`Sending email to ${recipient}: ${subject}`);
      
      // Log communication
      await this.logCommunication('email', recipient, `${subject}\n\n${body}`, context);
      
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  /**
   * Execute create task action
   */
  private async executeCreateTaskAction(config: any, context: any) {
    try {
      const description = this.processTemplate(config.title || config.description || '', context);

      const { error } = await supabase
        .from('tasks')
        .insert({
          description,
          job_id: context.job_id,
          client_id: context.client_id,
          assigned_to: config.assigned_to,
          due_date: config.due_date,
          priority: config.priority || 'medium',
          created_by_automation: 'true'
        });

      if (error) throw error;
      
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  }

  /**
   * Execute update job status action
   */
  private async executeUpdateJobStatusAction(config: any, context: any) {
    try {
      const { error } = await supabase
        .from('jobs')
        .update({
          status: config.new_status,
          updated_at: new Date().toISOString()
        })
        .eq('id', context.job_id);

      if (error) throw error;
      
    } catch (error) {
      console.error('Error updating job status:', error);
      throw error;
    }
  }

  /**
   * Execute notification action
   */
  private async executeNotificationAction(config: any, context: any) {
    try {
      const title = this.processTemplate(config.title, context);
      const message = this.processTemplate(config.message, context);

      // Show toast notification
      toast.info(title, { description: message });
      
      // Could also create in-app notification record
      
    } catch (error) {
      console.error('Error sending notification:', error);
      throw error;
    }
  }

  /**
   * Execute create job action
   */
  private async executeCreateJobAction(config: any, context: any) {
    try {
      const { error } = await supabase
        .from('jobs')
        .insert({
          id: crypto.randomUUID(),
          client_id: context.client_id,
          job_type: config.job_type,
          status: config.status || 'new',
          technician_id: config.technician_id,
          date: config.scheduled_date,
          description: this.processTemplate(config.description || '', context)
        });

      if (error) throw error;
      
    } catch (error) {
      console.error('Error creating job:', error);
      throw error;
    }
  }

  /**
   * Process template variables in text
   */
  private processTemplate(template: string, context: any): string {
    if (!template) return '';
    
    return template.replace(/\{\{(\w+(?:\.\w+)*)\}\}/g, (match, path) => {
      const value = this.getValueFromContext(path, context);
      return value !== undefined ? String(value) : match;
    });
  }

  /**
   * Resolve recipient based on configuration
   */
  private resolveRecipient(to: string, context: any): string {
    switch (to) {
      case 'client':
        return context.client_phone || context.client_email || '';
      case 'technician':
        return context.technician_phone || context.technician_email || '';
      default:
        return to; // Assume it's a direct phone/email
    }
  }

  /**
   * Log workflow execution
   */
  private async logExecution(
    executionId: string,
    workflowId: string,
    triggerType: string,
    contextData: any,
    status: string,
    error?: string
  ) {
    try {
      await supabase.from('automation_execution_logs').insert({
        id: executionId,
        workflow_id: workflowId,
        trigger_type: triggerType,
        trigger_data: contextData,
        status,
        error_message: error,
        started_at: new Date().toISOString(),
        completed_at: status === 'completed' ? new Date().toISOString() : null
      });
    } catch (logError) {
      console.error('Error logging execution:', logError);
    }
  }

  /**
   * Log communication
   */
  private async logCommunication(commType: string, recipient: string, content: string, context: any) {
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

  /**
   * Update workflow execution metrics
   */
  private async updateWorkflowMetrics(workflowId: string, success: boolean) {
    try {
      await supabase.rpc('increment_automation_metrics', {
        workflow_id: workflowId,
        success
      });
    } catch (error) {
      console.error('Error updating workflow metrics:', error);
    }
  }

  /**
   * Schedule delayed execution for remaining steps
   */
  private async scheduleDelayedExecution(
    workflowId: string,
    remainingSteps: any[],
    context: any,
    delayMinutes: number
  ) {
    // This would integrate with a job queue system like pg_cron or external service
    setTimeout(async () => {
      for (const step of remainingSteps) {
        try {
          await this.executeStep(step, context, { id: workflowId });
        } catch (error) {
          console.error('Error in delayed step execution:', error);
          break;
        }
      }
    }, delayMinutes * 60 * 1000);
  }

  /**
   * Process scheduled triggers (time-based)
   */
  private async processScheduledTriggers() {
    try {
      // Get workflows with scheduled triggers
      const { data: workflows } = await supabase
        .from('automation_workflows')
        .select('*')
        .eq('status', 'active')
        .eq('enabled', true);

      const now = new Date();
      
      for (const workflow of workflows || []) {
        const triggers = Array.isArray(workflow.triggers) ? workflow.triggers : [];
        
        for (const trigger of triggers) {
          const triggerObj = trigger as any;
          if (triggerObj.type === 'scheduled_time' && this.shouldRunScheduledTrigger(triggerObj, now)) {
            await this.executeWorkflow(workflow, 'scheduled_time', {
              scheduled_time: now.toISOString(),
              workflow_id: workflow.id
            });
          }
        }
      }
    } catch (error) {
      console.error('Error processing scheduled triggers:', error);
    }
  }

  /**
   * Check if scheduled trigger should run
   */
  private shouldRunScheduledTrigger(trigger: any, now: Date): boolean {
    const config = trigger.config || {};
    const frequency = config.frequency;
    const time = config.time;
    
    if (!frequency || !time) return false;

    const [hours, minutes] = time.split(':').map(Number);
    const triggerTime = new Date(now);
    triggerTime.setHours(hours, minutes, 0, 0);

    // Check if we're within the trigger time window (5 minute tolerance)
    const timeDiff = Math.abs(now.getTime() - triggerTime.getTime());
    if (timeDiff > 5 * 60 * 1000) return false;

    // Check frequency
    switch (frequency) {
      case 'daily':
        return true;
      case 'weekly':
        const daysOfWeek = config.days_of_week || [now.getDay()];
        return daysOfWeek.includes(now.getDay());
      case 'monthly':
        return now.getDate() === 1; // First day of month
      default:
        return false;
    }
  }

  /**
   * Process overdue tasks
   */
  private async processOverdueTasks() {
    try {
      const { data: overdueTasks } = await supabase
        .from('tasks')
        .select('*')
        .lt('due_date', new Date().toISOString())
        .not('status', 'in', '(completed,cancelled)');

      for (const task of overdueTasks || []) {
        const hoursOverdue = Math.floor(
          (Date.now() - new Date(task.due_date).getTime()) / (1000 * 60 * 60)
        );

        await this.processTrigger('task_overdue', {
          task_id: task.id,
          description: task.description,
          job_id: task.job_id,
          client_id: task.client_id,
          assigned_to: task.assigned_to,
          hours_overdue: hoursOverdue,
          priority: task.priority
        });
      }
    } catch (error) {
      console.error('Error processing overdue tasks:', error);
    }
  }

  /**
   * Calculate days overdue for invoices
   */
  private calculateDaysOverdue(dueDate: string): number {
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = now.getTime() - due.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Manually trigger a workflow for testing
   */
  async testWorkflow(workflowId: string, testData: any = {}) {
    try {
      const { data: workflow } = await supabase
        .from('automation_workflows')
        .select('*')
        .eq('id', workflowId)
        .single();

      if (!workflow) {
        throw new Error('Workflow not found');
      }

      await this.executeWorkflow(workflow, 'manual_test', {
        test_mode: true,
        ...testData
      });

      toast.success('Workflow test completed successfully');
    } catch (error) {
      console.error('Error testing workflow:', error);
      toast.error('Failed to test workflow');
    }
  }

  /**
   * Get execution logs for a workflow
   */
  async getExecutionLogs(workflowId: string, limit: number = 50) {
    const { data, error } = await supabase
      .from('automation_execution_logs')
      .select('*')
      .eq('workflow_id', workflowId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  }

  /**
   * Stop/pause all automations
   */
  async pauseAllAutomations() {
    this.isInitialized = false;
    // Clean up listeners and intervals here if needed
    console.log('Automation execution engine paused');
  }

  /**
   * Resume automations
   */
  async resumeAutomations() {
    await this.initialize();
  }
}

// Export singleton instance
export const automationEngine = AutomationExecutionEngine.getInstance();
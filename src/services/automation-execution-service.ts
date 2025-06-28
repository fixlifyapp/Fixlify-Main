import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AutomationExecution {
  workflowId: string;
  triggeredBy: string;
  entityId: string;
  entityType: string;
  context: Record<string, any>;
}

export class AutomationExecutionService {
  // Execute a workflow
  static async executeWorkflow(execution: AutomationExecution) {
    try {
      // Log execution start
      await this.logExecution(execution.workflowId, 'started', execution);

      // Get workflow details
      const { data: workflow, error } = await supabase
        .from('automation_workflows')
        .select('*')
        .eq('id', execution.workflowId)
        .single();

      if (error || !workflow) throw new Error('Workflow not found');

      // Parse workflow configuration
      const config = workflow.template_config as any;
      const steps = config.steps || [];

      // Execute each step
      for (const step of steps) {
        try {
          await this.executeStep(step, execution);
        } catch (stepError) {
          console.error('Step execution failed:', stepError);
          await this.logExecution(execution.workflowId, 'failed', {
            ...execution,
            error: stepError.message,
            failedStep: step
          });
        }
      }

      // Update execution count
      await supabase
        .from('automation_workflows')
        .update({
          execution_count: (workflow.execution_count || 0) + 1,
          success_count: (workflow.success_count || 0) + 1,
          last_executed_at: new Date().toISOString()
        })
        .eq('id', execution.workflowId);

      await this.logExecution(execution.workflowId, 'completed', execution);
    } catch (error) {
      console.error('Workflow execution failed:', error);
      await this.logExecution(execution.workflowId, 'failed', {
        ...execution,
        error: error.message
      });
    }
  }
  // Execute a single step
  private static async executeStep(step: any, execution: AutomationExecution) {
    const variables = await this.resolveVariables(execution);

    switch (step.type) {
      case 'sms':
        await this.sendSMS(step.config, variables, execution);
        break;
      case 'email':
        await this.sendEmail(step.config, variables, execution);
        break;
      case 'delay':
        await this.handleDelay(step.config);
        break;
      case 'condition':
        return this.evaluateCondition(step.config, variables);
      case 'notification':
        await this.sendNotification(step.config, variables, execution);
        break;
      default:
        console.warn('Unknown step type:', step.type);
    }
  }

  // Resolve template variables
  private static async resolveVariables(execution: AutomationExecution): Promise<Record<string, any>> {
    const variables: Record<string, any> = {};

    // Get entity data based on type
    switch (execution.entityType) {
      case 'job':
        const { data: job } = await supabase
          .from('jobs')
          .select('*, clients!inner(*)')
          .eq('id', execution.entityId)
          .single();

        if (job) {
          variables.client_name = job.clients?.name || '';
          variables.appointment_time = new Date(job.schedule_start).toLocaleTimeString();
          variables.appointment_date = new Date(job.schedule_start).toLocaleDateString();
          variables.service_type = job.service || '';
          variables.address = job.address || job.clients?.address || '';
          variables.job_description = job.description || '';
          variables.technician_name = job.technician_name || '';
          variables.completion_date = job.date ? new Date(job.date).toLocaleDateString() : '';
        }
        break;

      case 'invoice':
        const { data: invoice } = await supabase
          .from('invoices')
          .select('*, clients!inner(*)')
          .eq('id', execution.entityId)
          .single();

        if (invoice) {
          variables.client_name = invoice.clients?.name || '';
          variables.invoice_number = invoice.invoice_number || '';
          variables.amount = invoice.total || 0;
          variables.due_date = invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : '';
          variables.payment_date = new Date().toLocaleDateString();
        }
        break;
    }

    // Add company info
    const { data: profile } = await supabase
      .from('profiles')
      .select('company_name')
      .eq('id', execution.context.userId)
      .single();

    variables.company_name = profile?.company_name || 'Our Company';

    return variables;
  }
  // Replace variables in template
  private static replaceVariables(template: string, variables: Record<string, any>): string {
    let result = template;
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      result = result.replace(regex, String(value));
    });
    return result;
  }

  // Send SMS
  private static async sendSMS(config: any, variables: Record<string, any>, execution: AutomationExecution) {
    const message = this.replaceVariables(config.message || '', variables);
    
    // Get client phone number
    const { data: client } = await supabase
      .from('clients')
      .select('phone')
      .eq('id', execution.context.clientId)
      .single();

    if (!client?.phone) {
      throw new Error('Client phone number not found');
    }

    // Send via Telnyx edge function
    const { error } = await supabase.functions.invoke('telnyx-sms', {
      body: {
        to: client.phone,
        message: message,
        userId: execution.context.userId
      }
    });

    if (error) throw error;
  }

  // Send Email
  private static async sendEmail(config: any, variables: Record<string, any>, execution: AutomationExecution) {
    const subject = this.replaceVariables(config.subject || '', variables);
    const body = this.replaceVariables(config.message || config.body || '', variables);
    
    // Get client email
    const { data: client } = await supabase
      .from('clients')
      .select('email')
      .eq('id', execution.context.clientId)
      .single();

    if (!client?.email) {
      throw new Error('Client email not found');
    }

    // Send email via Mailgun edge function
    const { data, error } = await supabase.functions.invoke('mailgun-email', {
      body: {
        to: client.email,
        subject: subject,
        html: body,
        text: body.replace(/<[^>]*>/g, ''), // Strip HTML for text version
        userId: execution.context.userId,
        clientId: execution.context.clientId,
        jobId: execution.entityType === 'job' ? execution.entityId : null,
        templateId: config.templateId
      }
    });

    if (error) throw error;
    
    toast.success(`Email sent to ${client.email}`);
  }

  // Send Notification
  private static async sendNotification(config: any, variables: Record<string, any>, execution: AutomationExecution) {
    const message = this.replaceVariables(config.message || '', variables);
    
    // Create internal notification
    await supabase
      .from('notifications')
      .insert({
        user_id: execution.context.userId,
        title: 'Automation Notification',
        message: message,
        type: 'automation',
        entity_type: execution.entityType,
        entity_id: execution.entityId
      });
  }

  // Handle Delay
  private static async handleDelay(config: any) {
    const delayMs = this.calculateDelayMs(config.delayValue, config.delayUnit);
    await new Promise(resolve => setTimeout(resolve, delayMs));
  }

  // Calculate delay in milliseconds
  private static calculateDelayMs(value: number, unit: string): number {
    switch (unit) {
      case 'minutes': return value * 60 * 1000;
      case 'hours': return value * 60 * 60 * 1000;
      case 'days': return value * 24 * 60 * 60 * 1000;
      default: return value * 1000; // seconds
    }
  }
  // Evaluate Condition
  private static evaluateCondition(config: any, variables: Record<string, any>): boolean {
    const { field, operator, value } = config;
    const fieldValue = variables[field];

    switch (operator) {
      case 'equals':
        return fieldValue == value;
      case 'not_equals':
        return fieldValue != value;
      case 'contains':
        return String(fieldValue).includes(value);
      case 'greater_than':
        return Number(fieldValue) > Number(value);
      case 'less_than':
        return Number(fieldValue) < Number(value);
      default:
        return true;
    }
  }

  // Log execution
  private static async logExecution(workflowId: string, status: string, details: any) {
    try {
      const { data: workflow } = await supabase
        .from('automation_workflows')
        .select('id, automation_id')
        .eq('id', workflowId)
        .single();

      const logData: any = {
        workflow_id: workflowId,
        automation_id: workflow?.automation_id,
        trigger_type: details.triggeredBy || 'manual',
        trigger_data: {
          entityId: details.entityId,
          entityType: details.entityType,
          context: details.context
        },
        status: status,
        details: details
      };

      if (status === 'started') {
        logData.started_at = new Date().toISOString();
      } else if (status === 'completed' || status === 'failed') {
        logData.completed_at = new Date().toISOString();
        if (status === 'failed' && details.error) {
          logData.error_message = details.error;
        }
      }

      await supabase
        .from('automation_execution_logs')
        .insert(logData);
    } catch (error) {
      console.error('Failed to log execution:', error);
    }
  }
}
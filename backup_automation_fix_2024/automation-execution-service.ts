import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

interface AutomationExecution {
  workflowId: string;
  triggeredBy: string;
  entityId: string;
  entityType: string;
  context: Record<string, any>;
}

export class AutomationExecutionService {
  // Get user timezone from profile or use default
  private static async getUserTimezone(userId?: string): Promise<string> {
    if (!userId) return 'America/New_York';

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('timezone')
        .eq('user_id', userId)
        .single();
      
      return profile?.timezone || 'America/New_York';
    } catch (error) {
      console.error('Error fetching timezone:', error);
      return 'America/New_York';
    }
  }
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

      // Get user timezone
      const userTimezone = await this.getUserTimezone(workflow.user_id);

      // Parse workflow configuration
      const config = workflow.template_config as any;
      const steps = config.steps || [];

      // Execute each step
      for (const step of steps) {
        try {
          await this.executeStep(step, execution, userTimezone);
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
  private static async executeStep(step: any, execution: AutomationExecution, userTimezone: string) {
    const variables = await this.resolveVariables(execution, userTimezone);

    switch (step.type) {
      case 'sms':
      case 'send_sms':
        await this.sendSMS(step.config, variables, execution, userTimezone);
        break;
      case 'email':
      case 'send_email':
        await this.sendEmail(step.config, variables, execution, userTimezone);
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
  private static async resolveVariables(execution: AutomationExecution, userTimezone: string): Promise<Record<string, any>> {
    const variables: Record<string, any> = {};

    // Add timezone-aware date/time variables
    const now = new Date();
    const zonedNow = toZonedTime(now, userTimezone);
    const tomorrow = new Date(now.getTime() + 86400000);
    const zonedTomorrow = toZonedTime(tomorrow, userTimezone);
    
    variables.current_date = format(zonedNow, 'EEE, MMM d, yyyy');
    variables.current_time = format(zonedNow, 'h:mm a');
    variables.tomorrow_date = format(zonedTomorrow, 'EEE, MMM d, yyyy');

    // Get entity data based on type
    switch (execution.entityType) {
      case 'job':
        const { data: job } = await supabase
          .from('jobs')
          .select('*, clients!inner(*)')
          .eq('id', execution.entityId)
          .single();

        if (job) {
          // Client variables
          variables.client_name = job.clients?.name || '';
          variables.client_first_name = job.clients?.name?.split(' ')[0] || '';
          variables.client_email = job.clients?.email || '';
          variables.client_phone = job.clients?.phone || '';
          variables.client_address = job.clients?.address || '';
          
          // Customer variables (alias for client)
          variables.customer_name = variables.client_name;
          variables.customer_first_name = variables.client_first_name;
          
          // Job variables
          variables.job_title = job.title || '';
          variables.job_type = job.job_type || job.service || '';
          variables.service_type = job.service || '';
          variables.job_description = job.description || '';
          variables.job_address = job.address || variables.client_address;
          
          // Schedule variables
          if (job.schedule_start) {
            const scheduleDate = new Date(job.schedule_start);
            const zonedSchedule = toZonedTime(scheduleDate, userTimezone);
            variables.appointment_time = format(zonedSchedule, 'h:mm a');
            variables.appointment_date = format(zonedSchedule, 'EEE, MMM d, yyyy');
            variables.scheduled_time = variables.appointment_time;
            variables.scheduled_date = variables.appointment_date;
          }
          
          // Technician variables
          variables.technician_name = job.technician_name || '';
          variables.technician_phone = job.technician_phone || '';
          
          // Completion variables
          if (job.date) {
            const completionDate = new Date(job.date);
            const zonedCompletion = toZonedTime(completionDate, userTimezone);
            variables.completion_date = format(zonedCompletion, 'EEE, MMM d, yyyy');
          }
          
          // Amount variables
          variables.amount = job.revenue ? `$${job.revenue.toFixed(2)}` : '';
          variables.job_amount = variables.amount;
        }
        break;

      case 'invoice':
        const { data: invoice } = await supabase
          .from('invoices')
          .select('*, clients!inner(*)')
          .eq('id', execution.entityId)
          .single();

        if (invoice) {
          // Client variables
          variables.client_name = invoice.clients?.name || '';
          variables.client_first_name = invoice.clients?.name?.split(' ')[0] || '';
          variables.customer_name = variables.client_name;
          variables.customer_first_name = variables.client_first_name;
          
          // Invoice variables
          variables.invoice_number = invoice.invoice_number || '';
          variables.amount = invoice.total ? `$${invoice.total.toFixed(2)}` : '';
          variables.invoice_amount = variables.amount;
          
          // Date variables
          if (invoice.due_date) {
            const dueDate = new Date(invoice.due_date);
            const zonedDue = toZonedTime(dueDate, userTimezone);
            variables.due_date = format(zonedDue, 'EEE, MMM d, yyyy');
          }
          variables.payment_date = format(zonedNow, 'EEE, MMM d, yyyy');
          
          // Payment link
          variables.payment_link = `${process.env.VITE_APP_URL || window.location.origin}/pay/${invoice.id}`;
        }
        break;
    }

    // Add company info
    const { data: profile } = await supabase
      .from('profiles')
      .select('company_name, company_phone, company_email, website')
      .eq('id', execution.context.userId)
      .single();

    variables.company_name = profile?.company_name || 'Our Company';
    variables.company_phone = profile?.company_phone || '';
    variables.company_email = profile?.company_email || '';
    variables.company_website = profile?.website || '';
    
    // Add useful links
    variables.booking_link = `${process.env.VITE_APP_URL || window.location.origin}/book`;
    variables.review_link = `${process.env.VITE_APP_URL || window.location.origin}/review`;
    variables.tracking_link = `${process.env.VITE_APP_URL || window.location.origin}/track`;

    return variables;
  }
  // Replace variables in template
  private static replaceVariables(template: string, variables: Record<string, any>, userTimezone?: string): string {
    let result = template;
    
    // First replace all standard variables
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      result = result.replace(regex, String(value));
    });
    
    // Handle any remaining {{current_time}}, {{current_date}}, etc. that might not be in variables
    if (userTimezone) {
      const now = new Date();
      const zonedNow = toZonedTime(now, userTimezone);
      const tomorrow = new Date(now.getTime() + 86400000);
      const zonedTomorrow = toZonedTime(tomorrow, userTimezone);
      
      result = result
        .replace(/{{current_date}}/g, format(zonedNow, 'EEE, MMM d, yyyy'))
        .replace(/{{current_time}}/g, format(zonedNow, 'h:mm a'))
        .replace(/{{tomorrow_date}}/g, format(zonedTomorrow, 'EEE, MMM d, yyyy'));
    }
    
    return result;
  }

  // Send SMS
  private static async sendSMS(config: any, variables: Record<string, any>, execution: AutomationExecution, userTimezone: string) {
    const message = this.replaceVariables(config.message || '', variables, userTimezone);
    
    // Get client phone number
    const { data: client } = await supabase
      .from('clients')
      .select('phone')
      .eq('id', execution.context.clientId)
      .single();

    if (!client?.phone) {
      throw new Error('Client phone number not found');
    }

    // Send via Telnyx edge function with enhanced parameters
    const { error } = await supabase.functions.invoke('telnyx-sms', {
      body: {
        recipientPhone: client.phone,
        message: message,
        client_id: execution.context.clientId,
        job_id: execution.context.jobId,
        user_id: execution.context.userId,
        automation_id: execution.workflowId,
        workflow_id: execution.workflowId,
        metadata: {
          entityType: execution.entityType,
          entityId: execution.entityId,
          triggeredBy: execution.triggeredBy,
          variables
        }
      }
    });

    if (error) throw error;
  }

  // Send Email
  private static async sendEmail(config: any, variables: Record<string, any>, execution: AutomationExecution, userTimezone: string) {
    const subject = this.replaceVariables(config.subject || '', variables, userTimezone);
    const body = this.replaceVariables(config.message || config.body || '', variables, userTimezone);
    
    // Get client email
    const { data: client } = await supabase
      .from('clients')
      .select('email')
      .eq('id', execution.context.clientId)
      .single();

    if (!client?.email) {
      throw new Error('Client email not found');
    }

    // Send email via Mailgun edge function with enhanced parameters
    const { data, error } = await supabase.functions.invoke('mailgun-email', {
      body: {
        to: client.email,
        subject: subject,
        html: body,
        text: body.replace(/<[^>]*>/g, ''), // Strip HTML for text version
        client_id: execution.context.clientId,
        job_id: execution.context.jobId,
        user_id: execution.context.userId,
        automation_id: execution.workflowId,
        workflow_id: execution.workflowId,
        metadata: {
          entityType: execution.entityType,
          entityId: execution.entityId,
          triggeredBy: execution.triggeredBy,
          variables
        }
      }
    });

    if (error) throw error;
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
        .select('id, automation_id, organization_id')
        .eq('id', workflowId)
        .single();

      const logData: any = {
        workflow_id: workflowId,
        automation_id: workflow?.automation_id,
        organization_id: workflow?.organization_id,
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

export default AutomationExecutionService;
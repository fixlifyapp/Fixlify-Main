import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { TelnyxService } from './communications/TelnyxService';
import { MailgunService } from './communications/MailgunService';

const telnyxService = new TelnyxService();
const mailgunService = new MailgunService();

interface AutomationContext {
  client?: any;
  job?: any;
  task?: any;
  technician?: any;
  organization?: any;
  trigger?: any;
  user?: any;
  automationId?: string;
}

export class AutomationExecutionService {
  private static instance: AutomationExecutionService;

  private constructor() {}

  static getInstance(): AutomationExecutionService {
    if (!AutomationExecutionService.instance) {
      AutomationExecutionService.instance = new AutomationExecutionService();
    }
    return AutomationExecutionService.instance;
  }

  // Main execution method - backward compatibility
  async executeAutomation(workflowId: string, context: AutomationContext) {
    try {
      // Get the automation workflow
      const { data: workflow, error } = await supabase
        .from('automation_workflows')
        .select('*')
        .eq('id', workflowId)
        .single();

      if (error || !workflow) {
        throw new Error('Automation workflow not found');
      }

      if (workflow.status !== 'active') {
        console.log('Automation is not active, skipping execution');
        return;
      }

      // Execute using the new executeWorkflow method
      await this.executeWorkflow(workflow, context, false);

    } catch (error) {
      console.error('Error executing automation:', error);
      throw error;
    }
  }
  // Execute automation workflow
  async executeWorkflow(
    workflow: any,
    context: AutomationContext,
    testMode = false
  ) {
    console.log('Starting workflow execution:', workflow.name);
    
    // Log execution
    if (!testMode) {
      await this.logExecution(workflow.id, 'started', context);
    }

    try {
      // Get user timezone from profile or organization settings
      const userTimezone = await this.getUserTimezone(context.organization?.id);
      
      // Execute each action
      for (const action of workflow.actions || []) {
        await this.executeAction(action, context, workflow, userTimezone, testMode);
      }

      if (!testMode) {
        await this.logExecution(workflow.id, 'completed', context);
        await this.updateMetrics(workflow.id, true);
      }
    } catch (error) {
      console.error('Workflow execution failed:', error);
      if (!testMode) {
        await this.logExecution(workflow.id, 'failed', context, error);
        await this.updateMetrics(workflow.id, false);
      }
      throw error;
    }
  }

  // Get user timezone from profile or use default
  private async getUserTimezone(organizationId?: string): Promise<string> {
    if (!organizationId) return 'America/New_York';

    try {
      // First try to get from the user's profile
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('timezone')
          .eq('user_id', user.id)
          .single();
        
        if (profile?.timezone) {
          return profile.timezone;
        }
      }

      // Fallback to organization settings if available
      const { data: orgSettings } = await supabase
        .from('organization_settings')
        .select('timezone')
        .eq('organization_id', organizationId)
        .single();
      
      return orgSettings?.timezone || 'America/New_York';
    } catch (error) {
      console.error('Error fetching timezone:', error);
      return 'America/New_York';
    }
  }

  // Execute a single action
  private async executeAction(
    action: any,
    context: AutomationContext,
    workflow: any,
    userTimezone: string,
    testMode = false
  ) {
    console.log('Executing action:', action.action_type);

    // Check delivery window
    if (action.delivery_window?.enabled && !testMode) {
      const isValidTime = await this.checkDeliveryWindow(action.delivery_window, userTimezone);
      if (!isValidTime) {
        console.log('Outside delivery window, queuing action');
        await this.queueAction(action, context, workflow);
        return;
      }
    }

    // Perform the actual action with timezone context
    await this.performAction(action.action_type, action.action_config, context, workflow, userTimezone);
  }
  // Check if current time is within delivery window
  private async checkDeliveryWindow(
    deliveryWindow: any,
    timezone: string
  ): Promise<boolean> {
    const now = new Date();
    const zonedNow = toZonedTime(now, timezone);
    
    // Check business hours
    if (deliveryWindow.businessHoursOnly) {
      const currentHour = zonedNow.getHours();
      const [startHour] = deliveryWindow.businessStart.split(':').map(Number);
      const [endHour] = deliveryWindow.businessEnd.split(':').map(Number);
      
      if (currentHour < startHour || currentHour >= endHour) {
        return false;
      }
    }
    
    // Check quiet hours
    if (deliveryWindow.quietHours) {
      const currentHour = zonedNow.getHours();
      const [quietStart] = deliveryWindow.quietStart.split(':').map(Number);
      const [quietEnd] = deliveryWindow.quietEnd.split(':').map(Number);
      
      // Handle overnight quiet hours
      if (quietStart > quietEnd) {
        if (currentHour >= quietStart || currentHour < quietEnd) {
          return false;
        }
      } else {
        if (currentHour >= quietStart && currentHour < quietEnd) {
          return false;
        }
      }
    }
    
    return true;
  }

  // Queue action for later delivery
  private async queueAction(
    action: any,
    context: AutomationContext,
    workflow: any
  ) {
    const { error } = await supabase
      .from('automation_message_queue')
      .insert({
        automation_id: workflow.id,
        step_id: action.id,
        message_type: action.action_type,
        message_data: {
          action: action,
          context: context
        },
        scheduled_for: this.getNextDeliveryTime(action.delivery_window),
        status: 'pending'
      });

    if (error) {
      console.error('Failed to queue action:', error);
      throw error;
    }
  }

  // Get next available delivery time
  private getNextDeliveryTime(deliveryWindow: any): Date {
    // Implementation would calculate the next valid time based on delivery window settings
    // For now, return next business hour
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);
    return tomorrow;
  }
  // Perform the actual action
  private async performAction(
    actionType: string,
    config: any,
    context: AutomationContext,
    workflow: any,
    userTimezone: string
  ) {
    try {
      switch (actionType) {
        case 'send_sms':
          await this.sendSMS(config, context, workflow.multi_channel_config, userTimezone);
          break;
        case 'send_email':
          await this.sendEmail(config, context, workflow.multi_channel_config, userTimezone);
          break;
        case 'create_task':
          await this.createTask(config, context);
          break;
        case 'update_task_status':
          await this.updateTaskStatus(config, context);
          break;
        case 'update_status':
          await this.updateStatus(config, context);
          break;
        case 'add_note':
          await this.addNote(config, context);
          break;
        default:
          console.warn('Unknown action type:', actionType);
      }
    } catch (error) {
      console.error('Action execution failed:', error);
      
      // Handle multi-channel fallback
      if (workflow.multi_channel_config?.fallbackEnabled) {
        await this.handleFallback(actionType, config, context, workflow.multi_channel_config, userTimezone);
      } else {
        throw error;
      }
    }
  }

  // Send SMS
  private async sendSMS(
    config: any,
    context: AutomationContext,
    multiChannelConfig: any,
    userTimezone: string
  ) {
    const recipient = this.getRecipientPhone(config.recipient, context);
    const message = this.interpolateVariables(config.message, context, userTimezone);

    console.log('Sending SMS to:', recipient);
    console.log('Message:', message);

    if (!recipient) {
      console.error('No phone number found for recipient');
      if (multiChannelConfig?.fallbackEnabled && multiChannelConfig?.fallbackChannel === 'email') {
        // Fallback to email
        await this.sendEmail(config, context, multiChannelConfig, userTimezone);
        return;
      }
      throw new Error('No phone number found for recipient');
    }

    await telnyxService.sendSMS({
      to: recipient,
      message: message
    });
  }

  // Send Email
  private async sendEmail(
    config: any,
    context: AutomationContext,
    multiChannelConfig: any,
    userTimezone: string
  ) {
    const recipient = this.getRecipientEmail(config.recipient, context);
    const subject = this.interpolateVariables(config.subject, context, userTimezone);
    const body = this.interpolateVariables(config.body || config.message, context, userTimezone);

    console.log('Sending email to:', recipient);

    if (!recipient) {
      console.error('No email address found for recipient');
      if (multiChannelConfig?.fallbackEnabled && multiChannelConfig?.fallbackChannel === 'sms') {
        // Fallback to SMS
        await this.sendSMS({
          message: `${subject}: ${body}`.substring(0, 160)
        }, context, multiChannelConfig, userTimezone);
        return;
      }
      throw new Error('No email address found for recipient');
    }

    await mailgunService.sendEmail({
      to: recipient,
      subject: subject,
      text: body,
      html: body.replace(/\n/g, '<br>')
    });
  }
  // Create task
  private async createTask(config: any, context: AutomationContext) {
    const assignee = this.getAssignee(config.assignee, context);
    const dueDate = this.calculateDueDate(config.dueDate || config.due_date, context);
    const description = this.interpolateVariables(config.description, context, 'America/New_York');
    const priority = config.priority || 'medium';

    const { error } = await supabase.from('tasks').insert({
      description,
      assigned_to: assignee,
      due_date: dueDate,
      priority: priority,
      job_id: context.job?.id,
      client_id: context.client?.id,
      organization_id: context.organization?.id,
      created_by_automation: context.automationId
    });

    if (error) {
      console.error('Failed to create task:', error);
      throw error;
    }
  }

  // Update task status
  private async updateTaskStatus(config: any, context: AutomationContext) {
    const status = config.taskStatus || 'completed';
    const selection = config.taskSelection || 'all';
    
    let query = supabase
      .from('tasks')
      .update({ 
        status: status,
        ...(status === 'completed' ? {
          completed_at: new Date().toISOString(),
          completed_by: context.user?.id
        } : {})
      })
      .eq('organization_id', context.organization?.id);

    // Apply task selection filters
    switch (selection) {
      case 'all':
        if (context.job?.id) {
          query = query.eq('job_id', context.job.id);
        } else if (context.task?.job_id) {
          query = query.eq('job_id', context.task.job_id);
        }
        break;
      
      case 'overdue':
        query = query.lt('due_date', new Date().toISOString())
          .in('status', ['pending', 'in_progress']);
        if (context.job?.id) {
          query = query.eq('job_id', context.job.id);
        }
        break;
      
      case 'priority_high':
        query = query.eq('priority', 'high');
        if (context.job?.id) {
          query = query.eq('job_id', context.job.id);
        }
        break;
      
      case 'assigned_to_trigger':
        if (context.user?.id) {
          query = query.eq('assigned_to', context.user.id);
        }
        if (context.job?.id) {
          query = query.eq('job_id', context.job.id);
        }
        break;
    }

    const { error } = await query;

    if (error) {
      console.error('Failed to update task status:', error);
      throw error;
    }
  }

  // Update status
  private async updateStatus(config: any, context: AutomationContext) {
    if (context.job) {
      await supabase
        .from('jobs')
        .update({ status: config.status })
        .eq('id', context.job.id);
    }
  }

  // Add note
  private async addNote(config: any, context: AutomationContext) {
    const content = this.interpolateVariables(config.content, context, 'America/New_York');
    
    await supabase.from('notes').insert({
      content,
      job_id: context.job?.id,
      client_id: context.client?.id,
      organization_id: context.organization?.id
    });
  }
  // Interpolate variables with timezone-aware date/time
  private interpolateVariables(
    text: string,
    context: AutomationContext,
    userTimezone: string
  ): string {
    let processedText = text;

    // Client variables
    if (context.client) {
      processedText = processedText
        .replace(/{{client_name}}/g, context.client.name || '')
        .replace(/{{client_first_name}}/g, context.client.first_name || context.client.name?.split(' ')[0] || '')
        .replace(/{{client_last_name}}/g, context.client.last_name || context.client.name?.split(' ')[1] || '')
        .replace(/{{client_email}}/g, context.client.email || '')
        .replace(/{{client_phone}}/g, context.client.phone || '')
        .replace(/{{phone}}/g, context.client.phone || '')
        .replace(/{{email}}/g, context.client.email || '')
        .replace(/{{client_address}}/g, context.client.address || '')
        .replace(/{{client_city}}/g, context.client.city || '')
        .replace(/{{client_state}}/g, context.client.state || '')
        .replace(/{{client_zip}}/g, context.client.zip || '');
    }

    // Job variables
    if (context.job) {
      processedText = processedText
        .replace(/{{job_title}}/g, context.job.title || '')
        .replace(/{{job_description}}/g, context.job.description || '')
        .replace(/{{job_type}}/g, context.job.job_type || '')
        .replace(/{{job_service}}/g, context.job.service || '')
        .replace(/{{scheduled_date}}/g, this.formatDate(context.job.date, userTimezone))
        .replace(/{{scheduled_time}}/g, this.formatTime(context.job.date, userTimezone))
        .replace(/{{appointment_date}}/g, this.formatDate(context.job.date, userTimezone))
        .replace(/{{appointment_time}}/g, this.formatTime(context.job.date, userTimezone))
        .replace(/{{job_status}}/g, context.job.status || '')
        .replace(/{{job_number}}/g, context.job.id || '')
        .replace(/{{job_address}}/g, context.job.address || '');
    }

    // Technician variables
    if (context.technician) {
      processedText = processedText
        .replace(/{{technician_name}}/g, context.technician.name || '')
        .replace(/{{technician_phone}}/g, context.technician.phone || '')
        .replace(/{{technician_email}}/g, context.technician.email || '');
    }

    // Organization variables
    if (context.organization) {
      processedText = processedText
        .replace(/{{company_name}}/g, context.organization.name || '')
        .replace(/{{company_phone}}/g, context.organization.phone || '')
        .replace(/{{company_email}}/g, context.organization.email || '')
        .replace(/{{company_website}}/g, context.organization.website || '')
        .replace(/{{booking_link}}/g, context.organization.booking_link || '')
        .replace(/{{review_link}}/g, context.organization.review_link || '');
    }

    // Date/Time variables with timezone support
    const now = new Date();
    const zonedNow = toZonedTime(now, userTimezone);
    const tomorrow = new Date(now.getTime() + 86400000);
    const zonedTomorrow = toZonedTime(tomorrow, userTimezone);

    processedText = processedText
      .replace(/{{current_date}}/g, this.formatDate(zonedNow, userTimezone))
      .replace(/{{current_time}}/g, this.formatTime(zonedNow, userTimezone))
      .replace(/{{tomorrow_date}}/g, this.formatDate(zonedTomorrow, userTimezone));

    return processedText;
  }
  // Helper: Get recipient
  private getRecipient(recipientConfig: string, context: AutomationContext): string {
    switch (recipientConfig) {
      case 'customer':
      case 'client':
        return context.client?.phone || context.client?.email || '';
      case 'technician':
        return context.technician?.phone || context.technician?.email || '';
      default:
        return recipientConfig;
    }
  }

  // Helper: Get recipient phone
  private getRecipientPhone(recipientConfig: string, context: AutomationContext): string {
    switch (recipientConfig) {
      case 'customer':
      case 'client':
        return context.client?.phone || '';
      case 'technician':
        return context.technician?.phone || '';
      default:
        // Check if it's a phone number
        return recipientConfig.match(/^\+?[1-9]\d{1,14}$/) ? recipientConfig : '';
    }
  }

  // Helper: Get recipient email
  private getRecipientEmail(recipientConfig: string, context: AutomationContext): string {
    switch (recipientConfig) {
      case 'customer':
      case 'client':
        return context.client?.email || '';
      case 'technician':
        return context.technician?.email || '';
      default:
        // Check if it's an email
        return recipientConfig.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/) ? recipientConfig : '';
    }
  }

  // Helper: Get assignee
  private getAssignee(assigneeConfig: string, context: AutomationContext): string {
    switch (assigneeConfig) {
      case 'technician':
        return context.technician?.id || '';
      case 'manager':
        // TODO: Get manager from organization
        return '';
      default:
        return assigneeConfig;
    }
  }

  // Helper: Calculate due date
  private calculateDueDate(dueDateConfig: string, context: AutomationContext): string | undefined {
    if (!dueDateConfig) return undefined;
    
    // Handle relative date formats like "+1 day", "+3 days", etc.
    if (dueDateConfig.startsWith('+')) {
      const matches = dueDateConfig.match(/\+(\d+)\s*(day|days|hour|hours|week|weeks)/);
      if (matches) {
        const amount = parseInt(matches[1]);
        const unit = matches[2];
        const date = new Date();
        
        switch (unit) {
          case 'hour':
          case 'hours':
            date.setHours(date.getHours() + amount);
            break;
          case 'day':
          case 'days':
            date.setDate(date.getDate() + amount);
            break;
          case 'week':
          case 'weeks':
            date.setDate(date.getDate() + (amount * 7));
            break;
        }
        
        return date.toISOString();
      }
    }
    
    // Handle predefined options
    switch (dueDateConfig) {
      case 'scheduled_date':
        return context.job?.date || undefined;
      case 'tomorrow':
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString();
      case 'next_week':
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);
        return nextWeek.toISOString();
      default:
        // If it's already a date string, return it
        try {
          const date = new Date(dueDateConfig);
          if (!isNaN(date.getTime())) {
            return date.toISOString();
          }
        } catch (e) {
          console.error('Invalid date format:', dueDateConfig);
        }
        return undefined;
    }
  }

  // Helper: Format date with timezone
  private formatDate(date: Date | string, timezone: string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    const zonedDate = toZonedTime(d, timezone);
    
    return format(zonedDate, 'EEE, MMM d, yyyy', { timeZone: timezone });
  }

  // Helper: Format time with timezone
  private formatTime(date: Date | string, timezone: string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    const zonedDate = toZonedTime(d, timezone);
    
    return format(zonedDate, 'h:mm a', { timeZone: timezone });
  }

  // Handle multi-channel fallback
  private async handleFallback(
    failedAction: string,
    config: any,
    context: AutomationContext,
    multiChannelConfig: any,
    userTimezone: string
  ) {
    const fallbackChannel = multiChannelConfig.fallbackChannel;
    
    if (failedAction === 'send_sms' && fallbackChannel === 'email') {
      await this.sendEmail({
        subject: 'Message from ' + (context.organization?.name || 'Your Service Provider'),
        body: config.message
      }, context, multiChannelConfig, userTimezone);
    } else if (failedAction === 'send_email' && fallbackChannel === 'sms') {
      await this.sendSMS({
        message: `${config.subject}: ${config.body}`.substring(0, 160)
      }, context, multiChannelConfig, userTimezone);
    }
  }
  // Log execution
  private async logExecution(
    workflowId: string,
    status: string,
    context: AutomationContext,
    error?: any
  ) {
    await supabase.from('automation_logs').insert({
      automation_id: workflowId,
      status,
      context,
      error: error?.message,
      executed_at: new Date()
    });
  }

  // Update execution metrics
  private async updateMetrics(workflowId: string, success: boolean) {
    const { error } = await supabase.rpc('increment_automation_metrics', {
      p_automation_id: workflowId,
      p_success: success
    });

    if (error) {
      console.error('Failed to update metrics:', error);
    }
  }
}

export default AutomationExecutionService;

// Export singleton instance for backward compatibility
export const automationExecutor = AutomationExecutionService.getInstance();

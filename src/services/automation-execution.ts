import { supabase } from '@/integrations/supabase/client';

interface AutomationContext {
  job?: any;
  client?: any;
  invoice?: any;
  technician?: any;
  organization?: any;
  previousStatus?: string;
  newStatus?: string;
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

  // Main execution method
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

      // Check if trigger conditions are met
      if (!this.checkTriggerConditions(workflow, context)) {
        console.log('Trigger conditions not met, skipping execution');
        return;
      }

      // Check delivery window
      if (!this.checkDeliveryWindow(workflow.delivery_window)) {
        console.log('Outside delivery window, scheduling for later');
        // TODO: Schedule for appropriate time
        return;
      }

      // Execute the action
      await this.executeAction(workflow, context);

      // Update execution metrics
      await this.updateMetrics(workflowId, true);

    } catch (error) {
      console.error('Error executing automation:', error);
      await this.updateMetrics(workflowId, false);
      throw error;
    }
  }
  // Check if trigger conditions are met
  private checkTriggerConditions(workflow: any, context: AutomationContext): boolean {
    const conditions = workflow.trigger_conditions || [];
    
    for (const condition of conditions) {
      if (!this.evaluateCondition(condition, context)) {
        return false;
      }
    }
    
    return true;
  }

  // Evaluate a single condition
  private evaluateCondition(condition: any, context: AutomationContext): boolean {
    const { field, operator, value } = condition;

    // Handle status change conditions
    if (field === 'status_from' && context.previousStatus) {
      return this.compareValues(context.previousStatus, operator, value);
    }
    
    if (field === 'status_to' && context.newStatus) {
      return this.compareValues(context.newStatus, operator, value);
    }
    
    if (field === 'status') {
      return this.compareValues(context.job?.status || context.newStatus, operator, value);
    }

    // Handle other fields
    if (field === 'days_overdue' && context.invoice) {
      const daysOverdue = this.calculateDaysOverdue(context.invoice.due_date);
      return this.compareValues(daysOverdue, operator, parseInt(value));
    }

    if (field === 'technician_id') {
      return operator === 'not_empty' ? !!context.job?.technician_id : !context.job?.technician_id;
    }

    if (field === 'job_status') {
      return this.compareValues(context.job?.status, operator, value);
    }

    return true;
  }
  // Compare values based on operator
  private compareValues(fieldValue: any, operator: string, compareValue: any): boolean {
    switch (operator) {
      case 'equals':
        return fieldValue === compareValue;
      case 'not_equals':
        return fieldValue !== compareValue;
      case 'contains':
        return String(fieldValue).includes(String(compareValue));
      case 'greater_than':
        return fieldValue > compareValue;
      case 'less_than':
        return fieldValue < compareValue;
      case 'not_empty':
        return !!fieldValue;
      case 'is_empty':
        return !fieldValue;
      default:
        return true;
    }
  }

  // Calculate days overdue
  private calculateDaysOverdue(dueDate: string): number {
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = today.getTime() - due.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  }

  // Check delivery window
  private checkDeliveryWindow(deliveryWindow: any): boolean {
    if (!deliveryWindow || !deliveryWindow.businessHoursOnly) {
      return true;
    }

    const now = new Date();
    const dayOfWeek = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][now.getDay()];
    
    // Check if today is allowed
    if (!deliveryWindow.allowedDays?.includes(dayOfWeek)) {
      return false;
    }

    // Check time range
    if (deliveryWindow.timeRange) {
      const currentTime = now.getHours() * 60 + now.getMinutes();
      const [startHour, startMin] = deliveryWindow.timeRange.start.split(':').map(Number);
      const [endHour, endMin] = deliveryWindow.timeRange.end.split(':').map(Number);
      const startTime = startHour * 60 + startMin;
      const endTime = endHour * 60 + endMin;
      
      return currentTime >= startTime && currentTime <= endTime;
    }

    return true;
  }
  // Execute the action
  private async executeAction(workflow: any, context: AutomationContext) {
    const { action_type, action_config } = workflow;
    const delay = action_config.delay || { type: 'immediate' };

    // Calculate delay in milliseconds
    let delayMs = 0;
    if (delay.type !== 'immediate') {
      switch (delay.type) {
        case 'minutes':
          delayMs = (delay.value || 1) * 60 * 1000;
          break;
        case 'hours':
          delayMs = (delay.value || 1) * 60 * 60 * 1000;
          break;
        case 'days':
          delayMs = (delay.value || 1) * 24 * 60 * 60 * 1000;
          break;
      }
    }

    // Schedule or execute immediately
    if (delayMs > 0) {
      setTimeout(() => this.performAction(action_type, action_config, context, workflow), delayMs);
    } else {
      await this.performAction(action_type, action_config, context, workflow);
    }
  }

  // Perform the actual action
  private async performAction(actionType: string, config: any, context: AutomationContext, workflow: any) {
    try {
      switch (actionType) {
        case 'send_sms':
          await this.sendSMS(config, context, workflow.multi_channel_config);
          break;
        case 'send_email':
          await this.sendEmail(config, context, workflow.multi_channel_config);
          break;
        case 'create_task':
          await this.createTask(config, context);
          break;
        case 'update_job_status':
          await this.updateJobStatus(config, context);
          break;
        case 'notify_team':
          await this.notifyTeam(config, context);
          break;
        // Add more action types as needed
        default:
          console.warn(`Unknown action type: ${actionType}`);
      }
    } catch (error) {
      console.error(`Error performing action ${actionType}:`, error);
      
      // Handle multi-channel fallback
      if (workflow.multi_channel_config?.fallbackEnabled) {
        const fallbackDelay = workflow.multi_channel_config.fallbackDelayHours * 60 * 60 * 1000;
        setTimeout(() => {
          this.executeFallback(actionType, config, context, workflow.multi_channel_config);
        }, fallbackDelay);
      }
      
      throw error;
    }
  }
  // Send SMS
  private async sendSMS(config: any, context: AutomationContext, multiChannelConfig?: any) {
    const message = await this.replaceVariables(config.message, context);
    const recipient = this.getRecipient(config.recipient, context);

    // Log the message for now - integrate with SMS service
    console.log('Sending SMS:', { to: recipient, message });

    // TODO: Integrate with SMS service (Twilio, Telnyx, etc.)
    // const { error } = await smsService.send({
    //   to: recipient,
    //   message: message
    // });
  }

  // Send Email
  private async sendEmail(config: any, context: AutomationContext, multiChannelConfig?: any) {
    const subject = await this.replaceVariables(config.subject || '', context);
    const body = await this.replaceVariables(config.body || config.message || '', context);
    const recipient = this.getRecipient(config.recipient, context);

    // Log the email for now - integrate with email service
    console.log('Sending Email:', { to: recipient, subject, body });

    // TODO: Integrate with email service
    // const { error } = await emailService.send({
    //   to: recipient,
    //   subject: subject,
    //   body: body
    // });
  }

  // Create Task
  private async createTask(config: any, context: AutomationContext) {
    const title = await this.replaceVariables(config.title, context);
    const description = await this.replaceVariables(config.description || '', context);
    
    const taskData = {
      title,
      description,
      job_id: context.job?.id,
      assigned_to: this.getAssignee(config.assignTo, context),
      due_date: this.calculateDueDate(config.dueDate, context),
      created_by: 'automation',
      status: 'pending'
    };

    // TODO: Create task in database
    console.log('Creating task:', taskData);
  }
  // Update Job Status
  private async updateJobStatus(config: any, context: AutomationContext) {
    if (!context.job?.id) return;

    const newStatus = config.status;
    
    const { error } = await supabase
      .from('jobs')
      .update({ status: newStatus })
      .eq('id', context.job.id);

    if (error) {
      throw new Error(`Failed to update job status: ${error.message}`);
    }
  }

  // Notify Team
  private async notifyTeam(config: any, context: AutomationContext) {
    const message = await this.replaceVariables(config.message, context);
    const recipients = await this.getTeamRecipients(config.recipients, context);

    // Send notification to each team member
    for (const recipient of recipients) {
      if (config.notifyMethod === 'sms') {
        await this.sendSMS({ message, recipient: recipient.phone }, context);
      } else if (config.notifyMethod === 'email') {
        await this.sendEmail({ 
          subject: 'Team Notification', 
          body: message, 
          recipient: recipient.email 
        }, context);
      }
    }
  }

  // Execute fallback channel
  private async executeFallback(
    originalAction: string, 
    config: any, 
    context: AutomationContext, 
    multiChannelConfig: any
  ) {
    const fallbackChannel = multiChannelConfig.fallbackChannel;
    
    if (originalAction === 'send_sms' && fallbackChannel === 'email') {
      await this.sendEmail({
        subject: 'Message from ' + (context.organization?.name || 'Your Service Provider'),
        body: config.message
      }, context, multiChannelConfig);
    } else if (originalAction === 'send_email' && fallbackChannel === 'sms') {
      await this.sendSMS({
        message: `${config.subject}: ${config.body}`.substring(0, 160)
      }, context, multiChannelConfig);
    }
  }
  // Helper: Replace variables in text
  private async replaceVariables(text: string, context: AutomationContext): Promise<string> {
    let processedText = text;

    // Client variables
    if (context.client) {
      processedText = processedText
        .replace(/{{client_name}}/g, context.client.name || '')
        .replace(/{{client_first_name}}/g, context.client.name?.split(' ')[0] || '')
        .replace(/{{client_email}}/g, context.client.email || '')
        .replace(/{{client_phone}}/g, context.client.phone || '')
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
        .replace(/{{scheduled_date}}/g, this.formatDate(context.job.scheduled_date))
        .replace(/{{scheduled_time}}/g, this.formatTime(context.job.scheduled_time))
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

    // Date/Time variables
    processedText = processedText
      .replace(/{{current_date}}/g, this.formatDate(new Date()))
      .replace(/{{current_time}}/g, this.formatTime(new Date()))
      .replace(/{{tomorrow_date}}/g, this.formatDate(new Date(Date.now() + 86400000)));

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
  private calculateDueDate(dueDateConfig: string, context: AutomationContext): Date {
    switch (dueDateConfig) {
      case 'scheduled_date':
        return new Date(context.job?.scheduled_date || Date.now());
      case 'tomorrow':
        return new Date(Date.now() + 86400000);
      case 'next_week':
        return new Date(Date.now() + 7 * 86400000);
      default:
        return new Date();
    }
  }

  // Helper: Get team recipients
  private async getTeamRecipients(recipientConfig: string, context: AutomationContext): Promise<any[]> {
    switch (recipientConfig) {
      case 'all_available':
        // TODO: Get all available team members
        const { data } = await supabase
          .from('profiles')
          .select('id, name, phone, email')
          .eq('available_for_jobs', true)
          .eq('status', 'active');
        return data || [];
      
      case 'managers':
        // TODO: Get managers only
        const { data: managers } = await supabase
          .from('profiles')
          .select('id, name, phone, email')
          .eq('role', 'admin');
        return managers || [];
      
      default:
        return [];
    }
  }

  // Helper: Format date
  private formatDate(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }

  // Helper: Format time
  private formatTime(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }

  // Update execution metrics
  private async updateMetrics(workflowId: string, success: boolean) {
    const { error } = await supabase.rpc('increment_automation_metrics', {
      workflow_id: workflowId,
      success: success
    });

    if (error) {
      console.error('Error updating metrics:', error);
    }
  }
}

// Export singleton instance
export const automationExecutor = AutomationExecutionService.getInstance();
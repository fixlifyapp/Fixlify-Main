import { supabase } from '@/integrations/supabase/client';
import { automationExecutor } from './automation-execution';

export class AutomationTriggerService {
  private static instance: AutomationTriggerService;
  private jobStatusSubscription: any;

  private constructor() {
    this.setupRealtimeSubscriptions();
  }

  static getInstance(): AutomationTriggerService {
    if (!AutomationTriggerService.instance) {
      AutomationTriggerService.instance = new AutomationTriggerService();
    }
    return AutomationTriggerService.instance;
  }

  // Setup realtime subscriptions for triggers
  private setupRealtimeSubscriptions() {
    // Subscribe to job status changes
    this.jobStatusSubscription = supabase
      .channel('job-status-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'jobs',
          filter: 'status=neq.prev.status'
        },
        async (payload) => {
          await this.handleJobStatusChange(payload);
        }
      )
      .subscribe();

    // Subscribe to new jobs
    supabase
      .channel('new-jobs')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'jobs'
        },
        async (payload) => {
          await this.handleNewJob(payload);
        }
      )
      .subscribe();

    // Subscribe to invoice changes
    supabase
      .channel('invoice-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'invoices'
        },
        async (payload) => {
          await this.handleInvoiceChange(payload);
        }
      )
      .subscribe();
  }

  // Handle job status change
  private async handleJobStatusChange(payload: any) {
    const { old: oldJob, new: newJob } = payload;
    
    if (!oldJob || !newJob) return;

    // Get related data
    const context = await this.buildContext(newJob);
    context.previousStatus = oldJob.status;
    context.newStatus = newJob.status;

    // Find and execute relevant automations
    await this.triggerAutomations('job_status_changed', context);
    await this.triggerAutomations('job_status_to', context);
    await this.triggerAutomations('job_status_from', context);
    
    // Check for specific status triggers
    if (newJob.status === 'completed') {
      await this.triggerAutomations('job_completed', context);
    } else if (newJob.status === 'scheduled') {
      await this.triggerAutomations('job_scheduled', context);
    }
  }
  // Handle new job
  private async handleNewJob(payload: any) {
    const newJob = payload.new;
    if (!newJob) return;

    const context = await this.buildContext(newJob);
    await this.triggerAutomations('job_created', context);
  }

  // Handle invoice changes
  private async handleInvoiceChange(payload: any) {
    const { eventType, new: newInvoice, old: oldInvoice } = payload;
    
    if (eventType === 'INSERT') {
      const context = await this.buildInvoiceContext(newInvoice);
      await this.triggerAutomations('invoice_created', context);
    } else if (eventType === 'UPDATE') {
      // Check for payment received
      if (!oldInvoice?.paid_at && newInvoice?.paid_at) {
        const context = await this.buildInvoiceContext(newInvoice);
        await this.triggerAutomations('payment_received', context);
      }
      
      // Check for overdue
      if (newInvoice?.status === 'overdue' && oldInvoice?.status !== 'overdue') {
        const context = await this.buildInvoiceContext(newInvoice);
        await this.triggerAutomations('invoice_overdue', context);
      }
    }
  }

  // Build context for job-related triggers
  private async buildContext(job: any): Promise<any> {
    const context: any = { job };

    // Get client data
    if (job.client_id) {
      const { data: client } = await supabase
        .from('clients')
        .select('*')
        .eq('id', job.client_id)
        .single();
      context.client = client;
    }

    // Get technician data
    if (job.technician_id) {
      const { data: technician } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', job.technician_id)
        .single();
      context.technician = technician;
    }

    // Get organization data
    const { data: organization } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', job.user_id)
      .single();
    context.organization = organization;

    return context;
  }

  // Build context for invoice-related triggers
  private async buildInvoiceContext(invoice: any): Promise<any> {
    const context: any = { invoice };

    // Get job data
    if (invoice.job_id) {
      const { data: job } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', invoice.job_id)
        .single();
      
      if (job) {
        context.job = job;
        // Get additional context from job
        const jobContext = await this.buildContext(job);
        Object.assign(context, jobContext);
      }
    }

    return context;
  }
  // Trigger automations for a specific event
  private async triggerAutomations(triggerType: string, context: any) {
    try {
      // Get organization context from the job or use the service context
      const organizationId = context.job?.organization_id || 
                           context.organization?.id || 
                           context.organizationId;
      
      const userId = context.job?.user_id || 
                    context.user?.id || 
                    context.userId;

      if (!organizationId && !userId) {
        console.warn('No organization or user context available for automation trigger');
        return;
      }

      // Build query for automations
      let query = supabase
        .from('automation_workflows')
        .select('*')
        .eq('trigger_type', triggerType)
        .or('status.eq.active,is_active.eq.true,enabled.eq.true');

      // Apply organization/user filter
      if (organizationId && userId) {
        query = query.or(`organization_id.eq.${organizationId},user_id.eq.${userId}`);
      } else if (organizationId) {
        query = query.eq('organization_id', organizationId);
      } else if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data: automations, error } = await query;

      if (error || !automations) return;

      // Execute each automation
      for (const automation of automations) {
        try {
          await automationExecutor.executeAutomation(automation.id, context);
        } catch (error) {
          console.error(`Error executing automation ${automation.id}:`, error);
        }
      }
    } catch (error) {
      console.error(`Error triggering automations for ${triggerType}:`, error);
    }
  }

  // Schedule time-based triggers
  async scheduleTimeTriggers() {
    // Check for appointments tomorrow every hour
    setInterval(async () => {
      await this.checkAppointmentsTomorrow();
    }, 60 * 60 * 1000); // Every hour

    // Check for overdue invoices daily
    setInterval(async () => {
      await this.checkOverdueInvoices();
    }, 24 * 60 * 60 * 1000); // Every 24 hours

    // Initial checks
    await this.checkAppointmentsTomorrow();
    await this.checkOverdueInvoices();
  }

  // Check for appointments tomorrow
  private async checkAppointmentsTomorrow() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const dayAfter = new Date(tomorrow);
    dayAfter.setDate(dayAfter.getDate() + 1);

    const { data: jobs } = await supabase
      .from('jobs')
      .select('*')
      .gte('date', tomorrow.toISOString())
      .lt('date', dayAfter.toISOString())
      .eq('status', 'scheduled');

    if (jobs) {
      for (const job of jobs) {
        const context = await this.buildContext(job);
        await this.triggerAutomations('appointment_tomorrow', context);
      }
    }
  }

  // Check for overdue invoices
  private async checkOverdueInvoices() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data: invoices } = await supabase
      .from('invoices')
      .select('*')
      .lt('due_date', today.toISOString())
      .eq('status', 'pending');

    if (invoices) {
      for (const invoice of invoices) {
        const context = await this.buildInvoiceContext(invoice);
        await this.triggerAutomations('invoice_overdue', context);
      }
    }
  }

  // Cleanup subscriptions
  cleanup() {
    if (this.jobStatusSubscription) {
      this.jobStatusSubscription.unsubscribe();
    }
  }
}

// Export singleton instance
export const automationTrigger = AutomationTriggerService.getInstance();
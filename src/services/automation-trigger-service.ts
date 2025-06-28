import { supabase } from '@/integrations/supabase/client';
import { AutomationExecutionService } from './automation-execution-service';

export class AutomationTriggerService {
  private static subscriptions: any[] = [];

  // Initialize all trigger listeners
  static async initialize(userId: string) {
    // Clear existing subscriptions
    this.cleanup();

    // Get all active automations
    const { data: automations } = await supabase
      .from('automation_workflows')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active');

    if (!automations) return;

    // Set up listeners for each automation
    for (const automation of automations) {
      const triggerType = automation.trigger_type;
      const triggerConditions = automation.trigger_conditions as any;

      switch (triggerType) {
        case 'status_change':
          this.listenForStatusChanges(automation, userId);
          break;
        case 'entity_created':
          this.listenForNewEntities(automation, userId);
          break;
        case 'payment_received':
          this.listenForPayments(automation, userId);
          break;
        // Add more trigger types as needed
      }
    }
  }

  // Listen for job status changes
  private static listenForStatusChanges(automation: any, userId: string) {
    const conditions = automation.trigger_conditions as any;
    
    const subscription = supabase
      .channel(`job-status-${automation.id}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'jobs',
        filter: `user_id=eq.${userId}`
      }, async (payload) => {
        const oldStatus = payload.old.status;
        const newStatus = payload.new.status;

        // Check if status change matches trigger conditions
        if (conditions.from_status && oldStatus !== conditions.from_status) return;
        if (conditions.to_status && newStatus !== conditions.to_status) return;

        // Execute workflow
        await AutomationExecutionService.executeWorkflow({
          workflowId: automation.id,
          triggeredBy: 'status_change',
          entityId: payload.new.id,
          entityType: 'job',
          context: {
            userId,
            clientId: payload.new.client_id,
            oldStatus,
            newStatus
          }
        });
      })
      .subscribe();

    this.subscriptions.push(subscription);
  }
  // Listen for new entities
  private static listenForNewEntities(automation: any, userId: string) {
    const conditions = automation.trigger_conditions as any;
    const entityType = conditions.entity_type || 'job';
    
    const subscription = supabase
      .channel(`new-${entityType}-${automation.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: entityType === 'job' ? 'jobs' : 'clients',
        filter: `user_id=eq.${userId}`
      }, async (payload) => {
        // Execute workflow
        await AutomationExecutionService.executeWorkflow({
          workflowId: automation.id,
          triggeredBy: 'entity_created',
          entityId: payload.new.id,
          entityType: entityType,
          context: {
            userId,
            clientId: entityType === 'job' ? payload.new.client_id : payload.new.id
          }
        });
      })
      .subscribe();

    this.subscriptions.push(subscription);
  }

  // Listen for payments
  private static listenForPayments(automation: any, userId: string) {
    const subscription = supabase
      .channel(`payments-${automation.id}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'invoices',
        filter: `user_id=eq.${userId}`
      }, async (payload) => {
        // Check if payment was just received
        if (payload.old.status !== 'paid' && payload.new.status === 'paid') {
          await AutomationExecutionService.executeWorkflow({
            workflowId: automation.id,
            triggeredBy: 'payment_received',
            entityId: payload.new.id,
            entityType: 'invoice',
            context: {
              userId,
              clientId: payload.new.client_id,
              amount: payload.new.total
            }
          });
        }
      })
      .subscribe();

    this.subscriptions.push(subscription);
  }

  // Cleanup subscriptions
  static cleanup() {
    this.subscriptions.forEach(sub => {
      supabase.removeChannel(sub);
    });
    this.subscriptions = [];
  }
}
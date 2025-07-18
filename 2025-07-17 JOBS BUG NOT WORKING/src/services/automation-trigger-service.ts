import { supabase } from '@/integrations/supabase/client';
import AutomationExecutionService from './automation-execution-service';
import { AutomationExecutionTracker } from './automation/execution-tracker';

export class AutomationTriggerService {
  private static subscriptions: any[] = [];

  // Initialize all trigger listeners
  static async initialize(userId: string, organizationId: string) {
    // Clear existing subscriptions
    this.cleanup();

    // Check if organizationId is valid
    if (!organizationId || organizationId === 'undefined') {
      console.warn('Invalid organization ID, skipping automation setup');
      return;
    }

    // Get all active automations
    const { data: automations } = await supabase
      .from('automation_workflows')
      .select('*')
      .eq('organization_id', organizationId)
      .or('status.eq.active,is_active.eq.true,enabled.eq.true');

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
        case 'task_created':
        case 'task_completed':
        case 'task_status_changed':
        case 'task_overdue':
          this.listenForTasks(automation, userId);
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

        // Skip if job was created by automation to prevent loops
        if (AutomationExecutionTracker.isCreatedByAutomation(payload.new)) {
          console.log(`Skipping automation ${automation.id} for job ${payload.new.id} - created by automation`);
          return;
        }
        
        // Check if we can execute this automation for this entity
        if (!AutomationExecutionTracker.canExecute(automation.id, payload.new.id, 'job')) {
          console.log(`Skipping automation ${automation.id} for job ${payload.new.id} - max executions reached`);
          return;
        }
        
        // Track this execution
        AutomationExecutionTracker.trackExecution(automation.id, payload.new.id, 'job');

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
        // Skip if entity was created by automation to prevent loops
        if (AutomationExecutionTracker.isCreatedByAutomation(payload.new)) {
          console.log(`Skipping automation ${automation.id} for ${entityType} ${payload.new.id} - created by automation`);
          return;
        }
        
        // Check if we can execute this automation for this entity
        if (!AutomationExecutionTracker.canExecute(automation.id, payload.new.id, entityType)) {
          console.log(`Skipping automation ${automation.id} for ${entityType} ${payload.new.id} - max executions reached`);
          return;
        }
        
        // Track this execution
        AutomationExecutionTracker.trackExecution(automation.id, payload.new.id, entityType);
        
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

  // Listen for task events
  private static listenForTasks(automation: any, userId: string) {
    const triggerType = automation.trigger_type;
    const conditions = automation.trigger_conditions as any;
    
    if (triggerType === 'task_created') {
      const subscription = supabase
        .channel(`task-created-${automation.id}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'tasks'
        }, async (payload) => {
          // Filter by organization if needed
          if (payload.new.organization_id !== automation.organization_id) return;
          
          await AutomationExecutionService.executeWorkflow({
            workflowId: automation.id,
            triggeredBy: 'task_created',
            entityId: payload.new.id,
            entityType: 'task',
            context: {
              userId,
              clientId: payload.new.client_id,
              jobId: payload.new.job_id,
              taskId: payload.new.id
            }
          });
        })
        .subscribe();
      
      this.subscriptions.push(subscription);
    } else if (triggerType === 'task_completed') {
      const subscription = supabase
        .channel(`task-completed-${automation.id}`)
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'tasks'
        }, async (payload) => {
          // Filter by organization if needed
          if (payload.new.organization_id !== automation.organization_id) return;
          
          // Check if task was just completed
          if (payload.old.status !== 'completed' && payload.new.status === 'completed') {
            await AutomationExecutionService.executeWorkflow({
              workflowId: automation.id,
              triggeredBy: 'task_completed',
              entityId: payload.new.id,
              entityType: 'task',
              context: {
                userId,
                clientId: payload.new.client_id,
                jobId: payload.new.job_id,
                taskId: payload.new.id,
                completedBy: payload.new.completed_by
              }
            });
          }
        })
        .subscribe();
      
      this.subscriptions.push(subscription);
    } else if (triggerType === 'task_status_changed') {
      const subscription = supabase
        .channel(`task-status-${automation.id}`)
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'tasks'
        }, async (payload) => {
          // Filter by organization if needed
          if (payload.new.organization_id !== automation.organization_id) return;
          
          const oldStatus = payload.old.status;
          const newStatus = payload.new.status;
          
          // Check if status actually changed
          if (oldStatus === newStatus) return;
          
          // Check if status change matches trigger conditions
          if (conditions?.from_status && oldStatus !== conditions.from_status) return;
          if (conditions?.to_status && newStatus !== conditions.to_status) return;
          
          await AutomationExecutionService.executeWorkflow({
            workflowId: automation.id,
            triggeredBy: 'task_status_changed',
            entityId: payload.new.id,
            entityType: 'task',
            context: {
              userId,
              clientId: payload.new.client_id,
              jobId: payload.new.job_id,
              taskId: payload.new.id,
              oldStatus,
              newStatus
            }
          });
        })
        .subscribe();
      
      this.subscriptions.push(subscription);
    }
    // Note: task_overdue would typically be handled by a scheduled job/cron
    // rather than a real-time subscription
  }

  // Cleanup subscriptions
  static cleanup() {
    this.subscriptions.forEach(sub => {
      supabase.removeChannel(sub);
    });
    this.subscriptions = [];
    
    // Also reset the execution tracker
    import('./automation/execution-tracker').then(({ AutomationExecutionTracker }) => {
      AutomationExecutionTracker.reset();
    });
  }
}
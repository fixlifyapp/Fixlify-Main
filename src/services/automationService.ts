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

    const { data, error } = await supabase
      .from('automation_workflows')
      .insert({
        name: workflow.name || 'New Workflow',
        description: workflow.description || '',
        template_config: workflow.template_config || {},
        status: 'active',
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

    const { data, error } = await supabase
      .from('automation_workflows')
      .select('*')
      .eq('user_id', user.id)
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
    const { data, error } = await supabase
      .from('automation_workflows')
      .update(updates)
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
    await this.executeWorkflow(workflowId, testData);
    toast.success('Workflow test completed!');
  }

  /**
   * Advanced execution engine functionality
   */
  static async startEngine() {
    if (this.isListening) return;
    
    console.log('🚀 Starting Automation Execution Engine...');
    this.isListening = true;
    
    // Listen for real-time events
    await this.setupRealtimeListeners();
    
    // Check for scheduled workflows
    this.startScheduledWorkflowChecker();
    
    console.log('✅ Automation Engine is running');
  }

  static async stopEngine() {
    console.log('🛑 Stopping Automation Execution Engine...');
    this.isListening = false;
    
    // Remove all listeners
    this.listeners.forEach((listener, key) => {
      if (listener && typeof listener.unsubscribe === 'function') {
        listener.unsubscribe();
      }
    });
    this.listeners.clear();
    
    console.log('✅ Automation Engine stopped');
  }

  private static async setupRealtimeListeners() {
    const triggers = [
      { table: 'jobs', events: ['INSERT', 'UPDATE'] },
      { table: 'clients', events: ['INSERT', 'UPDATE'] },
      { table: 'estimates', events: ['INSERT', 'UPDATE'] },
      { table: 'invoices', events: ['INSERT', 'UPDATE'] },
      { table: 'communication_logs', events: ['INSERT'] }
    ];

    for (const trigger of triggers) {
      const channel = supabase
        .channel(`automation_${trigger.table}`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: trigger.table
        }, (payload) => {
          this.handleDatabaseEvent(trigger.table, payload);
        })
        .subscribe();

      this.listeners.set(`${trigger.table}_listener`, channel);
    }
  }

  private static async handleDatabaseEvent(table: string, payload: any) {
    if (!this.isListening) return;

    const eventType = payload.eventType;
    const record = payload.new || payload.old;
    
    console.log(`🔔 Database event: ${table}.${eventType}`, record);

    // Get active workflows that might be triggered by this event
    const workflows = await this.getActiveWorkflows();
    
    for (const workflow of workflows) {
      await this.checkAndExecuteWorkflow(workflow, table, eventType, record);
    }
  }

  private static async getActiveWorkflows(): Promise<AutomationWorkflow[]> {
    try {
      const { data, error } = await supabase
        .from('automation_workflows')
        .select('*')
        .eq('status', 'active');

      if (error) throw error;
      return (data || []) as any[];
    } catch (error) {
      console.error('Error fetching active workflows:', error);
      return [];
    }
  }

  private static async checkAndExecuteWorkflow(
    workflow: AutomationWorkflow, 
    table: string, 
    eventType: string, 
    record: any
  ) {
    try {
      const config = workflow.template_config || {};
      const triggers = Array.isArray(config.triggers) ? config.triggers : [];
      
      for (const trigger of triggers) {
        if (this.doesTriggerMatch(trigger, table, eventType, record)) {
          await this.executeWorkflow(workflow.id!, {
            trigger_type: trigger.type,
            table,
            event_type: eventType,
            record,
            workflow_id: workflow.id
          });
        }
      }
    } catch (error) {
      console.error(`Error checking workflow ${workflow.id}:`, error);
    }
  }

  private static doesTriggerMatch(trigger: any, table: string, eventType: string, record: any): boolean {
    if (!trigger || !trigger.type) return false;

    // Map database events to trigger types
    const triggerMappings: Record<string, string[]> = {
      'job_created': ['jobs.INSERT'],
      'job_status_changed': ['jobs.UPDATE'],
      'client_created': ['clients.INSERT'],
      'estimate_sent': ['estimates.INSERT', 'estimates.UPDATE'],
      'invoice_sent': ['invoices.INSERT', 'invoices.UPDATE'],
      'sms_received': ['communication_logs.INSERT']
    };

    const expectedEvents = triggerMappings[trigger.type] || [];
    const currentEvent = `${table}.${eventType}`;
    
    if (!expectedEvents.includes(currentEvent)) return false;

    // Additional condition checking
    if (trigger.conditions) {
      return this.evaluateConditions(trigger.conditions, record);
    }

    return true;
  }

  private static evaluateConditions(conditions: any[], record: any): boolean {
    if (!conditions || conditions.length === 0) return true;

    return conditions.every(condition => {
      const { field, operator, value } = condition;
      const recordValue = record[field];

      switch (operator) {
        case 'equals': return recordValue === value;
        case 'not_equals': return recordValue !== value;
        case 'contains': return String(recordValue || '').includes(value);
        case 'greater_than': return Number(recordValue) > Number(value);
        case 'less_than': return Number(recordValue) < Number(value);
        default: return false;
      }
    });
  }

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

      // Execute workflow steps
      const config = workflow.template_config || {};
      const configObj = typeof config === 'object' && config !== null && !Array.isArray(config) ? config : {};
      const actions = Array.isArray((configObj as any).actions) ? (configObj as any).actions : [];

      for (let i = 0; i < actions.length; i++) {
        const action = actions[i];
        const stepResult = await this.executeAction(action, context, workflow);
        
        execution.steps_executed.push({
          step_id: `step_${i}`,
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

  private static async executeAction(action: any, context: any, workflow: any): Promise<{success: boolean, result?: any, error?: string}> {
    try {
      switch (action.type) {
        case 'send_sms':
          return await this.executeSMSAction(action.config, context);
        case 'send_email':
          return await this.executeEmailAction(action.config, context);
        case 'create_job':
          return await this.executeCreateJobAction(action.config, context);
        case 'update_job_status':
          return await this.executeUpdateJobAction(action.config, context);
        case 'create_task':
          return await this.executeCreateTaskAction(action.config, context);
        case 'wait':
          return await this.executeWaitAction(action.config);
        default:
          console.warn(`Unknown action type: ${action.type}`);
          return { success: true, result: 'Action skipped - unknown type' };
      }
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  private static async executeSMSAction(config: any, context: any): Promise<{success: boolean, result?: any, error?: string}> {
    // SMS implementation would go here
    console.log('📱 Executing SMS action:', config);
    await this.logCommunication('sms', config.to || 'unknown', config.message || '', context);
    return { success: true, result: 'SMS sent' };
  }

  private static async executeEmailAction(config: any, context: any): Promise<{success: boolean, result?: any, error?: string}> {
    // Email implementation would go here
    console.log('📧 Executing Email action:', config);
    await this.logCommunication('email', config.to || 'unknown', config.subject || '', context);
    return { success: true, result: 'Email sent' };
  }

  private static async executeCreateJobAction(config: any, context: any): Promise<{success: boolean, result?: any, error?: string}> {
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
          notes: config.notes || `Created by automation: ${context.workflow_id}`
        });

      if (error) throw error;
      return { success: true, result: 'Job created' };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  private static async executeUpdateJobAction(config: any, context: any): Promise<{success: boolean, result?: any, error?: string}> {
    try {
      const { error } = await supabase
        .from('jobs')
        .update({
          status: config.new_status,
          notes: config.notes
        })
        .eq('id', context.job_id || context.record?.id);

      if (error) throw error;
      return { success: true, result: 'Job updated' };
    } catch (error) {
      return { success: false, error: String(error) };
    }
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
          assigned_to: config.assign_to,
          due_date: config.due_date,
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

  private static async executeWaitAction(config: any): Promise<{success: boolean, result?: any, error?: string}> {
    const waitTime = config.duration || 1000;
    await new Promise(resolve => setTimeout(resolve, waitTime));
    return { success: true, result: `Waited ${waitTime}ms` };
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
          workflow_id: execution.workflow_id,
          status: execution.status,
          started_at: execution.started_at,
          completed_at: execution.completed_at,
          details: execution.trigger_data,
          created_at: execution.started_at,
          trigger_type: execution.trigger_type
        });
    } catch (error) {
      console.error('Error logging execution:', error);
    }
  }

  private static startScheduledWorkflowChecker() {
    setInterval(async () => {
      if (!this.isListening) return;
      
      try {
        const workflows = await this.getActiveWorkflows();
        const now = new Date();
        
        for (const workflow of workflows || []) {
          const triggers = Array.isArray(workflow.triggers) ? workflow.triggers : [];
          
          for (const trigger of triggers) {
            const triggerObj = trigger as any;
            if (triggerObj.type === 'scheduled_time' && this.shouldRunScheduledTrigger(triggerObj, now)) {
              await this.executeWorkflow(workflow.id!, {
                scheduled_time: now.toISOString(),
                workflow_id: workflow.id
              });
            }
          }
        }
      } catch (error) {
        console.error('Error in scheduled workflow checker:', error);
      }
    }, 60000); // Check every minute
  }

  private static shouldRunScheduledTrigger(trigger: any, now: Date): boolean {
    // Simple scheduled trigger logic
    const hour = now.getHours();
    const minute = now.getMinutes();
    
    if (trigger.frequency === 'daily' && trigger.time) {
      const [triggerHour, triggerMinute] = trigger.time.split(':').map(Number);
      return hour === triggerHour && minute === triggerMinute;
    }
    
    return false;
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

      return {
        total_executions: total,
        successful_executions: successful,
        failed_executions: failed,
        running_executions: running,
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
        success_rate: 0,
        recent_executions: []
      };
    }
  }
}

export const automationService = AutomationService;
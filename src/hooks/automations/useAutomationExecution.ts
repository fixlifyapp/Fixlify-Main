import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/OrganizationContext';
import { telnyxService } from '@/services/communications/TelnyxService';
import { mailgunService } from '@/services/communications/MailgunService';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { useCompanySettings } from '@/hooks/useCompanySettings';

export interface ExecutionStep {
  id: string;
  type: 'trigger' | 'condition' | 'action';
  name: string;
  status: 'pending' | 'running' | 'success' | 'failed' | 'skipped';
  startTime?: Date;
  endTime?: Date;
  duration?: number;
  input?: any;
  output?: any;
  error?: string;
}

export interface ExecutionContext {
  workflowId: string;
  executionId: string;
  triggerData: any;
  variables: Record<string, any>;
  steps: ExecutionStep[];
}

export const useAutomationExecution = () => {
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionContext, setExecutionContext] = useState<ExecutionContext | null>(null);
  const [executionHistory, setExecutionHistory] = useState<ExecutionContext[]>([]);
  const { organization } = useOrganization();
  const { timezone: userTimezone } = useCompanySettings();

  // Execute a workflow
  const executeWorkflow = useCallback(async (
    workflowId: string,
    triggerData?: any,
    testMode = false
  ) => {
    try {
      setIsExecuting(true);
      const executionId = `exec-${Date.now()}`;

      // Initialize execution context
      const context: ExecutionContext = {
        workflowId,
        executionId,
        triggerData: triggerData || {},
        variables: {},
        steps: []
      };

      setExecutionContext(context);

      // Fetch workflow configuration
      const { data: workflow, error } = await supabase
        .from('automation_workflows')
        .select(`
          *,
          triggers:automation_triggers(*),
          actions:automation_actions(*)
        `)
        .eq('id', workflowId)
        .single();

      if (error) throw error;

      // Process triggers
      for (const trigger of workflow.triggers || []) {
        const step = await processTrigger(trigger, context, testMode);
        context.steps.push(step);
        setExecutionContext({ ...context });

        if (step.status === 'failed') {
          throw new Error(`Trigger failed: ${step.error}`);
        }
      }

      // Process actions in sequence
      for (const action of workflow.actions || []) {
        // Apply delay if configured
        if (action.delay_minutes && !testMode) {
          await new Promise(resolve => 
            setTimeout(resolve, action.delay_minutes * 60 * 1000)
          );
        }

        const step = await processAction(action, context, testMode);
        context.steps.push(step);
        setExecutionContext({ ...context });

        if (step.status === 'failed' && !testMode) {
          throw new Error(`Action failed: ${step.error}`);
        }
      }

      // Log execution
      if (!testMode) {
        await logExecution(context, 'success');
      }

      setExecutionHistory([context, ...executionHistory]);
      toast.success('Automation executed successfully');
      return context;

    } catch (error) {
      console.error('Error executing workflow:', error);
      toast.error('Automation execution failed');
      
      if (executionContext && !testMode) {
        await logExecution(executionContext, 'failed', error);
      }
      
      throw error;
    } finally {
      setIsExecuting(false);
    }
  }, [organization, executionHistory]);

  // Process a trigger
  const processTrigger = async (
    trigger: any,
    context: ExecutionContext,
    testMode: boolean
  ): Promise<ExecutionStep> => {
    const step: ExecutionStep = {
      id: `trigger-${trigger.id}`,
      type: 'trigger',
      name: trigger.event_type || 'Manual Trigger',
      status: 'running',
      startTime: new Date(),
      input: trigger.conditions
    };

    try {
      // Evaluate trigger conditions
      const conditionsMet = await evaluateConditions(
        trigger.conditions,
        context.triggerData
      );

      if (!conditionsMet) {
        step.status = 'skipped';
        step.output = { reason: 'Conditions not met' };
      } else {
        step.status = 'success';
        step.output = { triggered: true };
        
        // Extract variables from trigger data
        context.variables = {
          ...context.variables,
          ...extractVariables(context.triggerData)
        };
      }
    } catch (error: any) {
      step.status = 'failed';
      step.error = error.message;
    }

    step.endTime = new Date();
    step.duration = step.endTime.getTime() - step.startTime.getTime();
    return step;
  };

  // Process an action
  const processAction = async (
    action: any,
    context: ExecutionContext,
    testMode: boolean
  ): Promise<ExecutionStep> => {
    const step: ExecutionStep = {
      id: `action-${action.id}`,
      type: 'action',
      name: action.action_type,
      status: 'running',
      startTime: new Date(),
      input: action.action_config
    };

    try {
      switch (action.action_type) {
        case 'send_sms':
          step.output = await executeSMSAction(action.action_config, context, testMode);
          break;
        case 'send_email':
          step.output = await executeEmailAction(action.action_config, context, testMode);
          break;
        case 'make_call':
          step.output = await executeCallAction(action.action_config, context, testMode);
          break;
        case 'create_task':
          step.output = await executeTaskAction(action.action_config, context, testMode);
          break;
        case 'webhook':
          step.output = await executeWebhookAction(action.action_config, context, testMode);
          break;
        default:
          throw new Error(`Unknown action type: ${action.action_type}`);
      }

      step.status = 'success';
    } catch (error: any) {
      step.status = 'failed';
      step.error = error.message;
    }

    step.endTime = new Date();
    step.duration = step.endTime.getTime() - step.startTime.getTime();
    return step;
  };

  // Execute SMS action
  const executeSMSAction = async (config: any, context: ExecutionContext, testMode: boolean) => {
    const message = interpolateVariables(config.message, context.variables);
    const to = interpolateVariables(config.to || context.variables.phone, context.variables);

    if (testMode) {
      return {
        preview: {
          to,
          message,
          from: config.from
        }
      };
    }

    const result = await telnyxService.sendSMS({
      to,
      message,
      from: config.from
    });

    return { messageId: result.id, status: 'sent' };
  };

  // Execute Email action
  const executeEmailAction = async (config: any, context: ExecutionContext, testMode: boolean) => {
    const subject = interpolateVariables(config.subject, context.variables);
    const html = interpolateVariables(config.html || config.content, context.variables);
    const to = interpolateVariables(config.to || context.variables.email, context.variables);

    if (testMode) {
      return {
        preview: {
          to,
          subject,
          html
        }
      };
    }

    const result = await mailgunService.sendEmail({
      to,
      subject,
      html,
      text: config.text
    });

    return { messageId: result.id, status: 'sent' };
  };

  // Execute Call action
  const executeCallAction = async (config: any, context: ExecutionContext, testMode: boolean) => {
    const to = interpolateVariables(config.to || context.variables.phone, context.variables);

    if (testMode) {
      return {
        preview: {
          to,
          from: config.from
        }
      };
    }

    const result = await telnyxService.makeCall({
      to,
      from: config.from
    });

    return { callId: result.call_control_id, status: 'initiated' };
  };

  // Execute Task action
  const executeTaskAction = async (config: any, context: ExecutionContext, testMode: boolean) => {
    const title = interpolateVariables(config.title, context.variables);
    const description = interpolateVariables(config.description || '', context.variables);

    if (testMode) {
      return {
        preview: {
          title,
          description,
          assignee: config.assignee,
          due_date: config.due_date
        }
      };
    }

    // Create task in database
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        organization_id: organization?.id,
        title,
        description,
        assigned_to: config.assignee,
        due_date: config.due_date,
        priority: config.priority || 'medium',
        created_by_automation: context.workflowId
      })
      .select()
      .single();

    if (error) throw error;

    return { taskId: data.id, status: 'created' };
  };

  // Execute Webhook action  
  const executeWebhookAction = async (config: any, context: ExecutionContext, testMode: boolean) => {
    const url = interpolateVariables(config.url, context.variables);
    const payload = JSON.parse(
      interpolateVariables(JSON.stringify(config.payload || {}), context.variables)
    );

    if (testMode) {
      return {
        preview: {
          url,
          method: config.method || 'POST',
          payload
        }
      };
    }

    const response = await fetch(url, {
      method: config.method || 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...config.headers
      },
      body: JSON.stringify(payload)
    });

    return {
      status: response.status,
      statusText: response.statusText,
      response: await response.text()
    };
  };

  // Helper functions
  const evaluateConditions = async (conditions: any, data: any): Promise<boolean> => {
    if (!conditions || Object.keys(conditions).length === 0) return true;

    // Simple condition evaluation - can be enhanced
    for (const [field, condition] of Object.entries(conditions)) {
      const value = data[field];
      
      if (typeof condition === 'object' && condition !== null) {
        const { operator, value: condValue } = condition as any;
        
        switch (operator) {
          case 'equals':
            if (value !== condValue) return false;
            break;
          case 'contains':
            if (!String(value).includes(String(condValue))) return false;
            break;
          case 'greater_than':
            if (Number(value) <= Number(condValue)) return false;
            break;
          case 'less_than':
            if (Number(value) >= Number(condValue)) return false;
            break;
        }
      }
    }

    return true;
  };

  const extractVariables = (data: any): Record<string, any> => {
    const variables: Record<string, any> = {};

    const extract = (obj: any, prefix = '') => {
      for (const [key, value] of Object.entries(obj)) {
        const varKey = prefix ? `${prefix}.${key}` : key;
        
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          extract(value, varKey);
        } else {
          variables[varKey] = value;
        }
      }
    };

    extract(data);
    return variables;
  };

  const interpolateVariables = (template: string, variables: Record<string, any>): string => {
    return template.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
      const trimmedKey = key.trim();
      
      // Handle special date/time variables with timezone
      if (trimmedKey === 'current_date') {
        const now = new Date();
        const zonedDate = toZonedTime(now, userTimezone || 'America/New_York');
        return format(zonedDate, 'EEE, MMM d, yyyy');
      }
      
      if (trimmedKey === 'current_time') {
        const now = new Date();
        const zonedDate = toZonedTime(now, userTimezone || 'America/New_York');
        return format(zonedDate, 'h:mm a');
      }
      
      if (trimmedKey === 'tomorrow_date') {
        const tomorrow = new Date(Date.now() + 86400000);
        const zonedDate = toZonedTime(tomorrow, userTimezone || 'America/New_York');
        return format(zonedDate, 'EEE, MMM d, yyyy');
      }
      
      // Handle scheduled_date and scheduled_time with timezone
      if (trimmedKey === 'scheduled_date' || trimmedKey === 'appointment_date') {
        const scheduledDate = variables.job?.scheduled_date || variables.scheduled_date;
        if (scheduledDate) {
          const date = new Date(scheduledDate);
          const zonedDate = toZonedTime(date, userTimezone || 'America/New_York');
          return format(zonedDate, 'EEE, MMM d, yyyy');
        }
      }
      
      if (trimmedKey === 'scheduled_time' || trimmedKey === 'appointment_time') {
        const scheduledDate = variables.job?.scheduled_date || variables.scheduled_date;
        if (scheduledDate) {
          const date = new Date(scheduledDate);
          const zonedDate = toZonedTime(date, userTimezone || 'America/New_York');
          return format(zonedDate, 'h:mm a');
        }
      }
      
      // Handle regular variable interpolation
      const keys = trimmedKey.split('.');
      let value = variables;
      
      for (const k of keys) {
        value = value?.[k];
        if (value === undefined) break;
      }
      
      return value !== undefined ? String(value) : match;
    });
  };

  const logExecution = async (
    context: ExecutionContext,
    status: 'success' | 'failed',
    error?: any
  ) => {
    try {
      await supabase.from('automation_history').insert({
        workflow_id: context.workflowId,
        execution_status: status,
        execution_time_ms: context.steps.reduce((total, step) => 
          total + (step.duration || 0), 0
        ),
        variables_used: context.variables,
        error_details: error ? { message: error.message, stack: error.stack } : null,
        actions_executed: context.steps.map(s => ({
          id: s.id,
          type: s.type,
          name: s.name,
          status: s.status,
          duration: s.duration,
          error: s.error
        }))
      });

      // Update workflow metrics
      await supabase.rpc('increment_workflow_metrics', {
        workflow_id: context.workflowId,
        execution_count: 1,
        success_count: status === 'success' ? 1 : 0
      });
    } catch (err) {
      console.error('Error logging execution:', err);
    }
  };

  return {
    executeWorkflow,
    isExecuting,
    executionContext,
    executionHistory,
    // Utility functions exposed for testing
    interpolateVariables,
    evaluateConditions
  };
};
import { supabase } from '@/integrations/supabase/client';

/**
 * Fix workflow save to ensure steps are properly stored
 */
export async function fixWorkflowSave(workflowId: string, workflowData: any) {
  try {
    // Extract steps from template_config if present
    const steps = workflowData.template_config?.steps || workflowData.steps || [];
    
    // Extract trigger information
    const triggerStep = steps.find((s: any) => s.type === 'trigger');
    const actionSteps = steps.filter((s: any) => s.type === 'action');
    
    // Determine trigger type and config
    const triggerType = triggerStep?.subType || triggerStep?.config?.triggerType || 'manual';
    const triggerConfig = {
      triggerType: triggerType,
      conditions: triggerStep?.config?.conditions || []
    };
    
    // Ensure we have at least one action
    if (actionSteps.length === 0) {
      console.warn('No action steps found, adding default email action');
      actionSteps.push({
        id: 'action-1',
        type: 'action',
        subType: 'email',
        name: 'Send Notification',
        config: {
          subject: 'Automation Triggered',
          body: '<p>This automation was triggered.</p>',
          sendToClient: true
        }
      });
    }
    
    // Build the complete workflow data
    const updateData = {
      name: workflowData.name,
      description: workflowData.description,
      trigger_type: triggerType,
      trigger_config: triggerConfig,
      steps: actionSteps, // Store only action steps
      template_config: workflowData.template_config,
      status: 'active',
      is_active: true,
      updated_at: new Date().toISOString()
    };
    
    console.log('Updating workflow with:', updateData);
    
    // Update the workflow
    const { data, error } = await supabase
      .from('automation_workflows')
      .update(updateData)
      .eq('id', workflowId)
      .select()
      .single();
      
    if (error) {
      throw error;
    }
    
    return { success: true, data };
  } catch (error) {
    console.error('Error fixing workflow save:', error);
    return { success: false, error };
  }
}

/**
 * Create a properly structured workflow
 */
export async function createProperWorkflow(workflowData: any) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    
    // Extract steps
    const steps = workflowData.template_config?.steps || workflowData.steps || [];
    const triggerStep = steps.find((s: any) => s.type === 'trigger');
    const actionSteps = steps.filter((s: any) => s.type === 'action');
    
    // Validate
    if (!triggerStep) {
      throw new Error('Workflow must have a trigger');
    }
    
    if (actionSteps.length === 0) {
      throw new Error('Workflow must have at least one action');
    }
    
    // Build workflow
    const workflow = {
      user_id: user.id,
      name: workflowData.name,
      description: workflowData.description || '',
      trigger_type: triggerStep.subType || triggerStep.config?.triggerType,
      trigger_config: {
        triggerType: triggerStep.subType || triggerStep.config?.triggerType,
        conditions: triggerStep.config?.conditions || []
      },
      steps: actionSteps,
      template_config: {
        steps: steps // Keep all steps for the builder
      },
      status: 'active',
      is_active: true
    };
    
    console.log('Creating workflow:', workflow);
    
    const { data, error } = await supabase
      .from('automation_workflows')
      .insert(workflow)
      .select()
      .single();
      
    if (error) {
      throw error;
    }
    
    return { success: true, data };
  } catch (error) {
    console.error('Error creating workflow:', error);
    return { success: false, error };
  }
}

/**
 * Validate workflow has proper structure
 */
export function validateWorkflowStructure(workflow: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check basic fields
  if (!workflow.name) {
    errors.push('Workflow must have a name');
  }
  
  // Check steps
  const steps = workflow.steps || workflow.template_config?.steps || [];
  
  if (steps.length === 0) {
    errors.push('Workflow must have steps');
  }
  
  // Check for trigger
  const hasTrigger = steps.some((s: any) => s.type === 'trigger');
  if (!hasTrigger) {
    errors.push('Workflow must have a trigger');
  }
  
  // Check for actions
  const hasActions = steps.some((s: any) => s.type === 'action');
  if (!hasActions) {
    errors.push('Workflow must have at least one action');
  }
  
  // Check trigger_type
  if (!workflow.trigger_type) {
    const triggerStep = steps.find((s: any) => s.type === 'trigger');
    if (triggerStep) {
      workflow.trigger_type = triggerStep.subType || triggerStep.config?.triggerType || 'manual';
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

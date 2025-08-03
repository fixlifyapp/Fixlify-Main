import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Fix all existing workflows to have proper structure
 */
export async function fixAllWorkflowStructures() {
  try {
    console.log('🔧 Fixing workflow structures...');
    
    // Get all workflows
    const { data: workflows, error: fetchError } = await supabase
      .from('automation_workflows')
      .select('*');
      
    if (fetchError) {
      throw fetchError;
    }
    
    if (!workflows || workflows.length === 0) {
      console.log('No workflows to fix');
      return { success: true, fixed: 0 };
    }
    
    let fixed = 0;
    let failed = 0;
    
    for (const workflow of workflows) {
      try {
        let needsUpdate = false;
        const updates: any = {};
        
        // Check if steps are in template_config but not in steps column
        if ((!workflow.steps || workflow.steps.length === 0) && 
            workflow.template_config?.steps && 
            workflow.template_config.steps.length > 0) {
          
          const allSteps = workflow.template_config.steps;
          const actionSteps = allSteps.filter((s: any) => s.type === 'action');
          const triggerStep = allSteps.find((s: any) => s.type === 'trigger');
          
          if (actionSteps.length > 0) {
            updates.steps = actionSteps;
            needsUpdate = true;
          }
          
          // Update trigger type if missing
          if (!workflow.trigger_type && triggerStep) {
            updates.trigger_type = triggerStep.subType || triggerStep.config?.triggerType || 'manual';
            updates.trigger_config = {
              triggerType: updates.trigger_type,
              conditions: triggerStep.config?.conditions || []
            };
            needsUpdate = true;
          }
        }
        
        // If workflow has no steps at all, add a default email action
        if ((!workflow.steps || workflow.steps.length === 0) && 
            (!workflow.template_config?.steps || workflow.template_config.steps.length === 0)) {
          
          updates.steps = [{
            id: 'action-1',
            type: 'action',
            subType: 'email',
            name: 'Send Notification',
            config: {
              subject: 'Automation Notification',
              body: '<p>Automation triggered for {{trigger.type}}</p>',
              sendToClient: true
            }
          }];
          needsUpdate = true;
        }
        
        if (needsUpdate) {
          console.log(`Fixing workflow: ${workflow.name} (${workflow.id})`);
          
          const { error: updateError } = await supabase
            .from('automation_workflows')
            .update(updates)
            .eq('id', workflow.id);
            
          if (updateError) {
            console.error(`Failed to fix workflow ${workflow.id}:`, updateError);
            failed++;
          } else {
            fixed++;
          }
        }
      } catch (error) {
        console.error(`Error processing workflow ${workflow.id}:`, error);
        failed++;
      }
    }
    
    console.log(`✅ Fixed ${fixed} workflows, ${failed} failed`);
    
    if (fixed > 0) {
      toast.success(`Fixed ${fixed} workflow structures`);
    }
    
    return { success: true, fixed, failed };
    
  } catch (error) {
    console.error('Error fixing workflows:', error);
    toast.error('Failed to fix workflow structures');
    return { success: false, error };
  }
}

/**
 * Validate a single workflow
 */
export async function validateWorkflow(workflowId: string) {
  try {
    const { data: workflow, error } = await supabase
      .from('automation_workflows')
      .select('*')
      .eq('id', workflowId)
      .single();
      
    if (error || !workflow) {
      return { valid: false, error: 'Workflow not found' };
    }
    
    const issues: string[] = [];
    
    // Check active status
    if (!workflow.is_active) {
      issues.push('Workflow is not active');
    }
    
    if (workflow.status !== 'active') {
      issues.push('Workflow status is not active');
    }
    
    // Check steps
    if (!workflow.steps || workflow.steps.length === 0) {
      issues.push('Workflow has no action steps');
    }
    
    // Check trigger type
    if (!workflow.trigger_type) {
      issues.push('Workflow has no trigger type');
    }
    
    return {
      valid: issues.length === 0,
      issues,
      workflow
    };
    
  } catch (error) {
    console.error('Error validating workflow:', error);
    return { valid: false, error: error.message };
  }
}

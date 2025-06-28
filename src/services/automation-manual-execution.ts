import { supabase } from '@/integrations/supabase/client';
import { AutomationExecutionService } from './automation-execution-service';
import { toast } from 'sonner';

export class AutomationManualExecution {
  // Test workflow with sample data
  static async testWorkflow(workflowId: string, testData?: any) {
    try {
      // Get workflow details
      const { data: workflow, error } = await supabase
        .from('automation_workflows')
        .select('*')
        .eq('id', workflowId)
        .single();

      if (error || !workflow) {
        toast.error('Workflow not found');
        return;
      }

      // Get user ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Prepare test execution data
      const execution = {
        workflowId: workflowId,
        triggeredBy: 'manual_test',
        entityId: testData?.entityId || 'test-entity-id',
        entityType: testData?.entityType || 'job',
        context: {
          userId: user.id,
          clientId: testData?.clientId || 'test-client-id',
          testMode: true,
          ...testData
        }
      };

      toast.info('Starting workflow test...');
      
      // Execute the workflow
      await AutomationExecutionService.executeWorkflow(execution);
      
      toast.success('Workflow test completed!');
    } catch (error) {
      console.error('Workflow test failed:', error);
      toast.error('Workflow test failed');
    }
  }

  // Execute workflow for a specific entity
  static async executeForEntity(workflowId: string, entityType: string, entityId: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      let clientId = null;

      // Get client ID based on entity type
      if (entityType === 'job') {
        const { data: job } = await supabase
          .from('jobs')
          .select('client_id')
          .eq('id', entityId)
          .single();
        clientId = job?.client_id;
      } else if (entityType === 'invoice') {
        const { data: invoice } = await supabase
          .from('invoices')
          .select('client_id')
          .eq('id', entityId)
          .single();
        clientId = invoice?.client_id;
      } else if (entityType === 'client') {
        clientId = entityId;
      }

      const execution = {
        workflowId: workflowId,
        triggeredBy: 'manual',
        entityId: entityId,
        entityType: entityType,
        context: {
          userId: user.id,
          clientId: clientId
        }
      };

      toast.info('Executing workflow...');
      await AutomationExecutionService.executeWorkflow(execution);
      toast.success('Workflow executed successfully!');
    } catch (error) {
      console.error('Workflow execution failed:', error);
      toast.error('Workflow execution failed');
    }
  }
}

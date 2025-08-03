import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Test automation system without creating actual jobs
 */
export async function testAutomationSystem() {
  try {
    console.log('Testing automation system...');
    
    // 1. Check if there are active workflows
    const { data: workflows, error: workflowError } = await supabase
      .from('automation_workflows')
      .select('*')
      .eq('status', 'active')
      .eq('trigger_type', 'job_status_changed');
    
    if (workflowError) {
      console.error('Error fetching workflows:', workflowError);
      toast.error('Failed to fetch workflows');
      return;
    }
    
    if (!workflows || workflows.length === 0) {
      toast.warning('No active job status change workflows found');
      return;
    }
    
    console.log(`Found ${workflows.length} active workflows`);
    
    // 2. Create a test automation log
    const testContext = {
      triggerType: 'job_status_changed',
      testMode: true,
      jobId: 'test-job-001',
      job_id: 'test-job-001',
      userId: workflows[0].user_id,
      job: {
        id: 'test-job-001',
        title: 'Test Automation Job',
        status: 'Completed',
        oldStatus: 'In Progress',
        client_id: 'test-client',
        user_id: workflows[0].user_id
      },
      client: {
        id: 'test-client',
        firstName: 'Test',
        lastName: 'Client',
        name: 'Test Client',
        email: 'test@example.com',
        phone: '+1234567890'
      },
      company: {
        name: 'Test Company'
      }
    };
    
    // 3. Call the automation executor directly
    console.log('Executing automation workflow:', workflows[0].id);
    
    const { data, error } = await supabase.functions.invoke('automation-executor', {
      body: {
        workflowId: workflows[0].id,
        context: testContext
      }
    });
    
    if (error) {
      console.error('Automation execution error:', error);
      toast.error(`Automation failed: ${error.message}`);
      return;
    }
    
    console.log('Automation execution result:', data);
    
    if (data?.success) {
      toast.success('Automation test completed successfully!');
      
      // Check if any actions were executed
      if (data.results && data.results.length > 0) {
        const successfulActions = data.results.filter((r: any) => r.status === 'success');
        const failedActions = data.results.filter((r: any) => r.status === 'failed');
        
        if (successfulActions.length > 0) {
          toast.success(`${successfulActions.length} actions executed successfully`);
        }
        
        if (failedActions.length > 0) {
          toast.warning(`${failedActions.length} actions failed`);
        }
      }
    } else {
      toast.error('Automation test failed');
    }
    
    return data;
  } catch (error) {
    console.error('Test automation error:', error);
    toast.error('Failed to test automation system');
    throw error;
  }
}

/**
 * Clear all pending automation logs
 */
export async function clearPendingAutomations() {
  try {
    const { error } = await supabase
      .from('automation_execution_logs')
      .delete()
      .eq('status', 'pending');
    
    if (error) throw error;
    
    toast.success('Cleared all pending automations');
  } catch (error) {
    console.error('Error clearing pending automations:', error);
    toast.error('Failed to clear pending automations');
  }
}

import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface AutomationTestResult {
  success: boolean;
  message: string;
  details?: any;
}

export class AutomationTester {
  
  /**
   * Test if job status changes trigger automations correctly
   */
  static async testJobStatusAutomation(jobId: string): Promise<AutomationTestResult> {
    try {
      console.log('🧪 Testing automation for job:', jobId);
      
      // Get current job status
      const { data: job, error: jobError } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', jobId)
        .single();
        
      if (jobError || !job) {
        return {
          success: false,
          message: 'Failed to fetch job for testing'
        };
      }
      
      const originalStatus = job.status;
      const testStatus = originalStatus === 'completed' ? 'in progress' : 'completed';
      
      console.log(`🔄 Changing status from ${originalStatus} to ${testStatus}`);
      
      // Update job status to trigger automation
      const { error: updateError } = await supabase
        .from('jobs')
        .update({ 
          status: testStatus,
          updated_at: new Date().toISOString() 
        })
        .eq('id', jobId);
        
      if (updateError) {
        return {
          success: false,
          message: `Failed to update job status: ${updateError.message}`
        };
      }
      
      // Wait a moment for triggers to fire
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Check if automation log was created
      const { data: logs, error: logsError } = await supabase
        .from('automation_execution_logs')
        .select('*')
        .eq('trigger_type', 'job_status_changed')
        .contains('trigger_data', { job_id: jobId })
        .order('created_at', { ascending: false })
        .limit(5);
        
      if (logsError) {
        return {
          success: false,
          message: `Failed to check automation logs: ${logsError.message}`
        };
      }
      
      // Revert job status
      await supabase
        .from('jobs')
        .update({ 
          status: originalStatus,
          updated_at: new Date().toISOString() 
        })
        .eq('id', jobId);
      
      const foundLogs = logs?.filter(log => 
        log.trigger_data?.new_status === testStatus &&
        log.created_at > new Date(Date.now() - 10000).toISOString() // Last 10 seconds
      ) || [];
      
      if (foundLogs.length > 0) {
        return {
          success: true,
          message: `✅ Automation triggered successfully! Found ${foundLogs.length} log(s)`,
          details: foundLogs
        };
      } else {
        return {
          success: false,
          message: '❌ No automation logs found. Database trigger may not be working.',
          details: { allLogs: logs }
        };
      }
      
    } catch (error) {
      console.error('Error testing automation:', error);
      return {
        success: false,
        message: `Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
  
  /**
   * Test if automation workflows exist for the user
   */
  static async testAutomationWorkflows(): Promise<AutomationTestResult> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return {
          success: false,
          message: 'User not authenticated'
        };
      }
      
      const { data: workflows, error } = await supabase
        .from('automation_workflows')
        .select('*')
        .eq('user_id', user.id)
        .eq('trigger_type', 'job_status_changed')
        .eq('is_active', true);
        
      if (error) {
        return {
          success: false,
          message: `Failed to fetch workflows: ${error.message}`
        };
      }
      
      if (!workflows || workflows.length === 0) {
        return {
          success: false,
          message: '❌ No active job status automation workflows found. Create some first!'
        };
      }
      
      return {
        success: true,
        message: `✅ Found ${workflows.length} active automation workflow(s)`,
        details: workflows
      };
      
    } catch (error) {
      return {
        success: false,
        message: `Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
  
  /**
   * Run comprehensive automation test
   */
  static async runComprehensiveTest(jobId: string): Promise<void> {
    console.log('🧪 Running comprehensive automation test...');
    
    // Test 1: Check workflows exist
    const workflowTest = await this.testAutomationWorkflows();
    console.log('Workflow Test:', workflowTest);
    toast.info(workflowTest.message);
    
    if (!workflowTest.success) {
      return;
    }
    
    // Test 2: Test job status automation
    const statusTest = await this.testJobStatusAutomation(jobId);
    console.log('Status Test:', statusTest);
    
    if (statusTest.success) {
      toast.success(statusTest.message);
    } else {
      toast.error(statusTest.message);
    }
  }
}
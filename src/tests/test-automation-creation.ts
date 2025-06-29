import { supabase } from '@/integrations/supabase/client';

export async function testAutomationCreation() {
  console.log('🧪 Testing automation creation...');
  
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('❌ No authenticated user found');
      return;
    }
    
    console.log('✅ User authenticated:', user.email);
    
    // Get user's organization
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single();
      
    if (!profile?.organization_id) {
      console.error('❌ No organization found for user');
      return;
    }
    
    console.log('✅ Organization ID:', profile.organization_id);
    
    // Create test automation
    const testAutomation = {
      user_id: user.id,
      organization_id: profile.organization_id,
      name: 'Test Automation - Job Completed SMS',
      description: 'Send SMS when job is completed',
      status: 'active',
      category: 'jobs',
      trigger_type: 'job_completed',
      trigger_conditions: {},
      action_type: 'send_sms',
      template_config: {
        steps: [{
          id: 'step-1',
          type: 'send_sms',
          name: 'Send Completion SMS',
          icon: 'MessageSquare',
          description: 'Send SMS to customer',
          config: {
            recipient_type: 'client',
            message: 'Hi {{client_name}}, your {{service_type}} job has been completed successfully!'
          }
        }],
        enabled: true,
        timezone: 'America/New_York'
      },
      execution_count: 0,
      success_count: 0,
      enabled: true,
      is_active: true,
      workflow_type: 'simple',
      steps: [{
        id: 'step-1',
        type: 'send_sms',
        name: 'Send Completion SMS',
        config: {
          recipient_type: 'client',
          message: 'Hi {{client_name}}, your {{service_type}} job has been completed successfully!'
        }
      }],
      settings: {
        enabled: true,
        timezone: 'America/New_York'
      }
    };
    
    console.log('📝 Creating test automation...');
    
    const { data, error } = await supabase
      .from('automation_workflows')
      .insert(testAutomation)
      .select()
      .single();
      
    if (error) {
      console.error('❌ Error creating automation:', error);
      return;
    }
    
    console.log('✅ Automation created successfully:', data);
    
    // Verify it was created
    const { data: verifyData } = await supabase
      .from('automation_workflows')
      .select('*')
      .eq('id', data.id)
      .single();
      
    console.log('✅ Verification:', verifyData);
    
    // Test trigger
    console.log('🔔 Testing trigger subscription...');
    
    // Create a test job to trigger the automation
    const testJob = {
      id: `test-${Date.now()}`,
      client_id: 'test-client',
      title: 'Test Job for Automation',
      status: 'in_progress',
      user_id: user.id
    };
    
    console.log('📝 Creating test job...');
    
    const { data: jobData, error: jobError } = await supabase
      .from('jobs')
      .insert(testJob)
      .select()
      .single();
      
    if (jobError) {
      console.error('❌ Error creating test job:', jobError);
      return;
    }
    
    console.log('✅ Test job created:', jobData);
    
    // Update job status to completed to trigger automation
    setTimeout(async () => {
      console.log('🔄 Updating job status to completed...');
      
      const { error: updateError } = await supabase
        .from('jobs')
        .update({ status: 'completed' })
        .eq('id', jobData.id);
        
      if (updateError) {
        console.error('❌ Error updating job:', updateError);
        return;
      }
      
      console.log('✅ Job status updated to completed');
      
      // Check automation execution logs
      setTimeout(async () => {
        console.log('📊 Checking automation execution logs...');
        
        const { data: logs } = await supabase
          .from('automation_execution_logs')
          .select('*')
          .eq('workflow_id', data.id)
          .order('created_at', { ascending: false })
          .limit(5);
          
        console.log('📋 Execution logs:', logs);
        
        // Clean up test data
        console.log('🧹 Cleaning up test data...');
        
        await supabase.from('jobs').delete().eq('id', jobData.id);
        await supabase.from('automation_workflows').delete().eq('id', data.id);
        
        console.log('✅ Test completed and cleaned up');
      }, 3000);
    }, 2000);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Add to window for easy testing
(window as any).testAutomationCreation = testAutomationCreation;

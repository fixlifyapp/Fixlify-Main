import { supabase } from '@/integrations/supabase/client';
import { triggerTaskCreated, triggerTaskCompleted, triggerTaskStatusChanged } from '@/utils/automationTriggers';

// Test function to verify task automations
export async function testTaskAutomations() {
  console.log('🧪 Testing Task Automations...');
  
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('No authenticated user found');
      return;
    }

    // Get user's organization
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single();

    const organizationId = profile?.organization_id || user.id;
    console.log('Organization ID:', organizationId);

    // Test 1: Create a test task and trigger automation
    console.log('\n📝 Test 1: Creating test task...');
    const testTask = {
      id: 'test-task-' + Date.now(),
      description: 'Test task for automation',
      priority: 'high',
      status: 'pending',
      due_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
      assigned_to: user.id,
      client_id: 'test-client-001',
      job_id: 'test-job-001',
      created_by: user.id,
      organization_id: organizationId
    };

    // Trigger task created automation
    const createResult = await triggerTaskCreated(testTask, organizationId);
    console.log('Task created trigger result:', createResult);

    // Test 2: Change task status
    console.log('\n🔄 Test 2: Changing task status...');
    const statusChangeResult = await triggerTaskStatusChanged(
      { ...testTask, status: 'in_progress' },
      organizationId,
      'pending',
      'in_progress'
    );
    console.log('Task status change trigger result:', statusChangeResult);

    // Test 3: Complete task
    console.log('\n✅ Test 3: Completing task...');
    const completeResult = await triggerTaskCompleted(
      { ...testTask, status: 'completed', completed_at: new Date().toISOString() },
      organizationId
    );
    console.log('Task completed trigger result:', completeResult);

    // Check automation logs
    console.log('\n📊 Checking automation logs...');
    const { data: logs, error } = await supabase
      .from('automation_execution_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching logs:', error);
    } else {
      console.log('Recent automation logs:', logs);
    }

    console.log('\n✨ Task automation tests completed!');
    
  } catch (error) {
    console.error('❌ Error testing task automations:', error);
  }
}

// Function to manually test a specific task automation template
export async function testTaskAutomationTemplate(templateId: string) {
  console.log(`🧪 Testing task automation template: ${templateId}`);
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('No authenticated user found');
      return;
    }

    // Get the template
    const { data: template, error: templateError } = await supabase
      .from('automation_templates')
      .select('*')
      .eq('trigger_type', templateId)
      .single();

    if (templateError || !template) {
      console.error('Template not found:', templateError);
      return;
    }

    console.log('Found template:', template);

    // Create a test automation from the template
    const { data: automation, error: createError } = await supabase
      .from('automation_workflows')
      .insert({
        name: `Test - ${template.name}`,
        description: `Test automation for ${template.description}`,
        trigger_type: template.trigger_type,
        trigger_conditions: template.config?.conditions || {},
        actions: template.template_config?.actions || [],
        status: 'active',
        created_by: user.id
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating test automation:', createError);
      return;
    }

    console.log('Created test automation:', automation);
    
    // Clean up after 5 seconds
    setTimeout(async () => {
      const { error: deleteError } = await supabase
        .from('automation_workflows')
        .delete()
        .eq('id', automation.id);
        
      if (deleteError) {
        console.error('Error cleaning up test automation:', deleteError);
      } else {
        console.log('Test automation cleaned up successfully');
      }
    }, 5000);

  } catch (error) {
    console.error('❌ Error testing template:', error);
  }
}

// Export functions to window for easy testing in console
if (typeof window !== 'undefined') {
  (window as any).testTaskAutomations = testTaskAutomations;
  (window as any).testTaskAutomationTemplate = testTaskAutomationTemplate;
}

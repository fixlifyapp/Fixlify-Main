// Test file to verify all automation components
import { supabase } from '@/integrations/supabase/client';

// Test automation workflow creation
export async function testAutomationCreation() {
  const testWorkflow = {
    user_id: 'test-user-id',
    organization_id: 'test-org-id',
    name: 'Test Automation',
    description: 'Test automation workflow',
    status: 'active',
    trigger_type: 'job_status_to',
    trigger_conditions: [
      { field: 'status', operator: 'equals', value: 'completed' }
    ],
    action_type: 'send_sms',
    action_config: {
      message: 'Job completed: {{job_title}}'
    },
    delivery_window: {
      businessHoursOnly: true,
      allowedDays: ['mon', 'tue', 'wed', 'thu', 'fri']
    },
    multi_channel_config: {
      primaryChannel: 'sms',
      fallbackEnabled: true,
      fallbackChannel: 'email',
      fallbackDelayHours: 2
    }
  };

  try {
    const { data, error } = await supabase
      .from('automation_workflows')
      .insert(testWorkflow);
    
    if (error) {
      console.error('Error creating automation:', error);
      return false;
    }
    
    console.log('Automation created successfully:', data);
    return true;
  } catch (error) {
    console.error('Test failed:', error);
    return false;
  }
}

// Test automation trigger
export async function testAutomationTrigger() {
  // Simulate job status change
  const jobUpdate = {
    status: 'completed'
  };

  try {
    const { error } = await supabase
      .from('jobs')
      .update(jobUpdate)
      .eq('id', 'test-job-id');
    
    if (error) {
      console.error('Error updating job:', error);
      return false;
    }
    
    console.log('Job status updated, automation should trigger');
    return true;
  } catch (error) {
    console.error('Test failed:', error);
    return false;
  }
}

// Test variable replacement
export function testVariableReplacement() {
  const message = 'Hi {{client_first_name}}, your {{job_title}} is scheduled for {{scheduled_date}} at {{scheduled_time}}.';
  const context = {
    client: { name: 'John Smith' },
    job: { 
      title: 'AC Maintenance',
      scheduled_date: '2025-01-15',
      scheduled_time: '14:00'
    }
  };

  let processed = message;
  processed = processed.replace('{{client_first_name}}', context.client.name.split(' ')[0]);
  processed = processed.replace('{{job_title}}', context.job.title);
  processed = processed.replace('{{scheduled_date}}', new Date(context.job.scheduled_date).toLocaleDateString());
  processed = processed.replace('{{scheduled_time}}', new Date('2025-01-15 ' + context.job.scheduled_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

  console.log('Original:', message);
  console.log('Processed:', processed);
  
  return processed === 'Hi John, your AC Maintenance is scheduled for 1/15/2025 at 02:00 PM.';
}

// Run all tests
export async function runAllTests() {
  console.log('Running automation system tests...');
  
  const tests = [
    { name: 'Variable Replacement', fn: testVariableReplacement },
    { name: 'Automation Creation', fn: testAutomationCreation },
    { name: 'Automation Trigger', fn: testAutomationTrigger }
  ];

  for (const test of tests) {
    console.log(`\nRunning ${test.name}...`);
    const result = await test.fn();
    console.log(`${test.name}: ${result ? '✅ PASSED' : '❌ FAILED'}`);
  }
}
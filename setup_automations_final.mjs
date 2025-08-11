import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://mqppvcrlvsgrsqelglod.supabase.co";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xcHB2Y3JsdnNncnNxZWxnbG9kIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzU5MTcwNSwiZXhwIjoyMDYzMTY3NzA1fQ.eKDav8-VldSmKP_bdCP7h9w3u5kVKlAi9x79O8EC6iI";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function createAutomationWorkflows() {
  console.log('🚀 Creating Automation Workflows...\n');
  
  try {
    // Get first user ID for created_by field
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);
    
    const userId = profiles?.[0]?.id || '00000000-0000-0000-0000-000000000000';
    console.log('Using user ID:', userId);
    
    // 1. Job Completion Automation (SMS + Email)
    const completionAutomation = {
      name: 'Job Completion SMS and Email',
      description: 'Automatically send SMS and Email to client when job is completed',
      trigger_type: 'job_status_changed',
      trigger_conditions: {
        conditions: [{
          field: 'status',
          operator: 'equals',
          value: 'completed'
        }]
      },
      steps: [
        {
          id: 'send-sms',
          type: 'action',
          name: 'Send SMS',
          config: {
            actionType: 'sms',
            message: 'Hi {{client.firstName}}, your job "{{job.title}}" has been completed! Thank you for choosing our services.',
            sendTime: 'immediately'
          }
        },
        {
          id: 'send-email',
          type: 'action', 
          name: 'Send Email',
          config: {
            actionType: 'email',
            subject: 'Job Completed - {{job.title}}',
            message: `Dear {{client.firstName}},\n\nYour job "{{job.title}}" has been completed successfully.\n\nJob ID: {{job.id}}\nAddress: {{job.address}}\n\nThank you for your business!\n\nBest regards,\nYour Service Team`,
            sendTime: 'immediately'
          }
        }
      ],
      status: 'active',
      created_by: userId
    };
    
    const { data: workflow1, error: error1 } = await supabase
      .from('automation_workflows')
      .insert(completionAutomation)
      .select()
      .single();
    
    if (error1) {
      console.error('❌ Error creating completion automation:', error1.message);
    } else {
      console.log('✅ Created: Job Completion SMS and Email');
      console.log('   ID:', workflow1.id);
    }
    
    // 2. Job Scheduled Automation (SMS)
    const scheduledAutomation = {
      name: 'Job Scheduled SMS',
      description: 'Send SMS when job is scheduled',
      trigger_type: 'job_status_changed',
      trigger_conditions: {
        conditions: [{
          field: 'status',
          operator: 'equals',
          value: 'scheduled'
        }]
      },
      steps: [
        {
          id: 'send-sms',
          type: 'action',
          name: 'Send SMS',
          config: {
            actionType: 'sms',
            message: 'Hi {{client.firstName}}, your job "{{job.title}}" has been scheduled for {{job.scheduledDate}}. We\'ll notify you when we start.',
            sendTime: 'immediately'
          }
        }
      ],
      status: 'active',
      created_by: userId
    };
    
    const { data: workflow2, error: error2 } = await supabase
      .from('automation_workflows')
      .insert(scheduledAutomation)
      .select()
      .single();
    
    if (error2) {
      console.error('❌ Error creating scheduled automation:', error2.message);
    } else {
      console.log('✅ Created: Job Scheduled SMS');
      console.log('   ID:', workflow2.id);
    }
    
    // 3. Job In Progress Automation (SMS)
    const inProgressAutomation = {
      name: 'Job In Progress SMS',
      description: 'Send SMS when job starts',
      trigger_type: 'job_status_changed',
      trigger_conditions: {
        conditions: [{
          field: 'status',
          operator: 'equals',
          value: 'in_progress'
        }]
      },
      steps: [
        {
          id: 'send-sms',
          type: 'action',
          name: 'Send SMS',
          config: {
            actionType: 'sms',
            message: 'Hi {{client.firstName}}, we\'ve started working on your job "{{job.title}}". We\'ll notify you once it\'s completed.',
            sendTime: 'immediately'
          }
        }
      ],
      status: 'active',
      created_by: userId
    };
    
    const { data: workflow3, error: error3 } = await supabase
      .from('automation_workflows')
      .insert(inProgressAutomation)
      .select()
      .single();
    
    if (error3) {
      console.error('❌ Error creating in-progress automation:', error3.message);
    } else {
      console.log('✅ Created: Job In Progress SMS');
      console.log('   ID:', workflow3.id);
    }
    
    // Check all workflows
    console.log('\n📊 Verifying all automation workflows...');
    const { data: allWorkflows, error: fetchError } = await supabase
      .from('automation_workflows')
      .select('id, name, status, trigger_type')
      .order('created_at', { ascending: false });
    
    if (allWorkflows && allWorkflows.length > 0) {
      console.log('\n✅ Active Automation Workflows:');
      allWorkflows.forEach(w => {
        console.log(`   - ${w.name} (${w.status}) - Trigger: ${w.trigger_type}`);
      });
    }
    
    // Check recent automation logs
    console.log('\n📝 Checking recent automation execution logs...');
    const { data: logs } = await supabase
      .from('automation_execution_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (logs && logs.length > 0) {
      console.log('Recent automation attempts:', logs.length);
    } else {
      console.log('No automation logs yet (will appear after first job status change)');
    }
    
    console.log('\n🎉 Automation setup complete!');
    console.log('\n📋 Next steps:');
    console.log('1. Go to Jobs page');
    console.log('2. Change any job status to "completed", "scheduled", or "in_progress"');
    console.log('3. Check automation_execution_logs table for results');
    console.log('\n💡 To process pending automations manually:');
    console.log('   supabase functions invoke automation-scheduler');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

createAutomationWorkflows();
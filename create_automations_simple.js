// Simple automation creation without optional columns
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://mqppvcrlvsgrsqelglod.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xcHB2Y3JsdnNncnNxZWxnbG9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1OTE3MDUsImV4cCI6MjA2MzE2NzcwNX0.My-KiqG1bCMqzUru4m59d4v18N3WGxNoNtFPOFAmhzg";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function createAutomations() {
  console.log('🚀 Creating Job Automations...\n');
  
  try {
    // Use a default organization ID
    const orgId = 'ea22a8c8-1d45-450b-baf3-b06136ba4e74';
    
    // Define automations to create
    const automations = [
      {
        name: 'Job Completion SMS and Email',
        description: 'Send notifications when job is completed',
        trigger_type: 'job_status_changed',
        trigger_conditions: {
          conditions: [
            {
              field: 'status',
              operator: 'equals',
              value: 'completed'
            }
          ]
        },
        steps: [
          {
            id: crypto.randomUUID(),
            type: 'send_sms',
            name: 'Send Completion SMS',
            config: {
              to: '{{client.phone}}',
              message: 'Hi {{client.name}}, your job at {{job.property_address}} has been completed! Thank you for choosing our services.',
              continue_on_error: true
            }
          },
          {
            id: crypto.randomUUID(),
            type: 'send_email',
            name: 'Send Completion Email',
            config: {
              to: '{{client.email}}',
              subject: 'Job Completed - Thank You!',
              body: '<p>Dear {{client.name}},</p><p>Your job has been successfully completed.</p><p>Thank you for your business!</p>',
              continue_on_error: true
            }
          }
        ],
        status: 'active',
        organization_id: orgId,
        created_by: orgId
      },
      {
        name: 'Job Scheduled SMS',
        description: 'Notify client when job is scheduled',
        trigger_type: 'job_status_changed',
        trigger_conditions: {
          conditions: [
            {
              field: 'status',
              operator: 'equals',
              value: 'scheduled'
            }
          ]
        },
        steps: [
          {
            id: crypto.randomUUID(),
            type: 'send_sms',
            name: 'Send Scheduled SMS',
            config: {
              to: '{{client.phone}}',
              message: 'Hi {{client.name}}, your job has been scheduled. We will see you soon!',
              continue_on_error: false
            }
          }
        ],
        status: 'active',
        organization_id: orgId,
        created_by: orgId
      },
      {
        name: 'Job In Progress SMS',
        description: 'Notify when technician starts the job',
        trigger_type: 'job_status_changed',
        trigger_conditions: {
          conditions: [
            {
              field: 'status',
              operator: 'equals',
              value: 'in_progress'
            }
          ]
        },
        steps: [
          {
            id: crypto.randomUUID(),
            type: 'send_sms',
            name: 'Send In Progress SMS',
            config: {
              to: '{{client.phone}}',
              message: 'Hi {{client.name}}, our technician has arrived and started working on your job.',
              continue_on_error: false
            }
          }
        ],
        status: 'active',
        organization_id: orgId,
        created_by: orgId
      }
    ];
    
    // Create each automation
    for (const automation of automations) {
      console.log(`📝 Creating: ${automation.name}...`);
      
      // Check if already exists
      const { data: existing } = await supabase
        .from('automation_workflows')
        .select('id')
        .eq('name', automation.name)
        .single();
      
      if (existing) {
        console.log(`   ⚠️ Already exists - activating...`);
        await supabase
          .from('automation_workflows')
          .update({ status: 'active' })
          .eq('id', existing.id);
        console.log(`   ✅ Activated!`);
      } else {
        const { data, error } = await supabase
          .from('automation_workflows')
          .insert(automation)
          .select()
          .single();
        
        if (error) {
          console.error(`   ❌ Error: ${error.message}`);
        } else {
          console.log(`   ✅ Created successfully! ID: ${data.id}`);
        }
      }
    }
    
    // Verify all automations
    console.log('\n📊 Verifying automations...');
    const { data: allWorkflows } = await supabase
      .from('automation_workflows')
      .select('name, trigger_type, status')
      .eq('trigger_type', 'job_status_changed')
      .eq('status', 'active');
    
    if (allWorkflows && allWorkflows.length > 0) {
      console.log(`✅ ${allWorkflows.length} active job automations:`);
      allWorkflows.forEach(w => {
        console.log(`   ✅ ${w.name}`);
      });
    }
    
    // Check for pending automations
    console.log('\n⏳ Checking pending automations...');
    const { data: pending } = await supabase
      .from('automation_execution_logs')
      .select('id, trigger_type, status')
      .in('status', ['pending', 'running']);
    
    if (pending && pending.length > 0) {
      console.log(`Found ${pending.length} pending automations - processing...`);
      
      // Invoke scheduler
      const { data: result, error: invokeError } = await supabase.functions.invoke('automation-scheduler');
      
      if (invokeError) {
        console.log('⚠️ Could not invoke scheduler automatically');
        console.log('Run manually: supabase functions invoke automation-scheduler');
      } else {
        console.log('✅ Scheduler invoked!');
      }
    } else {
      console.log('No pending automations');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run
createAutomations().then(() => {
  console.log('\n✅ Automation setup complete!');
  console.log('\n📋 Next steps:');
  console.log('1. Go to your app and change a job status to "completed"');
  console.log('2. The automation should trigger immediately');
  console.log('3. If not, run: supabase functions invoke automation-scheduler');
  console.log('4. Check the automation_execution_logs table for details');
  process.exit(0);
}).catch(error => {
  console.error('❌ Failed:', error);
  process.exit(1);
});
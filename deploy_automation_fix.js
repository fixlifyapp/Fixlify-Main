// Deploy automation fix directly to Supabase
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const SUPABASE_URL = "https://mqppvcrlvsgrsqelglod.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xcHB2Y3JsdnNncnNxZWxnbG9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1OTE3MDUsImV4cCI6MjA2MzE2NzcwNX0.My-KiqG1bCMqzUru4m59d4v18N3WGxNoNtFPOFAmhzg";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function deployAutomationFix() {
  console.log('🚀 Deploying Automation Fix...\n');
  
  try {
    // Get organization ID
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1)
      .single();
    
    if (profileError) {
      console.error('❌ Error getting profile:', profileError);
      return;
    }
    
    const orgId = profile.id;
    console.log(`✅ Using organization ID: ${orgId}`);
    
    // Check if automation already exists
    const { data: existing, error: checkError } = await supabase
      .from('automation_workflows')
      .select('id, name')
      .eq('name', 'Job Completion Notification')
      .single();
    
    if (existing) {
      console.log(`⚠️ Automation already exists: ${existing.name} (${existing.id})`);
      console.log('   Updating to ensure it\'s active...');
      
      const { error: updateError } = await supabase
        .from('automation_workflows')
        .update({ status: 'active' })
        .eq('id', existing.id);
      
      if (updateError) {
        console.error('❌ Error updating:', updateError);
      } else {
        console.log('✅ Automation activated!');
      }
      return;
    }
    
    // Create job completion automation
    console.log('\n📝 Creating Job Completion Automation...');
    const { data: workflow, error: workflowError } = await supabase
      .from('automation_workflows')
      .insert({
        name: 'Job Completion Notification',
        description: 'Automatically send SMS and Email to client when job is completed',
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
              message: 'Hi {{client.name}}, your job at {{job.property_address}} has been completed! Thank you for choosing our services. If you have any questions, please don\'t hesitate to reach out.',
              continue_on_error: true
            }
          },
          {
            id: crypto.randomUUID(),
            type: 'send_email',
            name: 'Send Completion Email',
            config: {
              to: '{{client.email}}',
              subject: 'Job Completed - {{job.title}}',
              body: `<p>Dear {{client.name}},</p>
<p>We are pleased to inform you that your job at <strong>{{job.property_address}}</strong> has been successfully completed.</p>
<p><strong>Job Details:</strong><br>
- Job Title: {{job.title}}<br>
- Completion Date: {{job.updated_at}}<br>
- Technician: {{job.assigned_to}}</p>
<p>Thank you for choosing our services. We value your business and look forward to serving you again.</p>
<p>If you have any questions or concerns, please don't hesitate to contact us.</p>
<p>Best regards,<br>
{{company.name}}</p>`,
              continue_on_error: true
            }
          }
        ],
        status: 'active',
        organization_id: orgId,
        created_by: orgId,
        execution_count: 0,
        success_count: 0,
        multi_channel_enabled: true,
        multi_channel_config: {
          primary_channel: 'sms',
          fallback_channel: 'email',
          delay_between_channels: 30
        }
      })
      .select()
      .single();
    
    if (workflowError) {
      console.error('❌ Error creating workflow:', workflowError);
      return;
    }
    
    console.log(`✅ Created workflow: ${workflow.name} (ID: ${workflow.id})`);
    
    // Create additional workflows
    const additionalWorkflows = [
      {
        name: 'Job Scheduled Notification',
        description: 'Notify client when job is scheduled',
        trigger_status: 'scheduled',
        message: 'Hi {{client.name}}, your job at {{job.property_address}} has been scheduled for {{job.scheduled_for}}. We\'ll see you soon!'
      },
      {
        name: 'Job Started Notification',
        description: 'Notify client when technician starts the job',
        trigger_status: 'in_progress',
        message: 'Hi {{client.name}}, our technician has arrived and started working on your job at {{job.property_address}}.'
      }
    ];
    
    for (const wf of additionalWorkflows) {
      // Check if exists
      const { data: exists } = await supabase
        .from('automation_workflows')
        .select('id')
        .eq('name', wf.name)
        .single();
      
      if (!exists) {
        console.log(`\n📝 Creating ${wf.name}...`);
        const { data: created, error: createError } = await supabase
          .from('automation_workflows')
          .insert({
            name: wf.name,
            description: wf.description,
            trigger_type: 'job_status_changed',
            trigger_conditions: {
              conditions: [
                {
                  field: 'status',
                  operator: 'equals',
                  value: wf.trigger_status
                }
              ]
            },
            steps: [
              {
                id: crypto.randomUUID(),
                type: 'send_sms',
                name: `Send ${wf.trigger_status} SMS`,
                config: {
                  to: '{{client.phone}}',
                  message: wf.message,
                  continue_on_error: false
                }
              }
            ],
            status: 'active',
            organization_id: orgId,
            created_by: orgId,
            multi_channel_enabled: true
          })
          .select()
          .single();
        
        if (createError) {
          console.error(`❌ Error creating ${wf.name}:`, createError);
        } else {
          console.log(`✅ Created: ${created.name}`);
        }
      } else {
        console.log(`⚠️ ${wf.name} already exists`);
      }
    }
    
    // Test the trigger
    console.log('\n🧪 Testing automation trigger...');
    
    // Get a recent job
    const { data: testJob, error: jobError } = await supabase
      .from('jobs')
      .select('id, status, title')
      .neq('status', 'completed')
      .limit(1)
      .single();
    
    if (testJob && !jobError) {
      console.log(`   Found test job: ${testJob.title} (${testJob.id})`);
      console.log(`   Current status: ${testJob.status}`);
      console.log(`   To test: Change this job status to "completed" in the UI`);
    }
    
    // Check if scheduler is running
    console.log('\n⏰ Checking automation scheduler...');
    console.log('   Run this to process pending automations:');
    console.log('   supabase functions invoke automation-scheduler');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run deployment
deployAutomationFix().then(() => {
  console.log('\n✅ Automation deployment complete!');
  console.log('\n📋 Next steps:');
  console.log('1. Test by changing a job status to "completed"');
  console.log('2. Check automation_execution_logs table for new entries');
  console.log('3. Run: supabase functions invoke automation-scheduler');
  process.exit(0);
}).catch(error => {
  console.error('❌ Deployment failed:', error);
  process.exit(1);
});
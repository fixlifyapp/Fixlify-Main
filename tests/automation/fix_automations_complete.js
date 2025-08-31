// Complete automation fix with authentication
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://mqppvcrlvsgrsqelglod.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xcHB2Y3JsdnNncnNxZWxnbG9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1OTE3MDUsImV4cCI6MjA2MzE2NzcwNX0.My-KiqG1bCMqzUru4m59d4v18N3WGxNoNtFPOFAmhzg";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Test credentials - you'll need to update these
const TEST_EMAIL = 'admin@example.com'; // Update with your email
const TEST_PASSWORD = 'password123'; // Update with your password

async function fixAutomations() {
  console.log('🔧 Complete Automation System Fix\n');
  
  try {
    // Sign in first
    console.log('1️⃣ Authenticating...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    });
    
    if (authError) {
      console.log('⚠️ Using anon access (some features may be limited)');
      console.log('   To fully test, update TEST_EMAIL and TEST_PASSWORD in this script');
    } else {
      console.log(`✅ Authenticated as: ${authData.user.email}`);
    }
    
    // Get user/org ID
    let orgId = null;
    if (authData?.user) {
      orgId = authData.user.id;
    } else {
      // Try to get any profile ID for testing
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);
      
      if (profiles && profiles.length > 0) {
        orgId = profiles[0].id;
      }
    }
    
    if (!orgId) {
      // Generate a placeholder ID
      orgId = crypto.randomUUID();
      console.log(`⚠️ Using placeholder org ID: ${orgId}`);
    } else {
      console.log(`✅ Organization ID: ${orgId}`);
    }
    
    // Check existing automations
    console.log('\n2️⃣ Checking existing automations...');
    const { data: existing, error: existingError } = await supabase
      .from('automation_workflows')
      .select('id, name, status, trigger_type')
      .eq('trigger_type', 'job_status_changed');
    
    if (existing && existing.length > 0) {
      console.log(`✅ Found ${existing.length} job status automations:`);
      existing.forEach(a => {
        console.log(`   - ${a.name} (${a.status})`);
      });
      
      // Activate any inactive ones
      const inactive = existing.filter(a => a.status !== 'active');
      if (inactive.length > 0) {
        console.log(`\n   Activating ${inactive.length} inactive automations...`);
        for (const automation of inactive) {
          await supabase
            .from('automation_workflows')
            .update({ status: 'active' })
            .eq('id', automation.id);
        }
        console.log('   ✅ Activated!');
      }
    } else {
      console.log('❌ No job status automations found - creating them...');
      
      // Create the main job completion automation
      const workflows = [
        {
          name: 'Job Completion Notification',
          description: 'Send SMS and Email when job is completed',
          trigger_status: 'completed',
          sms_message: 'Hi {{client.name}}, your job at {{job.property_address}} has been completed! Thank you for choosing our services.',
          email_subject: 'Job Completed - {{job.title}}',
          email_body: `<p>Dear {{client.name}},</p>
<p>Your job at <strong>{{job.property_address}}</strong> has been completed.</p>
<p>Thank you for your business!</p>`
        },
        {
          name: 'Job Scheduled Notification',
          description: 'Notify when job is scheduled',
          trigger_status: 'scheduled',
          sms_message: 'Hi {{client.name}}, your job has been scheduled. We\'ll see you soon!',
          email_subject: 'Job Scheduled',
          email_body: '<p>Your job has been scheduled.</p>'
        },
        {
          name: 'Job Started Notification',
          description: 'Notify when job starts',
          trigger_status: 'in_progress',
          sms_message: 'Hi {{client.name}}, our technician has arrived and started your job.',
          email_subject: 'Job Started',
          email_body: '<p>Work has begun on your job.</p>'
        }
      ];
      
      for (const wf of workflows) {
        console.log(`\n   Creating: ${wf.name}...`);
        
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
                name: 'Send SMS',
                config: {
                  to: '{{client.phone}}',
                  message: wf.sms_message,
                  continue_on_error: true
                }
              },
              {
                id: crypto.randomUUID(),
                type: 'send_email',
                name: 'Send Email',
                config: {
                  to: '{{client.email}}',
                  subject: wf.email_subject,
                  body: wf.email_body,
                  continue_on_error: true
                }
              }
            ],
            status: 'active',
            organization_id: orgId,
            created_by: orgId,
            multi_channel_enabled: true,
            multi_channel_config: {
              primary_channel: 'sms',
              fallback_channel: 'email',
              delay_between_channels: 30
            }
          })
          .select();
        
        if (createError) {
          console.error(`   ❌ Error: ${createError.message}`);
        } else {
          console.log(`   ✅ Created successfully!`);
        }
      }
    }
    
    // Check for recent job completions without automations
    console.log('\n3️⃣ Checking recent job completions...');
    const { data: recentJobs } = await supabase
      .from('jobs')
      .select('id, job_number, status, updated_at')
      .eq('status', 'completed')
      .order('updated_at', { ascending: false })
      .limit(5);
    
    if (recentJobs && recentJobs.length > 0) {
      console.log(`✅ Found ${recentJobs.length} recently completed jobs:`);
      recentJobs.forEach(job => {
        console.log(`   - ${job.job_number} (completed ${new Date(job.updated_at).toLocaleString()})`);
      });
    }
    
    // Check automation logs
    console.log('\n4️⃣ Checking automation execution logs...');
    const { data: logs } = await supabase
      .from('automation_execution_logs')
      .select('trigger_type, status, created_at')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (logs && logs.length > 0) {
      console.log(`✅ Recent automation executions:`);
      logs.forEach(log => {
        const icon = log.status === 'completed' ? '✅' : log.status === 'failed' ? '❌' : '⏳';
        console.log(`   ${icon} ${log.trigger_type} - ${log.status} (${new Date(log.created_at).toLocaleString()})`);
      });
    } else {
      console.log('⚠️ No recent automation executions found');
    }
    
    // Process pending automations
    console.log('\n5️⃣ Processing pending automations...');
    console.log('   Invoking automation-scheduler function...');
    
    const { data: invokeResult, error: invokeError } = await supabase.functions.invoke('automation-scheduler', {
      body: {}
    });
    
    if (invokeError) {
      console.log('   ⚠️ Could not invoke scheduler:', invokeError.message);
      console.log('   Run manually: supabase functions invoke automation-scheduler');
    } else {
      console.log('   ✅ Scheduler invoked successfully!');
      if (invokeResult) {
        console.log('   Result:', JSON.stringify(invokeResult, null, 2));
      }
    }
    
    // Final verification
    console.log('\n6️⃣ Final verification...');
    const { data: activeWorkflows } = await supabase
      .from('automation_workflows')
      .select('name, trigger_type, status')
      .eq('status', 'active')
      .eq('trigger_type', 'job_status_changed');
    
    if (activeWorkflows && activeWorkflows.length > 0) {
      console.log(`✅ ${activeWorkflows.length} active job automations ready:`);
      activeWorkflows.forEach(w => {
        console.log(`   ✅ ${w.name}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run the fix
fixAutomations().then(() => {
  console.log('\n✅ Automation fix complete!');
  console.log('\n📋 Testing instructions:');
  console.log('1. Go to Jobs page in your app');
  console.log('2. Change any job status to "completed"');
  console.log('3. Check if SMS/Email are sent');
  console.log('4. If not, run: supabase functions invoke automation-scheduler');
  console.log('5. Check automation_execution_logs table for details');
  process.exit(0);
}).catch(error => {
  console.error('❌ Failed:', error);
  process.exit(1);
});
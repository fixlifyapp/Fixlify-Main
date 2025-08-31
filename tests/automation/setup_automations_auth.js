// Setup automations with proper authentication
import { createClient } from '@supabase/supabase-js';
import readline from 'readline';

const SUPABASE_URL = "https://mqppvcrlvsgrsqelglod.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xcHB2Y3JsdnNncnNxZWxnbG9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1OTE3MDUsImV4cCI6MjA2MzE2NzcwNX0.My-KiqG1bCMqzUru4m59d4v18N3WGxNoNtFPOFAmhzg";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function setupAutomations() {
  console.log('🔧 Fixlify Automation Setup\n');
  
  try {
    // Get credentials
    console.log('Please enter your Fixlify login credentials:');
    const email = await question('Email: ');
    const password = await question('Password: ');
    
    console.log('\n🔑 Authenticating...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (authError) {
      console.error('❌ Authentication failed:', authError.message);
      console.log('\nTrying alternative approach...');
      
      // Alternative: Create via SQL
      console.log('\n📋 Generated SQL for manual execution:');
      console.log('Copy and paste this into Supabase SQL Editor:\n');
      
      const sql = `
-- Create Job Automation Workflows
-- Run this in Supabase SQL Editor

DO $$
DECLARE
    org_id UUID;
BEGIN
    -- Get any organization ID from profiles
    SELECT id INTO org_id FROM profiles LIMIT 1;
    
    -- Create Job Completion Automation
    INSERT INTO automation_workflows (
        name, description, trigger_type, trigger_conditions, steps, status, 
        organization_id, created_by
    ) VALUES (
        'Job Completion SMS and Email',
        'Send notifications when job is completed',
        'job_status_changed',
        '{"conditions": [{"field": "status", "operator": "equals", "value": "completed"}]}'::jsonb,
        '[
            {
                "id": "' || gen_random_uuid() || '",
                "type": "send_sms",
                "name": "Send Completion SMS",
                "config": {
                    "to": "{{client.phone}}",
                    "message": "Hi {{client.name}}, your job at {{job.property_address}} has been completed! Thank you for choosing our services.",
                    "continue_on_error": true
                }
            },
            {
                "id": "' || gen_random_uuid() || '",
                "type": "send_email",
                "name": "Send Completion Email",
                "config": {
                    "to": "{{client.email}}",
                    "subject": "Job Completed - Thank You!",
                    "body": "<p>Dear {{client.name}},</p><p>Your job has been successfully completed.</p><p>Thank you for your business!</p>",
                    "continue_on_error": true
                }
            }
        ]'::jsonb,
        'active',
        org_id,
        org_id
    ) ON CONFLICT (name) DO UPDATE SET status = 'active';
    
    -- Create Job Scheduled Automation
    INSERT INTO automation_workflows (
        name, description, trigger_type, trigger_conditions, steps, status,
        organization_id, created_by
    ) VALUES (
        'Job Scheduled SMS',
        'Notify client when job is scheduled',
        'job_status_changed',
        '{"conditions": [{"field": "status", "operator": "equals", "value": "scheduled"}]}'::jsonb,
        '[
            {
                "id": "' || gen_random_uuid() || '",
                "type": "send_sms",
                "name": "Send Scheduled SMS",
                "config": {
                    "to": "{{client.phone}}",
                    "message": "Hi {{client.name}}, your job has been scheduled. We will see you soon!",
                    "continue_on_error": false
                }
            }
        ]'::jsonb,
        'active',
        org_id,
        org_id
    ) ON CONFLICT (name) DO UPDATE SET status = 'active';
    
    -- Create Job In Progress Automation
    INSERT INTO automation_workflows (
        name, description, trigger_type, trigger_conditions, steps, status,
        organization_id, created_by
    ) VALUES (
        'Job In Progress SMS',
        'Notify when technician starts the job',
        'job_status_changed',
        '{"conditions": [{"field": "status", "operator": "equals", "value": "in_progress"}]}'::jsonb,
        '[
            {
                "id": "' || gen_random_uuid() || '",
                "type": "send_sms",
                "name": "Send In Progress SMS",
                "config": {
                    "to": "{{client.phone}}",
                    "message": "Hi {{client.name}}, our technician has arrived and started working on your job.",
                    "continue_on_error": false
                }
            }
        ]'::jsonb,
        'active',
        org_id,
        org_id
    ) ON CONFLICT (name) DO UPDATE SET status = 'active';
    
    RAISE NOTICE 'Automations created successfully!';
END $$;

-- Verify the automations were created
SELECT name, trigger_type, status 
FROM automation_workflows 
WHERE trigger_type = 'job_status_changed' 
AND status = 'active';

-- Process any pending automations
SELECT net.http_post(
    url := 'https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/automation-scheduler',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := '{}'::jsonb
);
      `;
      
      console.log(sql);
      console.log('\n✅ Copy the SQL above and run it in your Supabase Dashboard');
      rl.close();
      return;
    }
    
    console.log(`✅ Authenticated as: ${authData.user.email}`);
    const orgId = authData.user.id;
    
    // Create automations
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
    
    console.log('\n📝 Creating automations...');
    for (const automation of automations) {
      console.log(`   Creating: ${automation.name}...`);
      
      const { data, error } = await supabase
        .from('automation_workflows')
        .upsert(automation, { onConflict: 'name' })
        .select()
        .single();
      
      if (error) {
        console.error(`   ❌ Error: ${error.message}`);
      } else {
        console.log(`   ✅ Success! ID: ${data.id}`);
      }
    }
    
    // Invoke scheduler
    console.log('\n⚡ Processing automations...');
    const { data: result } = await supabase.functions.invoke('automation-scheduler');
    console.log('✅ Scheduler invoked!');
    
    // Verify
    const { data: workflows } = await supabase
      .from('automation_workflows')
      .select('name, status')
      .eq('trigger_type', 'job_status_changed')
      .eq('status', 'active');
    
    console.log(`\n✅ ${workflows?.length || 0} active automations ready!`);
    workflows?.forEach(w => console.log(`   ✅ ${w.name}`));
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    rl.close();
  }
}

setupAutomations().then(() => {
  console.log('\n✅ Setup complete!');
  console.log('Test by changing a job status to "completed"');
  process.exit(0);
}).catch(error => {
  console.error('❌ Failed:', error);
  process.exit(1);
});
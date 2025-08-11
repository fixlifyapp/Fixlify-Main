// Run SQL script directly to create automations
// This will be executed in the Supabase SQL Editor

console.log(`
=====================================
AUTOMATION FIX - COPY THIS SQL
=====================================

Copy the entire SQL below and run it in your Supabase Dashboard:

1. Go to: https://supabase.com/dashboard/project/mqppvcrlvsgrsqelglod/sql/new
2. Paste the SQL below
3. Click "Run" button
4. Your automations will be created!

=====================================
SQL TO COPY:
=====================================
`);

const sql = `
-- Create Job Automation Workflows
-- This will create the missing automation workflows for job status changes

DO $$
DECLARE
    user_id UUID;
    workflow_id UUID;
BEGIN
    -- Get first user ID or use default
    SELECT id INTO user_id FROM profiles LIMIT 1;
    IF user_id IS NULL THEN
        user_id := '00000000-0000-0000-0000-000000000000'::uuid;
    END IF;
    
    -- Delete any existing job status automations to avoid duplicates
    DELETE FROM automation_workflows 
    WHERE name IN (
        'Job Completion SMS and Email',
        'Job Scheduled SMS',
        'Job In Progress SMS'
    );
    
    -- 1. CREATE JOB COMPLETION AUTOMATION (SMS + Email)
    INSERT INTO automation_workflows (
        id,
        name,
        description,
        trigger_type,
        trigger_conditions,
        steps,
        status,
        created_by,
        created_at,
        updated_at
    ) VALUES (
        gen_random_uuid(),
        'Job Completion SMS and Email',
        'Automatically send SMS and Email when job is completed',
        'job_status_changed',
        jsonb_build_object(
            'conditions', jsonb_build_array(
                jsonb_build_object(
                    'field', 'status',
                    'operator', 'equals',
                    'value', 'completed'
                )
            )
        ),
        jsonb_build_array(
            jsonb_build_object(
                'id', 'send-sms',
                'type', 'action',
                'name', 'Send SMS',
                'config', jsonb_build_object(
                    'actionType', 'sms',
                    'message', 'Hi {{client.firstName}}, your job "{{job.title}}" has been completed! Thank you for choosing our services.',
                    'sendTime', 'immediately'
                )
            ),
            jsonb_build_object(
                'id', 'send-email',
                'type', 'action',
                'name', 'Send Email',
                'config', jsonb_build_object(
                    'actionType', 'email',
                    'subject', 'Job Completed - {{job.title}}',
                    'message', E'Dear {{client.firstName}},\\n\\nYour job "{{job.title}}" has been completed successfully.\\n\\nJob ID: {{job.id}}\\nAddress: {{job.address}}\\n\\nThank you!\\n\\nBest regards,\\nYour Service Team',
                    'sendTime', 'immediately'
                )
            )
        ),
        'active',
        user_id,
        NOW(),
        NOW()
    );
    
    -- 2. CREATE JOB SCHEDULED AUTOMATION (SMS)
    INSERT INTO automation_workflows (
        id,
        name,
        description,
        trigger_type,
        trigger_conditions,
        steps,
        status,
        created_by,
        created_at,
        updated_at
    ) VALUES (
        gen_random_uuid(),
        'Job Scheduled SMS',
        'Send SMS when job is scheduled',
        'job_status_changed',
        jsonb_build_object(
            'conditions', jsonb_build_array(
                jsonb_build_object(
                    'field', 'status',
                    'operator', 'equals',
                    'value', 'scheduled'
                )
            )
        ),
        jsonb_build_array(
            jsonb_build_object(
                'id', 'send-sms',
                'type', 'action',
                'name', 'Send SMS',
                'config', jsonb_build_object(
                    'actionType', 'sms',
                    'message', 'Hi {{client.firstName}}, your job "{{job.title}}" has been scheduled. We will notify you when we start.',
                    'sendTime', 'immediately'
                )
            )
        ),
        'active',
        user_id,
        NOW(),
        NOW()
    );
    
    -- 3. CREATE JOB IN PROGRESS AUTOMATION (SMS)
    INSERT INTO automation_workflows (
        id,
        name,
        description,
        trigger_type,
        trigger_conditions,
        steps,
        status,
        created_by,
        created_at,
        updated_at
    ) VALUES (
        gen_random_uuid(),
        'Job In Progress SMS',
        'Send SMS when job starts',
        'job_status_changed',
        jsonb_build_object(
            'conditions', jsonb_build_array(
                jsonb_build_object(
                    'field', 'status',
                    'operator', 'equals',
                    'value', 'in_progress'
                )
            )
        ),
        jsonb_build_array(
            jsonb_build_object(
                'id', 'send-sms',
                'type', 'action',
                'name', 'Send SMS',
                'config', jsonb_build_object(
                    'actionType', 'sms',
                    'message', 'Hi {{client.firstName}}, we have started working on your job "{{job.title}}". We will notify you once completed.',
                    'sendTime', 'immediately'
                )
            )
        ),
        'active',
        user_id,
        NOW(),
        NOW()
    );
    
    RAISE NOTICE 'Created 3 automation workflows successfully!';
END $$;

-- Verify the automations were created
SELECT 
    id,
    name,
    status,
    trigger_type,
    jsonb_pretty(trigger_conditions) as conditions
FROM automation_workflows
WHERE trigger_type = 'job_status_changed'
ORDER BY created_at DESC;

-- Check if there are any recent automation logs
SELECT 
    id,
    workflow_id,
    status,
    error,
    created_at
FROM automation_execution_logs
ORDER BY created_at DESC
LIMIT 10;
`;

console.log(sql);

console.log(`
=====================================
AFTER RUNNING THE SQL:
=====================================

1. You should see 3 new automation workflows created
2. Test by changing a job status to "completed"
3. Check automation_execution_logs table for results

If automations don't trigger automatically, run:
  supabase functions invoke automation-scheduler

=====================================
`);

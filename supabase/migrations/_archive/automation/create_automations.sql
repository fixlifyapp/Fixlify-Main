-- ============================================
-- CREATE JOB AUTOMATION WORKFLOWS
-- Run this in Supabase SQL Editor (Dashboard)
-- ============================================

DO $$
DECLARE
    org_id UUID;
    workflow_id UUID;
BEGIN
    -- Get the first organization ID from profiles
    SELECT id INTO org_id FROM profiles LIMIT 1;
    
    IF org_id IS NULL THEN
        -- If no profiles exist, create a default org ID
        org_id := gen_random_uuid();
        RAISE NOTICE 'No profiles found, using generated org_id: %', org_id;
    ELSE
        RAISE NOTICE 'Using organization_id: %', org_id;
    END IF;
    
    -- =========================================
    -- 1. JOB COMPLETION AUTOMATION
    -- =========================================
    INSERT INTO automation_workflows (
        id,
        name,
        description,
        trigger_type,
        trigger_conditions,
        steps,
        status,
        organization_id,
        created_by,
        created_at,
        updated_at
    ) VALUES (
        gen_random_uuid(),
        'Job Completion SMS and Email',
        'Automatically send SMS and Email to client when job is completed',
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
                'id', gen_random_uuid()::text,
                'type', 'send_sms',
                'name', 'Send Completion SMS',
                'config', jsonb_build_object(
                    'to', '{{client.phone}}',
                    'message', 'Hi {{client.name}}, your job at {{job.property_address}} has been completed! Thank you for choosing our services. If you have any questions, please don''t hesitate to reach out.',
                    'continue_on_error', true
                )
            ),
            jsonb_build_object(
                'id', gen_random_uuid()::text,
                'type', 'send_email',
                'name', 'Send Completion Email',
                'config', jsonb_build_object(
                    'to', '{{client.email}}',
                    'subject', 'Job Completed - Thank You!',
                    'body', '<h2>Job Completion Notice</h2><p>Dear {{client.name}},</p><p>We are pleased to inform you that your job at <strong>{{job.property_address}}</strong> has been successfully completed.</p><p><strong>Job Details:</strong></p><ul><li>Job Title: {{job.title}}</li><li>Completion Date: {{job.updated_at}}</li></ul><p>Thank you for choosing our services. We value your business and look forward to serving you again.</p><p>Best regards,<br>Your Service Team</p>',
                    'continue_on_error', true
                )
            )
        ),
        'active',
        org_id,
        org_id,
        NOW(),
        NOW()
    ) ON CONFLICT (name) 
    DO UPDATE SET 
        status = 'active',
        updated_at = NOW()
    RETURNING id INTO workflow_id;
    
    RAISE NOTICE 'Created/Updated Job Completion workflow: %', workflow_id;
    
    -- =========================================
    -- 2. JOB SCHEDULED AUTOMATION
    -- =========================================
    INSERT INTO automation_workflows (
        id,
        name,
        description,
        trigger_type,
        trigger_conditions,
        steps,
        status,
        organization_id,
        created_by,
        created_at,
        updated_at
    ) VALUES (
        gen_random_uuid(),
        'Job Scheduled SMS',
        'Notify client when job is scheduled',
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
                'id', gen_random_uuid()::text,
                'type', 'send_sms',
                'name', 'Send Scheduled SMS',
                'config', jsonb_build_object(
                    'to', '{{client.phone}}',
                    'message', 'Hi {{client.name}}, your job at {{job.property_address}} has been scheduled. We will see you soon!',
                    'continue_on_error', false
                )
            )
        ),
        'active',
        org_id,
        org_id,
        NOW(),
        NOW()
    ) ON CONFLICT (name) 
    DO UPDATE SET 
        status = 'active',
        updated_at = NOW()
    RETURNING id INTO workflow_id;
    
    RAISE NOTICE 'Created/Updated Job Scheduled workflow: %', workflow_id;
    
    -- =========================================
    -- 3. JOB IN PROGRESS AUTOMATION
    -- =========================================
    INSERT INTO automation_workflows (
        id,
        name,
        description,
        trigger_type,
        trigger_conditions,
        steps,
        status,
        organization_id,
        created_by,
        created_at,
        updated_at
    ) VALUES (
        gen_random_uuid(),
        'Job In Progress SMS',
        'Notify when technician starts the job',
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
                'id', gen_random_uuid()::text,
                'type', 'send_sms',
                'name', 'Send In Progress SMS',
                'config', jsonb_build_object(
                    'to', '{{client.phone}}',
                    'message', 'Hi {{client.name}}, our technician has arrived and started working on your job at {{job.property_address}}.',
                    'continue_on_error', false
                )
            )
        ),
        'active',
        org_id,
        org_id,
        NOW(),
        NOW()
    ) ON CONFLICT (name) 
    DO UPDATE SET 
        status = 'active',
        updated_at = NOW()
    RETURNING id INTO workflow_id;
    
    RAISE NOTICE 'Created/Updated Job In Progress workflow: %', workflow_id;
    
END $$;

-- =========================================
-- VERIFY AUTOMATIONS WERE CREATED
-- =========================================
SELECT 
    name,
    trigger_type,
    status,
    jsonb_pretty(trigger_conditions) as conditions,
    array_length(steps::jsonb, 1) as step_count
FROM automation_workflows 
WHERE trigger_type = 'job_status_changed' 
AND status = 'active'
ORDER BY created_at DESC;

-- =========================================
-- CHECK FOR RECENT JOB STATUS CHANGES
-- =========================================
SELECT 
    j.job_number,
    j.status,
    j.updated_at,
    c.name as client_name,
    c.phone as client_phone
FROM jobs j
LEFT JOIN clients c ON j.client_id = c.id
WHERE j.updated_at > NOW() - INTERVAL '24 hours'
ORDER BY j.updated_at DESC
LIMIT 5;

-- =========================================
-- CHECK AUTOMATION EXECUTION LOGS
-- =========================================
SELECT 
    trigger_type,
    status,
    created_at,
    CASE 
        WHEN error IS NOT NULL THEN jsonb_pretty(error)
        ELSE 'No errors'
    END as error_details
FROM automation_execution_logs
ORDER BY created_at DESC
LIMIT 10;

-- =========================================
-- MANUALLY TRIGGER SCHEDULER (OPTIONAL)
-- =========================================
-- Uncomment to process pending automations
/*
SELECT net.http_post(
    url := 'https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/automation-scheduler',
    headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('request.jwt.claims')::json->>'sub'
    ),
    body := '{}'::jsonb
);
*/

-- =========================================
-- SUCCESS MESSAGE
-- =========================================
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '✅ AUTOMATION SETUP COMPLETE!';
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Go to Jobs page and change a job status to "completed"';
    RAISE NOTICE '2. Check automation_execution_logs table for new entries';
    RAISE NOTICE '3. If needed, run: supabase functions invoke automation-scheduler';
    RAISE NOTICE '';
END $$;
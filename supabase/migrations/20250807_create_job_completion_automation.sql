-- Migration: Create job completion automation workflow
-- This creates an automation that sends SMS and Email when a job is marked as completed

-- First, ensure we have the necessary functions
CREATE OR REPLACE FUNCTION create_job_completion_automation()
RETURNS void AS $$
DECLARE
    workflow_id UUID;
    org_id UUID;
BEGIN
    -- Get the first organization ID (you may need to adjust this for multi-tenant)
    SELECT id INTO org_id FROM profiles LIMIT 1;
    
    -- Create the workflow
    INSERT INTO automation_workflows (
        name,
        description,
        trigger_type,
        trigger_conditions,
        steps,
        status,
        organization_id,
        created_by,
        execution_count,
        success_count,
        multi_channel_enabled,
        multi_channel_config
    ) VALUES (
        'Job Completion Notification',
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
            -- SMS Step
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
            -- Email Step
            jsonb_build_object(
                'id', gen_random_uuid()::text,
                'type', 'send_email',
                'name', 'Send Completion Email',
                'config', jsonb_build_object(
                    'to', '{{client.email}}',
                    'subject', 'Job Completed - {{job.title}}',
                    'body', E'<p>Dear {{client.name}},</p>\n<p>We are pleased to inform you that your job at <strong>{{job.property_address}}</strong> has been successfully completed.</p>\n<p><strong>Job Details:</strong><br>\n- Job Title: {{job.title}}<br>\n- Completion Date: {{job.updated_at}}<br>\n- Technician: {{job.assigned_to}}</p>\n<p>Thank you for choosing our services. We value your business and look forward to serving you again.</p>\n<p>If you have any questions or concerns, please don''t hesitate to contact us.</p>\n<p>Best regards,<br>\n{{company.name}}</p>',
                    'continue_on_error', true
                )
            )
        ),
        'active',
        org_id,
        org_id, -- created_by uses same as org_id for now
        0,
        0,
        true,
        jsonb_build_object(
            'primary_channel', 'sms',
            'fallback_channel', 'email',
            'delay_between_channels', 30
        )
    )
    RETURNING id INTO workflow_id;
    
    RAISE NOTICE 'Created job completion automation workflow with ID: %', workflow_id;
END;
$$ LANGUAGE plpgsql;

-- Execute the function to create the automation
SELECT create_job_completion_automation();

-- Drop the function as it's no longer needed
DROP FUNCTION IF EXISTS create_job_completion_automation();

-- Also create automations for other common job status changes
INSERT INTO automation_workflows (
    name,
    description,
    trigger_type,
    trigger_conditions,
    steps,
    status,
    organization_id,
    created_by,
    multi_channel_enabled
) 
SELECT 
    'Job Scheduled Notification',
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
                'message', 'Hi {{client.name}}, your job at {{job.property_address}} has been scheduled for {{job.scheduled_for}}. We''ll see you soon!',
                'continue_on_error', false
            )
        )
    ),
    'active',
    (SELECT id FROM profiles LIMIT 1),
    (SELECT id FROM profiles LIMIT 1),
    true
WHERE NOT EXISTS (
    SELECT 1 FROM automation_workflows 
    WHERE name = 'Job Scheduled Notification'
);

-- Create automation for job started
INSERT INTO automation_workflows (
    name,
    description,
    trigger_type,
    trigger_conditions,
    steps,
    status,
    organization_id,
    created_by,
    multi_channel_enabled
) 
SELECT 
    'Job Started Notification',
    'Notify client when technician starts the job',
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
            'name', 'Send Started SMS',
            'config', jsonb_build_object(
                'to', '{{client.phone}}',
                'message', 'Hi {{client.name}}, our technician has arrived and started working on your job at {{job.property_address}}.',
                'continue_on_error', false
            )
        )
    ),
    'active',
    (SELECT id FROM profiles LIMIT 1),
    (SELECT id FROM profiles LIMIT 1),
    true
WHERE NOT EXISTS (
    SELECT 1 FROM automation_workflows 
    WHERE name = 'Job Started Notification'
);

-- Ensure the trigger function is properly set up
CREATE OR REPLACE FUNCTION handle_job_automation_trigger()
RETURNS TRIGGER AS $$
BEGIN
    -- Log that trigger fired
    RAISE NOTICE 'Job automation trigger fired for job % with status %', NEW.id, NEW.status;
    
    -- Create automation log for job status changes
    IF (TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status) OR TG_OP = 'INSERT' THEN
        INSERT INTO automation_execution_logs (
            workflow_id,
            trigger_type,
            trigger_data,
            status,
            created_at
        )
        SELECT 
            aw.id,
            'job_status_changed',
            jsonb_build_object(
                'job_id', NEW.id,
                'old_status', CASE WHEN TG_OP = 'UPDATE' THEN OLD.status ELSE NULL END,
                'new_status', NEW.status,
                'job', row_to_json(NEW),
                'client_id', NEW.client_id
            ),
            'pending',
            NOW()
        FROM automation_workflows aw
        WHERE aw.trigger_type = 'job_status_changed'
          AND aw.status = 'active'
          AND (
              aw.trigger_conditions->>'conditions' IS NULL OR
              aw.trigger_conditions->'conditions' @> jsonb_build_array(
                  jsonb_build_object(
                      'field', 'status',
                      'operator', 'equals',
                      'value', NEW.status
                  )
              )
          );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Ensure trigger exists on jobs table
DROP TRIGGER IF EXISTS job_automation_trigger ON jobs;
CREATE TRIGGER job_automation_trigger
    AFTER INSERT OR UPDATE ON jobs
    FOR EACH ROW
    EXECUTE FUNCTION handle_job_automation_trigger();

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION handle_job_automation_trigger() TO authenticated;
GRANT ALL ON automation_workflows TO authenticated;
GRANT ALL ON automation_execution_logs TO authenticated;
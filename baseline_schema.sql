-- Baseline migration generated from production schema
-- Generated: 2025-12-13T18:43:47.541Z
-- Tables: 115

CREATE TABLE IF NOT EXISTS public."advanced_workflow_executions" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "workflow_id" UUID NOT NULL,
  "organization_id" UUID NOT NULL,
  "trigger_data" TEXT,
  "status" TEXT NOT NULL,
  "current_step" INTEGER,
  "execution_log" TEXT,
  "started_at" TIMESTAMPTZ,
  "completed_at" TIMESTAMPTZ,
  "error" TEXT,
  "error_step" INTEGER,
  "context_data" TEXT,
  "created_at" TIMESTAMPTZ,
  "updated_at" TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public."advanced_workflow_templates" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "category" TEXT,
  "workflow_config" TEXT NOT NULL,
  "created_by" UUID,
  "organization_id" UUID,
  "is_public" BOOLEAN,
  "usage_count" INTEGER,
  "created_at" TIMESTAMPTZ,
  "updated_at" TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public."advanced_workflows" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "trigger_config" TEXT NOT NULL,
  "steps" TEXT NOT NULL,
  "settings" TEXT NOT NULL,
  "enabled" BOOLEAN,
  "organization_id" UUID NOT NULL,
  "created_by" UUID,
  "created_at" TIMESTAMPTZ,
  "updated_at" TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public."ai_agent_configs" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "user_id" UUID NOT NULL,
  "business_niche" TEXT NOT NULL,
  "diagnostic_price" NUMERIC NOT NULL,
  "emergency_surcharge" NUMERIC NOT NULL,
  "custom_prompt_additions" TEXT,
  "connect_instance_arn" TEXT,
  "aws_region" TEXT,
  "is_active" BOOLEAN,
  "created_at" TIMESTAMPTZ NOT NULL,
  "updated_at" TIMESTAMPTZ NOT NULL,
  "agent_name" TEXT,
  "voice_id" TEXT,
  "greeting_template" TEXT,
  "company_name" TEXT,
  "service_areas" TEXT,
  "business_hours" TEXT,
  "service_types" TEXT,
  "ai_assistant_id" TEXT,
  "base_prompt" TEXT,
  "telnyx_assistant_config" TEXT
);

CREATE TABLE IF NOT EXISTS public."ai_assistant_templates" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "base_prompt" TEXT NOT NULL,
  "variables" TEXT,
  "category" TEXT,
  "is_default" BOOLEAN,
  "created_at" TIMESTAMPTZ,
  "updated_at" TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public."ai_call_logs" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "user_id" UUID,
  "client_id" TEXT,
  "phone_number" TEXT,
  "ai_agent" TEXT,
  "duration" INTEGER,
  "success" BOOLEAN,
  "transcript" TEXT,
  "sentiment" TEXT,
  "action_taken" TEXT,
  "metadata" TEXT,
  "started_at" TIMESTAMPTZ,
  "ended_at" TIMESTAMPTZ,
  "created_at" TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public."ai_dispatcher_call_logs" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "phone_number_id" UUID NOT NULL,
  "contact_id" TEXT,
  "client_phone" TEXT NOT NULL,
  "call_duration" INTEGER,
  "call_status" TEXT NOT NULL,
  "resolution_type" TEXT,
  "appointment_scheduled" BOOLEAN,
  "appointment_data" TEXT,
  "customer_satisfaction_score" INTEGER,
  "ai_transcript" TEXT,
  "call_summary" TEXT,
  "started_at" TIMESTAMPTZ NOT NULL,
  "ended_at" TIMESTAMPTZ,
  "created_at" TIMESTAMPTZ NOT NULL,
  "customer_intent" TEXT,
  "successful_resolution" BOOLEAN,
  "customer_phone" TEXT,
  "call_started_at" TIMESTAMPTZ,
  "connect_contact_id" TEXT,
  "connect_instance_id" TEXT
);

CREATE TABLE IF NOT EXISTS public."ai_dispatcher_configs" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "phone_number_id" UUID NOT NULL,
  "business_name" TEXT NOT NULL,
  "business_type" TEXT NOT NULL,
  "business_greeting" TEXT,
  "diagnostic_fee" NUMERIC,
  "emergency_surcharge" NUMERIC,
  "hourly_rate" NUMERIC,
  "voice_selection" TEXT,
  "emergency_detection_enabled" BOOLEAN,
  "created_at" TIMESTAMPTZ NOT NULL,
  "updated_at" TIMESTAMPTZ NOT NULL,
  "user_id" UUID,
  "agent_name" TEXT,
  "company_name" TEXT,
  "hours_of_operation" TEXT,
  "services_offered" TEXT,
  "greeting_message" TEXT,
  "agent_personality" TEXT,
  "call_transfer_message" TEXT,
  "voicemail_detection_message" TEXT,
  "instructions" TEXT,
  "dynamic_variables" TEXT,
  "assistant_id" TEXT,
  "webhook_url" TEXT,
  "telnyx_config" TEXT,
  "capabilities" TEXT,
  "service_area" TEXT,
  "payment_methods" TEXT,
  "warranty_info" TEXT,
  "scheduling_rules" TEXT,
  "emergency_hours" TEXT,
  "business_niche" TEXT,
  "additional_info" TEXT,
  "ai_capabilities" TEXT
);

CREATE TABLE IF NOT EXISTS public."ai_recommendations" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "user_id" UUID NOT NULL,
  "recommendation_type" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "context" TEXT,
  "shown_at" TIMESTAMPTZ NOT NULL,
  "feedback" TEXT,
  "is_helpful" BOOLEAN,
  "action_taken" BOOLEAN,
  "created_at" TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS public."appointment_slots" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "date" DATE NOT NULL,
  "time" TEXT NOT NULL,
  "technician_id" UUID,
  "is_available" BOOLEAN,
  "created_by" UUID,
  "created_at" TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public."appointments" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "customer_name" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "appointment_date" DATE NOT NULL,
  "appointment_time" TEXT NOT NULL,
  "device_type" TEXT,
  "issue_description" TEXT,
  "status" TEXT,
  "created_by" TEXT,
  "created_at" TIMESTAMPTZ,
  "updated_at" TIMESTAMPTZ,
  "conversation_id" TEXT,
  "customer_phone" TEXT,
  "service_type" TEXT,
  "notes" TEXT,
  "client_id" TEXT,
  "scheduled_date" TIMESTAMPTZ,
  "source" TEXT,
  "created_via" TEXT
);

CREATE TABLE IF NOT EXISTS public."auth_rate_limits" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "identifier" TEXT NOT NULL,
  "attempt_type" TEXT NOT NULL,
  "attempts" INTEGER,
  "blocked_until" TIMESTAMPTZ,
  "created_at" TIMESTAMPTZ,
  "updated_at" TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public."automation_actions" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "automation_id" UUID,
  "action_type" TEXT NOT NULL,
  "action_config" TEXT,
  "delay_minutes" INTEGER,
  "order_index" INTEGER,
  "created_at" TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public."automation_analytics" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "workflow_id" UUID,
  "date" DATE NOT NULL,
  "execution_count" INTEGER,
  "success_count" INTEGER,
  "failure_count" INTEGER,
  "success_rate" NUMERIC,
  "avg_execution_time" NUMERIC,
  "total_execution_time" NUMERIC,
  "revenue_impact" NUMERIC,
  "created_at" TIMESTAMPTZ,
  "updated_at" TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public."automation_conditions" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "automation_id" UUID,
  "field_name" TEXT NOT NULL,
  "operator" TEXT NOT NULL,
  "value" TEXT,
  "condition_group" INTEGER,
  "created_at" TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public."automation_cron_status" (
  "job_name" TEXT,
  "schedule" TEXT,
  "is_active" BOOLEAN,
  "last_run" TIMESTAMPTZ,
  "last_run_ended" TIMESTAMPTZ,
  "total_runs" BIGINT,
  "successful_runs" BIGINT,
  "failed_runs" BIGINT,
  "success_rate" NUMERIC
);

CREATE TABLE IF NOT EXISTS public."automation_deduplication" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "workflow_id" UUID NOT NULL,
  "job_id" TEXT NOT NULL,
  "new_status" TEXT NOT NULL,
  "execution_hash" TEXT NOT NULL,
  "created_at" TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public."automation_execution_logs" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "automation_id" UUID,
  "organization_id" UUID,
  "trigger_type" TEXT NOT NULL,
  "trigger_data" TEXT,
  "actions_executed" TEXT,
  "status" TEXT NOT NULL,
  "error_message" TEXT,
  "started_at" TIMESTAMPTZ,
  "completed_at" TIMESTAMPTZ,
  "created_at" TIMESTAMPTZ,
  "workflow_id" UUID,
  "details" TEXT,
  "weather_conditions" TEXT,
  "location_used" TEXT,
  "trigger_matched_conditions" TEXT,
  "paused_at" TIMESTAMPTZ,
  "resume_at" TIMESTAMPTZ,
  "execution_time_ms" INTEGER
);

CREATE TABLE IF NOT EXISTS public."automation_execution_tracker" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "workflow_id" UUID NOT NULL,
  "job_id" TEXT NOT NULL,
  "status_change" TEXT NOT NULL,
  "execution_minute" TIMESTAMPTZ NOT NULL,
  "created_at" TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public."automation_health" (
  "completed_last_hour" BIGINT,
  "failed_last_hour" BIGINT,
  "currently_pending" BIGINT,
  "currently_processing" BIGINT,
  "last_successful_at" TIMESTAMPTZ,
  "last_failed_at" TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public."automation_history" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "workflow_id" UUID NOT NULL,
  "trigger_id" UUID,
  "execution_status" TEXT,
  "execution_time_ms" INTEGER,
  "error_details" TEXT,
  "variables_used" TEXT,
  "actions_executed" TEXT,
  "created_at" TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public."automation_performance" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "automation_id" UUID,
  "date" DATE NOT NULL,
  "triggers_fired" INTEGER,
  "actions_executed" INTEGER,
  "success_rate" NUMERIC,
  "engagement_rate" NUMERIC,
  "created_at" TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS public."automation_runs" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "automation_id" UUID,
  "trigger_data" TEXT,
  "status" TEXT NOT NULL,
  "started_at" TIMESTAMPTZ NOT NULL,
  "completed_at" TIMESTAMPTZ,
  "error_message" TEXT,
  "actions_executed" INTEGER,
  "context_data" TEXT
);

CREATE TABLE IF NOT EXISTS public."automation_schedules" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "workflow_id" UUID,
  "cron_expression" TEXT NOT NULL,
  "cron_job_name" TEXT,
  "is_active" BOOLEAN,
  "last_run" TIMESTAMPTZ,
  "next_run" TIMESTAMPTZ,
  "metadata" TEXT,
  "created_at" TIMESTAMPTZ,
  "updated_at" TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public."automation_system_health" (
  "pending_count" BIGINT,
  "running_count" BIGINT,
  "completed_last_hour" BIGINT,
  "failed_last_hour" BIGINT,
  "last_success" TIMESTAMPTZ,
  "last_failure" TIMESTAMPTZ,
  "active_workflows" BIGINT
);

CREATE TABLE IF NOT EXISTS public."automation_template_usage" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "template_id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "used_at" TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public."automation_templates" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "organization_id" UUID,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "category" TEXT NOT NULL,
  "trigger_type" TEXT NOT NULL,
  "action_type" TEXT NOT NULL,
  "is_active" BOOLEAN,
  "is_system" BOOLEAN,
  "badge" TEXT,
  "estimated_time" TEXT,
  "config" TEXT,
  "created_at" TIMESTAMPTZ,
  "updated_at" TIMESTAMPTZ,
  "icon" TEXT,
  "preview_image_url" TEXT,
  "template_config" TEXT NOT NULL,
  "usage_count" INTEGER,
  "is_featured" BOOLEAN,
  "success_rate" NUMERIC,
  "average_revenue" NUMERIC,
  "estimated_time_saved" TEXT,
  "required_integrations" JSONB,
  "tags" JSONB
);

CREATE TABLE IF NOT EXISTS public."automation_trigger_queue" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "table_name" TEXT NOT NULL,
  "event_type" TEXT NOT NULL,
  "record_data" TEXT NOT NULL,
  "old_record_data" TEXT,
  "processed" BOOLEAN,
  "processed_at" TIMESTAMPTZ,
  "created_at" TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public."automation_triggers" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "automation_id" UUID,
  "trigger_type" TEXT NOT NULL,
  "trigger_config" TEXT,
  "conditions" TEXT,
  "created_at" TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public."automation_variables" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "name" TEXT NOT NULL,
  "variable_key" TEXT NOT NULL,
  "description" TEXT,
  "data_source" TEXT,
  "field_path" TEXT,
  "created_at" TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS public."automation_workflow_status" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "name" TEXT,
  "trigger_type" TEXT,
  "is_active" BOOLEAN,
  "status" TEXT,
  "step_count" INTEGER,
  "execution_status" TEXT,
  "execution_count" INTEGER,
  "last_triggered_at" TIMESTAMPTZ,
  "pending_executions" BIGINT,
  "created_at" TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public."automation_workflows" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "user_id" UUID NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "status" TEXT,
  "category" TEXT,
  "template_id" UUID,
  "visual_config" TEXT,
  "performance_metrics" TEXT,
  "last_triggered_at" TIMESTAMPTZ,
  "execution_count" INTEGER,
  "success_count" INTEGER,
  "created_by" UUID,
  "created_at" TIMESTAMPTZ,
  "updated_at" TIMESTAMPTZ,
  "organization_id" UUID NOT NULL,
  "template_config" TEXT,
  "trigger_type" TEXT,
  "trigger_conditions" TEXT,
  "action_type" TEXT,
  "action_config" TEXT,
  "delivery_window" TEXT,
  "multi_channel_config" TEXT,
  "triggers" TEXT,
  "steps" TEXT,
  "settings" TEXT,
  "enabled" BOOLEAN,
  "workflow_type" TEXT,
  "last_executed_at" TIMESTAMPTZ,
  "nodes" TEXT,
  "edges" TEXT,
  "is_active" BOOLEAN,
  "workflow_config" TEXT,
  "trigger_config" TEXT
);

CREATE TABLE IF NOT EXISTS public."automations" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "organization_id" UUID,
  "template_id" UUID,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "category" TEXT NOT NULL,
  "is_active" BOOLEAN,
  "is_paused" BOOLEAN,
  "created_by" UUID,
  "created_at" TIMESTAMPTZ,
  "updated_at" TIMESTAMPTZ,
  "last_triggered_at" TIMESTAMPTZ,
  "trigger_count" INTEGER,
  "success_count" INTEGER,
  "failure_count" INTEGER
);

CREATE TABLE IF NOT EXISTS public."available_phone_numbers" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "phone_number" TEXT,
  "friendly_name" TEXT,
  "country_code" TEXT,
  "region" TEXT,
  "locality" TEXT,
  "capabilities" TEXT,
  "phone_number_type" TEXT,
  "purchase_price" NUMERIC,
  "monthly_price" NUMERIC,
  "status" TEXT
);

CREATE TABLE IF NOT EXISTS public."call_conversations" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "job_id" TEXT,
  "client_id" TEXT,
  "user_id" UUID,
  "phone_number" TEXT NOT NULL,
  "caller_number" TEXT,
  "call_id" TEXT,
  "call_duration" INTEGER,
  "call_direction" TEXT,
  "call_status" TEXT,
  "summary" TEXT,
  "transcript" TEXT,
  "ai_notes" TEXT,
  "sentiment" TEXT,
  "topics" JSONB,
  "action_items" JSONB,
  "metadata" TEXT,
  "created_at" TIMESTAMPTZ,
  "updated_at" TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public."call_logs" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "user_id" UUID,
  "client_id" TEXT,
  "phone_number" TEXT,
  "direction" TEXT,
  "duration" INTEGER,
  "status" TEXT,
  "recording_url" TEXT,
  "notes" TEXT,
  "started_at" TIMESTAMPTZ,
  "ended_at" TIMESTAMPTZ,
  "created_at" TIMESTAMPTZ,
  "updated_at" TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public."call_quality_logs" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "call_control_id" TEXT NOT NULL,
  "timestamp" TIMESTAMPTZ NOT NULL,
  "packets_lost" NUMERIC,
  "jitter" NUMERIC,
  "round_trip_time" NUMERIC,
  "audio_level" NUMERIC,
  "connection_state" TEXT,
  "created_at" TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public."call_routing_logs" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "phone_number" TEXT NOT NULL,
  "caller_phone" TEXT NOT NULL,
  "routing_decision" TEXT NOT NULL,
  "ai_enabled" BOOLEAN NOT NULL,
  "company_id" UUID,
  "call_control_id" TEXT,
  "created_at" TIMESTAMPTZ,
  "metadata" TEXT
);

CREATE TABLE IF NOT EXISTS public."client_documents" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "client_id" TEXT NOT NULL,
  "job_id" TEXT,
  "document_type" TEXT NOT NULL,
  "file_name" TEXT NOT NULL,
  "file_path" TEXT NOT NULL,
  "file_size" BIGINT,
  "mime_type" TEXT,
  "uploaded_by" TEXT,
  "created_at" TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS public."client_notifications" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "client_id" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "data" TEXT,
  "is_read" BOOLEAN,
  "created_at" TIMESTAMPTZ NOT NULL,
  "updated_at" TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS public."client_portal_access" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "access_token" TEXT NOT NULL,
  "client_id" TEXT NOT NULL,
  "document_type" TEXT NOT NULL,
  "document_id" UUID NOT NULL,
  "expires_at" TIMESTAMPTZ NOT NULL,
  "created_at" TIMESTAMPTZ,
  "used_at" TIMESTAMPTZ,
  "permissions" TEXT,
  "domain_restriction" TEXT,
  "ip_restrictions" JSONB,
  "max_uses" INTEGER,
  "use_count" INTEGER
);

CREATE TABLE IF NOT EXISTS public."client_properties" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "client_id" TEXT NOT NULL,
  "property_name" TEXT NOT NULL,
  "address" TEXT,
  "city" TEXT,
  "state" TEXT,
  "zip" TEXT,
  "country" TEXT,
  "property_type" TEXT,
  "is_primary" BOOLEAN,
  "notes" TEXT,
  "created_at" TIMESTAMPTZ NOT NULL,
  "updated_at" TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS public."clients" (
  "id" TEXT NOT NULL,
  "created_by" UUID,
  "name" TEXT NOT NULL,
  "company" TEXT,
  "email" TEXT,
  "phone" TEXT,
  "address" TEXT,
  "city" TEXT,
  "state" TEXT,
  "zip" TEXT,
  "country" TEXT,
  "notes" TEXT,
  "status" TEXT,
  "tags" JSONB,
  "created_at" TIMESTAMPTZ,
  "updated_at" TIMESTAMPTZ,
  "type" TEXT,
  "user_id" UUID,
  "first_name" TEXT,
  "last_name" TEXT
);

CREATE TABLE IF NOT EXISTS public."communication_logs" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "user_id" UUID NOT NULL,
  "client_id" TEXT,
  "job_id" TEXT,
  "document_type" TEXT,
  "document_id" TEXT,
  "type" TEXT NOT NULL,
  "direction" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "from_address" TEXT NOT NULL,
  "to_address" TEXT NOT NULL,
  "subject" TEXT,
  "content" TEXT,
  "metadata" TEXT,
  "error_message" TEXT,
  "external_id" TEXT,
  "created_at" TIMESTAMPTZ,
  "sent_at" TIMESTAMPTZ,
  "delivered_at" TIMESTAMPTZ,
  "failed_at" TIMESTAMPTZ,
  "communication_type" TEXT,
  "recipient" TEXT,
  "from_number" TEXT,
  "idempotency_key" TEXT
);

CREATE TABLE IF NOT EXISTS public."company_settings" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "user_id" UUID NOT NULL,
  "company_name" TEXT,
  "business_type" TEXT,
  "company_address" TEXT,
  "company_city" TEXT,
  "company_state" TEXT,
  "company_zip" TEXT,
  "company_country" TEXT,
  "company_phone" TEXT,
  "company_email" TEXT,
  "company_website" TEXT,
  "tax_id" TEXT,
  "company_logo_url" TEXT,
  "company_tagline" TEXT,
  "company_description" TEXT,
  "service_radius" INTEGER,
  "service_zip_codes" TEXT,
  "created_at" TIMESTAMPTZ NOT NULL,
  "updated_at" TIMESTAMPTZ NOT NULL,
  "business_hours" TEXT,
  "custom_domain" TEXT,
  "mailgun_domain" TEXT,
  "mailgun_api_key" TEXT,
  "email_from_name" TEXT,
  "email_from_address" TEXT,
  "domain_verification_status" TEXT,
  "mailgun_settings" TEXT,
  "custom_domain_name" TEXT,
  "client_portal_url" TEXT,
  "email_domain_name" TEXT,
  "phone_number_limit" INTEGER,
  "phone_numbers_used" INTEGER,
  "business_niche" TEXT,
  "team_size" TEXT,
  "company_timezone" TEXT,
  "mailgun_config" TEXT,
  "company_email_address" TEXT
);

CREATE TABLE IF NOT EXISTS public."conversations" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "client_id" TEXT,
  "phone_number" TEXT,
  "last_message_at" TIMESTAMPTZ,
  "last_message_preview" TEXT,
  "unread_count" INTEGER,
  "created_at" TIMESTAMPTZ,
  "updated_at" TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public."custom_fields" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "name" TEXT NOT NULL,
  "field_type" TEXT NOT NULL,
  "options" TEXT,
  "required" BOOLEAN,
  "placeholder" TEXT,
  "default_value" TEXT,
  "entity_type" TEXT NOT NULL,
  "created_by" UUID,
  "created_at" TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public."custom_roles" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "permissions" TEXT NOT NULL,
  "created_by" UUID,
  "created_at" TIMESTAMPTZ,
  "updated_at" TIMESTAMPTZ,
  "user_id" UUID
);

CREATE TABLE IF NOT EXISTS public."document_approvals" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "approval_token" TEXT NOT NULL,
  "document_type" TEXT NOT NULL,
  "document_id" UUID NOT NULL,
  "document_number" TEXT NOT NULL,
  "client_id" TEXT NOT NULL,
  "client_name" TEXT,
  "client_email" TEXT,
  "client_phone" TEXT,
  "status" TEXT NOT NULL,
  "client_response" TEXT,
  "signature_data" TEXT,
  "approved_at" TIMESTAMPTZ,
  "ip_address" TEXT,
  "user_agent" TEXT,
  "expires_at" TIMESTAMPTZ NOT NULL,
  "created_at" TIMESTAMPTZ NOT NULL,
  "updated_at" TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS public."email_conversations" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "user_id" UUID NOT NULL,
  "client_id" TEXT,
  "email_address" TEXT NOT NULL,
  "client_name" TEXT,
  "subject" TEXT,
  "last_message_at" TIMESTAMPTZ,
  "last_message_preview" TEXT,
  "unread_count" INTEGER,
  "is_archived" BOOLEAN,
  "is_starred" BOOLEAN,
  "created_at" TIMESTAMPTZ,
  "updated_at" TIMESTAMPTZ,
  "client_email" TEXT
);

CREATE TABLE IF NOT EXISTS public."email_messages" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "conversation_id" UUID,
  "user_id" UUID NOT NULL,
  "direction" TEXT NOT NULL,
  "from_email" TEXT NOT NULL,
  "to_email" TEXT NOT NULL,
  "subject" TEXT,
  "body" TEXT NOT NULL,
  "html_body" TEXT,
  "attachments" TEXT,
  "is_read" BOOLEAN,
  "email_id" TEXT,
  "thread_id" TEXT,
  "status" TEXT,
  "metadata" TEXT,
  "created_at" TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public."estimate_communications" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "estimate_id" UUID NOT NULL,
  "type" TEXT NOT NULL,
  "recipient_email" TEXT,
  "recipient_phone" TEXT,
  "content" TEXT NOT NULL,
  "status" TEXT,
  "metadata" TEXT,
  "created_at" TIMESTAMPTZ,
  "updated_at" TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public."estimates" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "estimate_number" TEXT NOT NULL,
  "job_id" TEXT NOT NULL,
  "client_id" TEXT,
  "title" TEXT,
  "description" TEXT,
  "status" TEXT NOT NULL,
  "total" NUMERIC NOT NULL,
  "subtotal" NUMERIC NOT NULL,
  "tax_rate" NUMERIC,
  "tax_amount" NUMERIC,
  "discount_amount" NUMERIC,
  "items" TEXT,
  "notes" TEXT,
  "terms" TEXT,
  "valid_until" DATE,
  "approved_at" TIMESTAMPTZ,
  "created_by" UUID,
  "created_at" TIMESTAMPTZ NOT NULL,
  "updated_at" TIMESTAMPTZ NOT NULL,
  "client_signature" TEXT,
  "signature_ip" TEXT,
  "signature_timestamp" TIMESTAMPTZ,
  "portal_access_token" TEXT,
  "user_id" UUID,
  "sent_at" TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public."fact_jobs" (
  "id" TEXT,
  "title" TEXT,
  "status" TEXT,
  "date" TIMESTAMPTZ,
  "revenue" NUMERIC,
  "client_id" TEXT,
  "technician_id" UUID,
  "client_name" TEXT,
  "technician_name" TEXT,
  "date_day" DATE,
  "date_week" TIMESTAMPTZ,
  "date_month" TIMESTAMPTZ,
  "year" NUMERIC,
  "month" NUMERIC,
  "day" NUMERIC
);

CREATE TABLE IF NOT EXISTS public."id_counters" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "entity_type" TEXT NOT NULL,
  "current_value" INTEGER NOT NULL,
  "prefix" TEXT NOT NULL,
  "start_value" INTEGER NOT NULL,
  "created_at" TIMESTAMPTZ,
  "updated_at" TIMESTAMPTZ,
  "user_id" UUID
);

CREATE TABLE IF NOT EXISTS public."invoice_communications" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "invoice_id" UUID NOT NULL,
  "type" TEXT NOT NULL,
  "recipient_email" TEXT,
  "recipient_phone" TEXT,
  "content" TEXT NOT NULL,
  "status" TEXT,
  "metadata" TEXT,
  "created_at" TIMESTAMPTZ,
  "updated_at" TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public."invoices" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "invoice_number" TEXT NOT NULL,
  "job_id" TEXT NOT NULL,
  "client_id" TEXT,
  "estimate_id" UUID,
  "title" TEXT,
  "description" TEXT,
  "status" TEXT NOT NULL,
  "total" NUMERIC NOT NULL,
  "subtotal" NUMERIC NOT NULL,
  "tax_rate" NUMERIC,
  "tax_amount" NUMERIC,
  "discount_amount" NUMERIC,
  "amount_paid" NUMERIC,
  "balance_due" NUMERIC,
  "items" TEXT,
  "notes" TEXT,
  "terms" TEXT,
  "issue_date" DATE NOT NULL,
  "due_date" DATE,
  "paid_at" TIMESTAMPTZ,
  "created_by" UUID,
  "created_at" TIMESTAMPTZ NOT NULL,
  "updated_at" TIMESTAMPTZ NOT NULL,
  "date" TIMESTAMPTZ,
  "balance" NUMERIC,
  "payment_link" TEXT,
  "payment_status" TEXT,
  "portal_access_token" TEXT,
  "user_id" UUID,
  "automation_triggered_at" TIMESTAMPTZ,
  "sent_at" TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public."job_attachments" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "job_id" TEXT NOT NULL,
  "file_name" TEXT NOT NULL,
  "file_path" TEXT NOT NULL,
  "file_size" BIGINT,
  "mime_type" TEXT,
  "uploaded_at" TIMESTAMPTZ NOT NULL,
  "uploaded_by" UUID
);

CREATE TABLE IF NOT EXISTS public."job_custom_field_values" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "job_id" TEXT NOT NULL,
  "custom_field_id" UUID NOT NULL,
  "value" TEXT,
  "created_at" TIMESTAMPTZ,
  "updated_at" TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public."job_history" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "job_id" TEXT NOT NULL,
  "user_id" UUID,
  "user_name" TEXT,
  "type" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "meta" TEXT,
  "visibility" TEXT,
  "created_at" TIMESTAMPTZ,
  "entity_id" TEXT,
  "entity_type" TEXT,
  "old_value" TEXT,
  "new_value" TEXT,
  "ip_address" TEXT,
  "user_agent" TEXT,
  "conversation_id" UUID
);

CREATE TABLE IF NOT EXISTS public."job_overview" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "job_id" TEXT NOT NULL,
  "warranty_info" TEXT,
  "emergency_contact" TEXT,
  "billing_contact" TEXT,
  "created_at" TIMESTAMPTZ NOT NULL,
  "updated_at" TIMESTAMPTZ NOT NULL,
  "property_type" TEXT,
  "property_age" TEXT,
  "property_size" TEXT,
  "previous_service_date" DATE
);

CREATE TABLE IF NOT EXISTS public."job_revenue_summary" (
  "job_id" TEXT,
  "job_title" TEXT,
  "job_status" TEXT,
  "recorded_revenue" NUMERIC,
  "total_invoices" BIGINT,
  "paid_invoices" BIGINT,
  "unpaid_invoices" BIGINT,
  "calculated_revenue" NUMERIC,
  "pending_revenue" NUMERIC,
  "total_invoiced" NUMERIC
);

CREATE TABLE IF NOT EXISTS public."job_statuses" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "color" TEXT,
  "sequence" INTEGER,
  "is_default" BOOLEAN,
  "created_by" UUID,
  "created_at" TIMESTAMPTZ,
  "user_id" UUID
);

CREATE TABLE IF NOT EXISTS public."job_types" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "color" TEXT,
  "is_default" BOOLEAN,
  "created_by" UUID,
  "created_at" TIMESTAMPTZ,
  "user_id" UUID
);

CREATE TABLE IF NOT EXISTS public."jobs" (
  "id" TEXT NOT NULL,
  "client_id" TEXT,
  "created_by" UUID,
  "title" TEXT,
  "description" TEXT,
  "status" TEXT,
  "date" TIMESTAMPTZ,
  "schedule_start" TIMESTAMPTZ,
  "schedule_end" TIMESTAMPTZ,
  "revenue" NUMERIC,
  "technician_id" UUID,
  "tags" JSONB,
  "notes" TEXT,
  "created_at" TIMESTAMPTZ,
  "updated_at" TIMESTAMPTZ,
  "job_type" TEXT,
  "lead_source" TEXT,
  "tasks" TEXT,
  "property_id" UUID,
  "address" TEXT,
  "user_id" UUID,
  "created_by_automation" UUID,
  "automation_triggered_at" TIMESTAMPTZ,
  "deleted_at" TIMESTAMPTZ,
  "service" TEXT,
  "organization_id" UUID,
  "scheduled_date" DATE,
  "scheduled_time" TEXT,
  "appointment_status" TEXT,
  "booked_via" TEXT
);

CREATE TABLE IF NOT EXISTS public."lead_sources" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "is_active" BOOLEAN,
  "created_by" UUID,
  "created_at" TIMESTAMPTZ,
  "user_id" UUID
);

CREATE TABLE IF NOT EXISTS public."line_items" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "parent_type" TEXT NOT NULL,
  "parent_id" UUID NOT NULL,
  "description" TEXT NOT NULL,
  "quantity" NUMERIC NOT NULL,
  "unit_price" NUMERIC NOT NULL,
  "taxable" BOOLEAN NOT NULL,
  "discount" NUMERIC,
  "created_at" TIMESTAMPTZ NOT NULL,
  "updated_at" TIMESTAMPTZ NOT NULL,
  "our_price" NUMERIC
);

CREATE TABLE IF NOT EXISTS public."message_templates" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "user_id" UUID NOT NULL,
  "name" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "subject" TEXT,
  "content" TEXT NOT NULL,
  "variables" TEXT,
  "is_active" BOOLEAN,
  "is_default" BOOLEAN,
  "created_at" TIMESTAMPTZ,
  "updated_at" TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public."notifications" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "user_id" UUID,
  "title" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "type" TEXT,
  "entity_type" TEXT,
  "entity_id" TEXT,
  "read_at" TIMESTAMPTZ,
  "created_at" TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public."organization_communication_settings" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "organization_id" UUID NOT NULL,
  "default_from_email" TEXT,
  "default_from_name" TEXT,
  "mailgun_domain" TEXT,
  "sms_enabled" BOOLEAN,
  "email_enabled" BOOLEAN,
  "created_at" TIMESTAMPTZ,
  "updated_at" TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public."organization_settings" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "organization_id" UUID NOT NULL,
  "company_name" TEXT,
  "company_email" TEXT,
  "company_phone" TEXT,
  "company_address" TEXT,
  "company_logo" TEXT,
  "website" TEXT,
  "brand_color" TEXT,
  "timezone" TEXT,
  "business_hours" TEXT,
  "created_at" TIMESTAMPTZ,
  "updated_at" TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public."organizations" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "name" TEXT NOT NULL,
  "created_at" TIMESTAMPTZ,
  "updated_at" TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public."payment_methods" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "name" TEXT NOT NULL,
  "color" TEXT,
  "user_id" UUID,
  "created_at" TIMESTAMPTZ,
  "updated_at" TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public."payments" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "payment_number" TEXT NOT NULL,
  "invoice_id" UUID,
  "job_id" TEXT,
  "client_id" TEXT,
  "amount" NUMERIC NOT NULL,
  "method" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "reference" TEXT,
  "notes" TEXT,
  "payment_date" DATE NOT NULL,
  "processed_by" UUID,
  "created_at" TIMESTAMPTZ NOT NULL,
  "updated_at" TIMESTAMPTZ NOT NULL,
  "date" TIMESTAMPTZ,
  "balance" NUMERIC
);

CREATE TABLE IF NOT EXISTS public."phone_number_billing_history" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "phone_number_id" UUID,
  "user_id" UUID,
  "amount" NUMERIC NOT NULL,
  "billing_type" TEXT NOT NULL,
  "status" TEXT,
  "payment_method" TEXT,
  "stripe_payment_id" TEXT,
  "billed_at" TIMESTAMPTZ,
  "paid_at" TIMESTAMPTZ,
  "metadata" TEXT,
  "created_at" TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public."phone_numbers" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "phone_number" TEXT NOT NULL,
  "friendly_name" TEXT,
  "country_code" TEXT NOT NULL,
  "region" TEXT,
  "locality" TEXT,
  "rate_center" TEXT,
  "latitude" NUMERIC,
  "longitude" NUMERIC,
  "capabilities" TEXT,
  "phone_number_type" TEXT,
  "price_unit" TEXT,
  "price" NUMERIC,
  "monthly_price" NUMERIC,
  "status" TEXT,
  "purchased_by" UUID,
  "purchased_at" TIMESTAMPTZ,
  "assigned_to" UUID,
  "created_at" TIMESTAMPTZ NOT NULL,
  "updated_at" TIMESTAMPTZ NOT NULL,
  "ai_dispatcher_enabled" BOOLEAN,
  "connect_phone_number_arn" TEXT,
  "connect_instance_id" TEXT,
  "ai_settings" TEXT,
  "connect_contact_flow_id" TEXT,
  "connect_queue_id" TEXT,
  "telnyx_phone_number_id" TEXT,
  "telnyx_connection_id" TEXT,
  "webhook_url" TEXT,
  "configured_for_ai" BOOLEAN,
  "user_id" UUID,
  "is_active" BOOLEAN,
  "is_primary" BOOLEAN,
  "retail_price" NUMERIC,
  "retail_monthly_price" NUMERIC,
  "purchase_date" TIMESTAMPTZ,
  "next_billing_date" TIMESTAMPTZ,
  "billing_status" TEXT,
  "area_code" TEXT,
  "organization_id" UUID,
  "metadata" TEXT,
  "telnyx_id" TEXT,
  "ai_voice_settings" TEXT,
  "sms_settings" TEXT,
  "webhook_settings" TEXT,
  "telnyx_settings" TEXT,
  "mcp_enabled" BOOLEAN,
  "mcp_server_id" TEXT,
  "mcp_webhook_url" TEXT,
  "mcp_integration_secret" TEXT,
  "ai_assistant_id" TEXT
);

CREATE TABLE IF NOT EXISTS public."portal_access_logs" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "user_id" UUID,
  "action" TEXT NOT NULL,
  "resource_type" TEXT,
  "resource_id" TEXT,
  "ip_address" TEXT,
  "user_agent" TEXT,
  "created_at" TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public."portal_activity_logs" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "session_id" UUID,
  "client_id" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "resource_type" TEXT,
  "resource_id" TEXT,
  "ip_address" TEXT,
  "user_agent" TEXT,
  "metadata" TEXT,
  "created_at" TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public."portal_documents" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "client_id" TEXT NOT NULL,
  "document_type" TEXT NOT NULL,
  "file_name" TEXT NOT NULL,
  "file_path" TEXT NOT NULL,
  "file_size" BIGINT,
  "mime_type" TEXT,
  "is_downloadable" BOOLEAN,
  "expires_at" TIMESTAMPTZ,
  "uploaded_by" UUID,
  "created_at" TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public."portal_preferences" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "client_id" TEXT NOT NULL,
  "theme" TEXT,
  "language" TEXT,
  "notification_preferences" TEXT,
  "timezone" TEXT,
  "created_at" TIMESTAMPTZ,
  "updated_at" TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public."portal_sessions" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "access_token" TEXT NOT NULL,
  "client_id" TEXT NOT NULL,
  "ip_address" TEXT,
  "user_agent" TEXT,
  "expires_at" TIMESTAMPTZ NOT NULL,
  "last_accessed_at" TIMESTAMPTZ,
  "is_active" BOOLEAN,
  "created_at" TIMESTAMPTZ,
  "permissions" TEXT
);

CREATE TABLE IF NOT EXISTS public."products" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "category" TEXT NOT NULL,
  "price" NUMERIC NOT NULL,
  "ourprice" NUMERIC,
  "cost" NUMERIC,
  "taxable" BOOLEAN,
  "tags" JSONB,
  "sku" TEXT,
  "created_by" UUID,
  "created_at" TIMESTAMPTZ,
  "updated_at" TIMESTAMPTZ,
  "user_id" UUID
);

CREATE TABLE IF NOT EXISTS public."profiles" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "name" TEXT,
  "avatar_url" TEXT,
  "role" TEXT,
  "created_at" TIMESTAMPTZ,
  "updated_at" TIMESTAMPTZ,
  "business_niche" TEXT,
  "referral_source" TEXT,
  "status" TEXT,
  "is_public" BOOLEAN,
  "available_for_jobs" BOOLEAN,
  "phone" TEXT,
  "two_factor_enabled" BOOLEAN,
  "call_masking_enabled" BOOLEAN,
  "labor_cost_per_hour" INTEGER,
  "schedule_color" TEXT,
  "internal_notes" TEXT,
  "uses_two_factor" BOOLEAN,
  "email" TEXT,
  "has_completed_onboarding" BOOLEAN,
  "custom_role_id" UUID,
  "user_id" UUID,
  "organization_id" UUID,
  "timezone" TEXT,
  "business_hours" TEXT,
  "company_name" TEXT,
  "company_email" TEXT,
  "company_phone" TEXT,
  "company_address" TEXT,
  "company_logo" TEXT,
  "website" TEXT,
  "brand_color" TEXT,
  "company_email_address" TEXT,
  "company_website" TEXT
);

CREATE TABLE IF NOT EXISTS public."report_schedules" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "report_id" UUID,
  "frequency" TEXT NOT NULL,
  "cron_expression" TEXT,
  "recipients" JSONB,
  "is_active" BOOLEAN,
  "created_at" TIMESTAMPTZ,
  "last_run_at" TIMESTAMPTZ,
  "next_run_at" TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public."reports" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "template_id" TEXT,
  "filters" TEXT,
  "widgets" TEXT,
  "created_by" UUID,
  "created_at" TIMESTAMPTZ,
  "updated_at" TIMESTAMPTZ,
  "is_public" BOOLEAN
);

CREATE TABLE IF NOT EXISTS public."scheduled_workflow_executions" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "workflow_id" UUID NOT NULL,
  "execution_id" UUID NOT NULL,
  "resume_at" TIMESTAMPTZ NOT NULL,
  "resume_from_step" INTEGER NOT NULL,
  "context" TEXT,
  "status" TEXT NOT NULL,
  "error" TEXT,
  "created_at" TIMESTAMPTZ,
  "updated_at" TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public."secure_client_sessions" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "client_portal_user_id" UUID NOT NULL,
  "session_token" TEXT NOT NULL,
  "ip_address" TEXT,
  "user_agent" TEXT,
  "expires_at" TIMESTAMPTZ NOT NULL,
  "created_at" TIMESTAMPTZ,
  "last_accessed_at" TIMESTAMPTZ,
  "is_revoked" BOOLEAN
);

CREATE TABLE IF NOT EXISTS public."security_audit_log" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "user_id" UUID,
  "action" TEXT NOT NULL,
  "resource" TEXT,
  "details" TEXT,
  "ip_address" TEXT,
  "user_agent" TEXT,
  "created_at" TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public."service_areas" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "user_id" UUID NOT NULL,
  "name" TEXT NOT NULL,
  "zip_code" TEXT,
  "created_at" TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public."service_types" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "organization_id" UUID,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "color" TEXT,
  "icon" TEXT,
  "is_active" BOOLEAN,
  "created_at" TIMESTAMPTZ,
  "updated_at" TIMESTAMPTZ,
  "user_id" UUID
);

CREATE TABLE IF NOT EXISTS public."sms_conversations" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "user_id" UUID NOT NULL,
  "client_id" TEXT,
  "phone_number" TEXT NOT NULL,
  "client_phone" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "last_message_at" TIMESTAMPTZ,
  "last_message_preview" TEXT,
  "unread_count" INTEGER,
  "created_at" TIMESTAMPTZ,
  "updated_at" TIMESTAMPTZ,
  "stopped_at" TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public."sms_messages" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "conversation_id" UUID NOT NULL,
  "communication_log_id" UUID,
  "direction" TEXT NOT NULL,
  "from_number" TEXT NOT NULL,
  "to_number" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "external_id" TEXT,
  "metadata" TEXT,
  "created_at" TIMESTAMPTZ,
  "message" TEXT,
  "raw_data" TEXT,
  "updated_at" TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public."sms_opt_outs" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "phone_number" TEXT NOT NULL,
  "conversation_id" UUID,
  "keyword" TEXT,
  "opted_out_at" TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public."sms_webhook_logs" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "created_at" TIMESTAMPTZ,
  "event_type" TEXT,
  "payload" TEXT,
  "error" TEXT,
  "processed" BOOLEAN
);

CREATE TABLE IF NOT EXISTS public."tags" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "name" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "color" TEXT,
  "created_by" UUID,
  "created_at" TIMESTAMPTZ,
  "user_id" UUID
);

CREATE TABLE IF NOT EXISTS public."tasks" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "description" TEXT NOT NULL,
  "job_id" TEXT,
  "client_id" TEXT,
  "assigned_to" UUID,
  "due_date" TIMESTAMPTZ,
  "priority" TEXT,
  "status" TEXT,
  "created_by" UUID,
  "created_by_automation" UUID,
  "organization_id" UUID,
  "completed_at" TIMESTAMPTZ,
  "completed_by" UUID,
  "notes" TEXT,
  "created_at" TIMESTAMPTZ,
  "updated_at" TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public."team_invitations" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "email" TEXT NOT NULL,
  "phone" TEXT,
  "name" TEXT NOT NULL,
  "role" TEXT NOT NULL,
  "service_area" TEXT,
  "invitation_token" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "invited_by" UUID,
  "expires_at" TIMESTAMPTZ NOT NULL,
  "created_at" TIMESTAMPTZ NOT NULL,
  "updated_at" TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS public."team_member_commissions" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "user_id" UUID NOT NULL,
  "base_rate" INTEGER,
  "rules" TEXT,
  "fees" TEXT,
  "created_at" TIMESTAMPTZ,
  "updated_at" TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public."team_member_skills" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "user_id" UUID NOT NULL,
  "name" TEXT NOT NULL,
  "created_at" TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public."telnyx_calls" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "user_id" UUID,
  "call_control_id" TEXT,
  "phone_number" TEXT,
  "caller_phone" TEXT,
  "direction" TEXT,
  "status" TEXT,
  "duration" INTEGER,
  "started_at" TIMESTAMPTZ,
  "ended_at" TIMESTAMPTZ,
  "recording_url" TEXT,
  "appointment_scheduled" BOOLEAN,
  "call_status" TEXT,
  "metadata" TEXT,
  "created_at" TIMESTAMPTZ,
  "updated_at" TIMESTAMPTZ,
  "from_number" TEXT,
  "to_number" TEXT,
  "conference_id" TEXT,
  "conference_role" TEXT
);

CREATE TABLE IF NOT EXISTS public."todos" (
  "id" BIGINT NOT NULL,
  "user_id" UUID NOT NULL,
  "task" TEXT,
  "is_complete" BOOLEAN,
  "inserted_at" TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS public."user_actions" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "user_id" UUID NOT NULL,
  "action_type" TEXT NOT NULL,
  "page" TEXT NOT NULL,
  "element" TEXT,
  "context" TEXT,
  "created_at" TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS public."user_ai_preferences" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "user_id" UUID NOT NULL,
  "preference_key" TEXT NOT NULL,
  "preference_value" TEXT NOT NULL,
  "confidence_score" NUMERIC,
  "updated_at" TIMESTAMPTZ NOT NULL,
  "created_at" TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS public."user_notifications" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "user_id" UUID NOT NULL,
  "title" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "data" TEXT,
  "is_read" BOOLEAN,
  "read_at" TIMESTAMPTZ,
  "created_at" TIMESTAMPTZ,
  "updated_at" TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public."user_permissions" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "user_id" UUID,
  "permission" TEXT NOT NULL,
  "granted_by" UUID,
  "created_at" TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public."user_settings" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "user_id" UUID NOT NULL,
  "dark_mode" BOOLEAN,
  "compact_view" BOOLEAN,
  "sound_effects" BOOLEAN,
  "default_landing_page" TEXT,
  "date_format" TEXT,
  "email_notifications" BOOLEAN,
  "push_notifications" BOOLEAN,
  "sms_notifications" BOOLEAN,
  "job_reminders" BOOLEAN,
  "invoice_alerts" BOOLEAN,
  "marketing_updates" BOOLEAN,
  "language" TEXT,
  "timezone" TEXT,
  "currency" TEXT,
  "notification_email" TEXT,
  "created_at" TIMESTAMPTZ NOT NULL,
  "updated_at" TIMESTAMPTZ NOT NULL,
  "default_tax_rate" NUMERIC,
  "tax_region" TEXT,
  "tax_label" TEXT
);

CREATE TABLE IF NOT EXISTS public."warranty_analytics" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "user_id" UUID NOT NULL,
  "warranty_id" TEXT NOT NULL,
  "warranty_name" TEXT NOT NULL,
  "job_id" TEXT,
  "job_type" TEXT,
  "service_category" TEXT,
  "job_value" NUMERIC,
  "client_id" TEXT,
  "purchased_at" TIMESTAMPTZ NOT NULL,
  "created_at" TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS public."warranty_analytics_summary" (
  "warranty_id" TEXT,
  "warranty_name" TEXT,
  "job_type" TEXT,
  "purchase_count" BIGINT,
  "avg_job_value" NUMERIC,
  "month" TIMESTAMPTZ,
  "popularity_percentage" NUMERIC
);

CREATE TABLE IF NOT EXISTS public."weather_cache" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "location" TEXT NOT NULL,
  "latitude" NUMERIC,
  "longitude" NUMERIC,
  "weather_data" TEXT NOT NULL,
  "created_at" TIMESTAMPTZ,
  "expires_at" TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS public."webhook_events" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "event_type" TEXT NOT NULL,
  "entity_type" TEXT NOT NULL,
  "entity_id" TEXT NOT NULL,
  "data" TEXT NOT NULL,
  "webhook_url" TEXT,
  "status" TEXT,
  "attempts" INTEGER,
  "last_attempt_at" TIMESTAMPTZ,
  "created_at" TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS public."webhook_logs" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "webhook_name" TEXT,
  "request_body" TEXT,
  "response_body" TEXT,
  "created_at" TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public."workflow_executions" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "workflow_id" UUID,
  "started_at" TIMESTAMPTZ,
  "completed_at" TIMESTAMPTZ,
  "status" TEXT NOT NULL,
  "current_step_id" TEXT,
  "execution_data" TEXT,
  "error_message" TEXT,
  "organization_id" UUID NOT NULL
);

CREATE TABLE IF NOT EXISTS public."workflow_schedules" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "workflow_id" UUID,
  "cron_expression" TEXT,
  "timezone" TEXT,
  "next_run_at" TIMESTAMPTZ,
  "last_run_at" TIMESTAMPTZ,
  "enabled" BOOLEAN,
  "organization_id" UUID NOT NULL
);

CREATE TABLE IF NOT EXISTS public."workflow_step_executions" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "execution_id" UUID,
  "step_id" TEXT NOT NULL,
  "step_type" TEXT NOT NULL,
  "started_at" TIMESTAMPTZ,
  "completed_at" TIMESTAMPTZ,
  "status" TEXT NOT NULL,
  "input_data" TEXT,
  "output_data" TEXT,
  "error_message" TEXT,
  "organization_id" UUID NOT NULL
);

CREATE TABLE IF NOT EXISTS public."workflow_triggers" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "workflow_id" UUID,
  "trigger_type" TEXT NOT NULL,
  "conditions" TEXT NOT NULL,
  "enabled" BOOLEAN,
  "organization_id" UUID NOT NULL
);

-- Enable RLS on all tables
ALTER TABLE IF EXISTS public."advanced_workflow_executions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."advanced_workflow_templates" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."advanced_workflows" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."ai_agent_configs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."ai_assistant_templates" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."ai_call_logs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."ai_dispatcher_call_logs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."ai_dispatcher_configs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."ai_recommendations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."appointment_slots" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."appointments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."auth_rate_limits" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."automation_actions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."automation_analytics" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."automation_conditions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."automation_cron_status" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."automation_deduplication" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."automation_execution_logs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."automation_execution_tracker" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."automation_health" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."automation_history" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."automation_performance" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."automation_runs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."automation_schedules" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."automation_system_health" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."automation_template_usage" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."automation_templates" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."automation_trigger_queue" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."automation_triggers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."automation_variables" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."automation_workflow_status" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."automation_workflows" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."automations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."available_phone_numbers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."call_conversations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."call_logs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."call_quality_logs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."call_routing_logs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."client_documents" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."client_notifications" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."client_portal_access" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."client_properties" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."clients" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."communication_logs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."company_settings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."conversations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."custom_fields" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."custom_roles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."document_approvals" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."email_conversations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."email_messages" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."estimate_communications" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."estimates" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."fact_jobs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."id_counters" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."invoice_communications" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."invoices" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."job_attachments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."job_custom_field_values" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."job_history" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."job_overview" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."job_revenue_summary" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."job_statuses" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."job_types" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."jobs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."lead_sources" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."line_items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."message_templates" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."notifications" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."organization_communication_settings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."organization_settings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."organizations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."payment_methods" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."payments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."phone_number_billing_history" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."phone_numbers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."portal_access_logs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."portal_activity_logs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."portal_documents" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."portal_preferences" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."portal_sessions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."products" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."profiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."report_schedules" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."reports" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."scheduled_workflow_executions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."secure_client_sessions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."security_audit_log" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."service_areas" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."service_types" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."sms_conversations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."sms_messages" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."sms_opt_outs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."sms_webhook_logs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."tags" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."tasks" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."team_invitations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."team_member_commissions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."team_member_skills" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."telnyx_calls" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."todos" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."user_actions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."user_ai_preferences" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."user_notifications" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."user_permissions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."user_settings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."warranty_analytics" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."warranty_analytics_summary" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."weather_cache" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."webhook_events" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."webhook_logs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."workflow_executions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."workflow_schedules" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."workflow_step_executions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."workflow_triggers" ENABLE ROW LEVEL SECURITY;

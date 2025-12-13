-- COMPLETE SMS/EMAIL DATABASE CLEANUP SCRIPT
-- Run this in Supabase SQL Editor
-- Date: July 8, 2025

-- Drop all SMS/Email related tables
DROP TABLE IF EXISTS automation_communication_logs CASCADE;
DROP TABLE IF EXISTS automation_message_queue CASCADE;
DROP TABLE IF EXISTS automation_message_templates CASCADE;
DROP TABLE IF EXISTS automation_messages CASCADE;
DROP TABLE IF EXISTS communication_automations CASCADE;
DROP TABLE IF EXISTS communications CASCADE;
DROP TABLE IF EXISTS email_conversations CASCADE;
DROP TABLE IF EXISTS email_messages CASCADE;
DROP TABLE IF EXISTS emails CASCADE;
DROP TABLE IF EXISTS estimate_communications CASCADE;
DROP TABLE IF EXISTS invoice_communications CASCADE;
DROP TABLE IF EXISTS message_templates CASCADE;
DROP TABLE IF EXISTS portal_messages CASCADE;
DROP TABLE IF EXISTS telnyx_calls CASCADE;
DROP TABLE IF EXISTS telnyx_configurations CASCADE;

-- Additional tables that might have been missed
DROP TABLE IF EXISTS sms_logs CASCADE;
DROP TABLE IF EXISTS email_logs CASCADE;
DROP TABLE IF EXISTS communication_logs CASCADE;
DROP TABLE IF EXISTS mailgun_webhooks CASCADE;
DROP TABLE IF EXISTS telnyx_webhooks CASCADE;
DROP TABLE IF EXISTS email_templates CASCADE;
DROP TABLE IF EXISTS sms_templates CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;

-- List what remains
SELECT 'Tables cleanup complete!' as status;
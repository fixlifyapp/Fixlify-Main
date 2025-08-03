-- Enable real-time for SMS tables if not already enabled
-- Run this in Supabase SQL Editor

-- Enable real-time for sms_messages table
ALTER PUBLICATION supabase_realtime ADD TABLE sms_messages;

-- Enable real-time for sms_conversations table  
ALTER PUBLICATION supabase_realtime ADD TABLE sms_conversations;

-- Verify real-time is enabled
SELECT 
  schemaname,
  tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime'
AND tablename IN ('sms_messages', 'sms_conversations');

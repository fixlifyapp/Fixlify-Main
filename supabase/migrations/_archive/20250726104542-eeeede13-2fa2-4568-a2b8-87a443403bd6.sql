-- Add conference support to telnyx_calls table
ALTER TABLE telnyx_calls 
ADD COLUMN IF NOT EXISTS conference_id TEXT,
ADD COLUMN IF NOT EXISTS conference_role TEXT DEFAULT 'participant';

-- Create call quality logs table
CREATE TABLE IF NOT EXISTS call_quality_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  call_control_id TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  packets_lost NUMERIC DEFAULT 0,
  jitter NUMERIC DEFAULT 0,
  round_trip_time NUMERIC DEFAULT 0,
  audio_level NUMERIC DEFAULT 0,
  connection_state TEXT DEFAULT 'unknown',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on call quality logs
ALTER TABLE call_quality_logs ENABLE ROW LEVEL SECURITY;

-- Create policy for call quality logs
CREATE POLICY "Users can view their own call quality logs" 
ON call_quality_logs FOR SELECT 
USING (
  call_control_id IN (
    SELECT call_control_id FROM telnyx_calls 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "System can insert call quality logs" 
ON call_quality_logs FOR INSERT 
WITH CHECK (true);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_call_quality_logs_call_control_id 
ON call_quality_logs(call_control_id);

CREATE INDEX IF NOT EXISTS idx_call_quality_logs_timestamp 
ON call_quality_logs(timestamp);

-- Add comment
COMMENT ON TABLE call_quality_logs IS 'Stores call quality metrics for monitoring and optimization';
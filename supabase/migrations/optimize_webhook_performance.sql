-- Add index for faster phone lookups
CREATE INDEX IF NOT EXISTS idx_clients_phone ON clients(phone);
CREATE INDEX IF NOT EXISTS idx_phone_numbers_number ON phone_numbers(phone_number);
CREATE INDEX IF NOT EXISTS idx_ai_dispatcher_phone ON ai_dispatcher_configs(phone_number_id);

-- Add index for webhook logs
CREATE INDEX IF NOT EXISTS idx_webhook_logs_name_created 
ON webhook_logs(webhook_name, created_at DESC);

-- Function to get AI config with caching
CREATE OR REPLACE FUNCTION get_ai_config_cached(p_phone_number text)
RETURNS json AS $$
DECLARE
  config_data json;
BEGIN
  -- Get config with all needed data in one query
  SELECT row_to_json(t) INTO config_data
  FROM (
    SELECT 
      ac.*,
      pn.phone_number,
      pn.user_id
    FROM ai_dispatcher_configs ac
    JOIN phone_numbers pn ON ac.phone_number_id = pn.id
    WHERE pn.phone_number = p_phone_number
    LIMIT 1
  ) t;
  
  RETURN config_data;
END;
$$ LANGUAGE plpgsql;
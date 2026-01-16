-- Weather Cache System for cost optimization
-- Server-side cache shared across all organizations
-- Reduces Weather API costs by ~99% through city-based caching

-- Drop existing table if exists (to handle schema changes)
DROP TABLE IF EXISTS weather_cache CASCADE;

-- Weather cache table (global, no organization_id - shared cache)
CREATE TABLE weather_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key TEXT UNIQUE NOT NULL,  -- "coords:43.7:-79.4" (rounded to 0.1 degree)
  city_name TEXT,
  latitude DECIMAL(10, 6) NOT NULL,
  longitude DECIMAL(10, 6) NOT NULL,
  weather_data JSONB NOT NULL,
  forecast_date DATE NOT NULL DEFAULT CURRENT_DATE,
  fetched_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast lookups
CREATE INDEX idx_weather_cache_key ON weather_cache(cache_key);
CREATE INDEX idx_weather_cache_expires ON weather_cache(expires_at);
CREATE INDEX idx_weather_cache_date ON weather_cache(forecast_date);
CREATE INDEX idx_weather_cache_coords ON weather_cache(latitude, longitude);

-- No RLS on weather_cache - it's a shared global cache
-- Edge functions will handle access control

-- Function to clean expired cache entries (runs via cron)
CREATE OR REPLACE FUNCTION clean_expired_weather_cache()
RETURNS void AS $$
BEGIN
  DELETE FROM weather_cache WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Schedule cleanup every hour (ignore error if already exists)
DO $$
BEGIN
  PERFORM cron.schedule(
    'clean-weather-cache',
    '0 * * * *',
    'SELECT clean_expired_weather_cache();'
  );
EXCEPTION WHEN duplicate_object THEN
  -- Cron job already exists, ignore
  NULL;
END;
$$;

-- Grant access to service role for edge functions
GRANT ALL ON weather_cache TO service_role;
GRANT EXECUTE ON FUNCTION clean_expired_weather_cache() TO service_role;

COMMENT ON TABLE weather_cache IS 'Server-side weather cache shared across all organizations. City-based caching reduces API costs by ~99%.';

-- Add geocoding columns to client_properties for Map View and Route Optimization
-- These coordinates enable:
-- 1. Real job locations on Map View
-- 2. Route optimization with actual distances
-- 3. Weather by job location (not just city center)

-- Add latitude and longitude columns
ALTER TABLE client_properties
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 6),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(10, 6);

-- Add formatted_address for caching Google's formatted result
ALTER TABLE client_properties
ADD COLUMN IF NOT EXISTS formatted_address TEXT;

-- Add geocoded_at timestamp to track when address was geocoded
ALTER TABLE client_properties
ADD COLUMN IF NOT EXISTS geocoded_at TIMESTAMPTZ;

-- Create index for spatial queries (finding nearby properties)
CREATE INDEX IF NOT EXISTS idx_client_properties_coords
ON client_properties(latitude, longitude)
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Also add geocoding to jobs table for direct address storage
ALTER TABLE jobs
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 6),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(10, 6);

-- Index for job coordinates
CREATE INDEX IF NOT EXISTS idx_jobs_coords
ON jobs(latitude, longitude)
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Comment on columns
COMMENT ON COLUMN client_properties.latitude IS 'Latitude from Google Geocoding API';
COMMENT ON COLUMN client_properties.longitude IS 'Longitude from Google Geocoding API';
COMMENT ON COLUMN client_properties.formatted_address IS 'Formatted address returned by Google Geocoding';
COMMENT ON COLUMN client_properties.geocoded_at IS 'Timestamp when address was geocoded';
COMMENT ON COLUMN jobs.latitude IS 'Job location latitude (from property or direct geocoding)';
COMMENT ON COLUMN jobs.longitude IS 'Job location longitude (from property or direct geocoding)';

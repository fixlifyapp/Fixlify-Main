-- Add home base coordinates to profiles for AI travel distance calculation
-- Phase: AI Technician Recommendation - Real Distance Calculation

-- 1. Add home base coordinates to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS home_latitude DOUBLE PRECISION;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS home_longitude DOUBLE PRECISION;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS max_travel_distance_km INTEGER DEFAULT 50;

-- 2. Index for spatial queries on technician home location
CREATE INDEX IF NOT EXISTS idx_profiles_home_coords
  ON profiles (home_latitude, home_longitude)
  WHERE home_latitude IS NOT NULL;

-- 3. Comments for documentation
COMMENT ON COLUMN profiles.home_latitude IS 'Technician home/office latitude for AI travel distance calculations';
COMMENT ON COLUMN profiles.home_longitude IS 'Technician home/office longitude for AI travel distance calculations';
COMMENT ON COLUMN profiles.max_travel_distance_km IS 'Maximum travel distance technician is willing to travel (default 50km)';

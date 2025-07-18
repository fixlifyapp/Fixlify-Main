
import { supabase } from "@/integrations/supabase/client";

// This script will execute the updated stored procedures SQL
// Run this script after deploying to ensure the procedures are functioning correctly

async function updateStoredProcedures() {
  try {
    // Execute the SQL commands to update the stored procedures
    const { error } = await supabase.rpc('exec_sql', {
      sql: `
-- Update get_team_member_commission function
CREATE OR REPLACE FUNCTION public.get_team_member_commission(
  p_team_member_id UUID
)
RETURNS TABLE (
  id UUID, 
  user_id UUID, 
  base_rate INTEGER, 
  rules JSONB, 
  fees JSONB,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    tmc.id,
    tmc.user_id,
    tmc.base_rate,
    tmc.rules,
    tmc.fees,
    tmc.created_at,
    tmc.updated_at
  FROM 
    team_member_commissions tmc
  WHERE 
    tmc.user_id = p_team_member_id;
END;
$$;

-- Update get_team_member_skills function
CREATE OR REPLACE FUNCTION public.get_team_member_skills(
  p_team_member_id UUID
)
RETURNS TABLE (
  id UUID,
  name TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    tms.id,
    tms.name
  FROM 
    team_member_skills tms
  WHERE 
    tms.user_id = p_team_member_id;
END;
$$;

-- Update get_service_areas function
CREATE OR REPLACE FUNCTION public.get_service_areas(
  p_team_member_id UUID
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  zip_code TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sa.id,
    sa.name,
    sa.zip_code
  FROM 
    service_areas sa
  WHERE 
    sa.user_id = p_team_member_id;
END;
$$;

-- Update team_member_commission function
CREATE OR REPLACE FUNCTION public.update_team_member_commission(
  p_user_id UUID,
  p_base_rate INTEGER,
  p_rules JSONB,
  p_fees JSONB
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if a record exists for this user
  IF EXISTS (SELECT 1 FROM team_member_commissions WHERE user_id = p_user_id) THEN
    -- Update existing record
    UPDATE team_member_commissions
    SET 
      base_rate = p_base_rate,
      rules = p_rules,
      fees = p_fees,
      updated_at = now()
    WHERE user_id = p_user_id;
  ELSE
    -- Create new record
    INSERT INTO team_member_commissions (user_id, base_rate, rules, fees)
    VALUES (p_user_id, p_base_rate, p_rules, p_fees);
  END IF;
END;
$$;
      `
    });
    
    if (error) {
      console.error("Error updating stored procedures:", error);
      return false;
    }
    
    console.log("Stored procedures updated successfully");
    return true;
  } catch (error) {
    console.error("Error updating stored procedures:", error);
    return false;
  }
}

// Execute the update
updateStoredProcedures();

export default updateStoredProcedures;

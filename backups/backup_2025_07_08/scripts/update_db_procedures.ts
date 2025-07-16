
import { supabase } from "@/integrations/supabase/client";

// This script will execute the updated stored procedures SQL
// Run this script after deploying to ensure the procedures are functioning correctly

async function updateProcedures() {
  try {
    // Read the SQL from the migrations file and execute it
    const sql = `
-- Update get_team_member_commission function to return an array for proper handling in TypeScript
CREATE OR REPLACE FUNCTION public.get_team_member_commission(team_member_id UUID)
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
    tmc.user_id = team_member_id;
END;
$$;

-- Update get_team_member_skills function to return an array
CREATE OR REPLACE FUNCTION public.get_team_member_skills(team_member_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT 
    COALESCE(json_agg(
      json_build_object(
        'id', tms.id,
        'name', tms.name
      )
    ), '[]')::jsonb INTO result
  FROM 
    team_member_skills tms
  WHERE 
    tms.user_id = team_member_id;
    
  RETURN result;
END;
$$;

-- Update get_service_areas function to return an array
CREATE OR REPLACE FUNCTION public.get_service_areas(team_member_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT 
    COALESCE(json_agg(
      json_build_object(
        'id', sa.id,
        'name', sa.name,
        'zipCode', sa.zip_code
      )
    ), '[]')::jsonb INTO result
  FROM 
    service_areas sa
  WHERE 
    sa.user_id = team_member_id;
    
  RETURN result;
END;
$$;
    `;

    // Execute the SQL commands
    const { error } = await supabase.rpc('exec_sql', { sql });
    
    if (error) {
      console.error('Error updating procedures:', error);
      return false;
    }
    
    console.log('Database procedures updated successfully');
    return true;
  } catch (error) {
    console.error('Error updating procedures:', error);
    return false;
  }
}

// Execute the procedures update
updateProcedures();

export default updateProcedures;

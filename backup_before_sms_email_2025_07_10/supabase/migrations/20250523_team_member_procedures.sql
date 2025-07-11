
-- Function to get team member commission
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

-- Function to get team member skills
CREATE OR REPLACE FUNCTION public.get_team_member_skills(team_member_id UUID)
RETURNS TABLE (data JSONB)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    json_agg(
      json_build_object(
        'id', tms.id,
        'name', tms.name
      )
    )::jsonb as data
  FROM 
    team_member_skills tms
  WHERE 
    tms.user_id = team_member_id;
END;
$$;

-- Function to get service areas
CREATE OR REPLACE FUNCTION public.get_service_areas(team_member_id UUID)
RETURNS TABLE (data JSONB)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    json_agg(
      json_build_object(
        'id', sa.id,
        'name', sa.name,
        'zipCode', sa.zip_code
      )
    )::jsonb as data
  FROM 
    service_areas sa
  WHERE 
    sa.user_id = team_member_id;
END;
$$;

-- Function to update team member commission
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

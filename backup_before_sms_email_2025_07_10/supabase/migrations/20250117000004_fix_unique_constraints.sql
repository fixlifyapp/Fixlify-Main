-- Fix unique constraints to be per user instead of global

-- Drop existing unique constraints
ALTER TABLE public.job_statuses DROP CONSTRAINT IF EXISTS job_statuses_name_key;
ALTER TABLE public.job_types DROP CONSTRAINT IF EXISTS job_types_name_key;
ALTER TABLE public.tags DROP CONSTRAINT IF EXISTS tags_name_key;
ALTER TABLE public.lead_sources DROP CONSTRAINT IF EXISTS lead_sources_name_key;
ALTER TABLE public.products DROP CONSTRAINT IF EXISTS products_name_key;

-- Create new unique constraints that are per user
ALTER TABLE public.job_statuses ADD CONSTRAINT job_statuses_user_name_key UNIQUE (user_id, name);
ALTER TABLE public.job_types ADD CONSTRAINT job_types_user_name_key UNIQUE (user_id, name);
ALTER TABLE public.tags ADD CONSTRAINT tags_user_name_key UNIQUE (user_id, name);
ALTER TABLE public.lead_sources ADD CONSTRAINT lead_sources_user_name_key UNIQUE (user_id, name);
ALTER TABLE public.products ADD CONSTRAINT products_user_name_key UNIQUE (user_id, name);

-- Update the initialize_user_data function to handle conflicts properly
CREATE OR REPLACE FUNCTION public.initialize_user_data(p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Initialize id_counters for the user
  INSERT INTO public.id_counters (user_id, entity_type, prefix, start_value, current_value)
  VALUES 
    (p_user_id, 'invoice', 'INV', 1000, 1000),
    (p_user_id, 'estimate', 'EST', 1000, 1000),
    (p_user_id, 'payment', 'PAY', 1000, 1000),
    (p_user_id, 'job', 'JOB', 1000, 1000)
  ON CONFLICT (user_id, entity_type) DO NOTHING;

  -- Create default job statuses
  INSERT INTO public.job_statuses (user_id, name, color)
  VALUES 
    (p_user_id, 'New', '#3B82F6'),
    (p_user_id, 'In Progress', '#F59E0B'),
    (p_user_id, 'Completed', '#10B981'),
    (p_user_id, 'Cancelled', '#EF4444'),
    (p_user_id, 'On Hold', '#6B7280')
  ON CONFLICT (user_id, name) DO NOTHING;

  -- Create default lead sources
  INSERT INTO public.lead_sources (user_id, name)
  VALUES 
    (p_user_id, 'Website'),
    (p_user_id, 'Phone Call'),
    (p_user_id, 'Email'),
    (p_user_id, 'Referral'),
    (p_user_id, 'Social Media'),
    (p_user_id, 'Walk-in')
  ON CONFLICT (user_id, name) DO NOTHING;

  -- Create company settings
  INSERT INTO public.company_settings (user_id)
  VALUES (p_user_id)
  ON CONFLICT (user_id) DO NOTHING;
END;
$$; 
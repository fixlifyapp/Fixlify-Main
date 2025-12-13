-- Populate job_overview for existing jobs that don't have overview data
INSERT INTO public.job_overview (job_id, property_type, lead_source, emergency_contact, billing_contact, warranty_info)
SELECT 
  j.id as job_id,
  COALESCE(c.type, 'Residential') as property_type,
  COALESCE(j.lead_source, 'Direct') as lead_source,
  '{}' as emergency_contact,
  '{}' as billing_contact,
  '{}' as warranty_info
FROM public.jobs j
LEFT JOIN public.clients c ON c.id = j.client_id
WHERE j.id NOT IN (SELECT job_id FROM public.job_overview WHERE job_id IS NOT NULL);
-- Update niche initialization to keep lead sources universal
-- Only change products, tags, and job types when switching niche

CREATE OR REPLACE FUNCTION public.initialize_user_data_complete_enhanced(p_user_id uuid, p_business_niche text DEFAULT 'General Handyman'::text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  -- Initialize company settings (only if the table exists and user exists in auth.users)
  BEGIN
    INSERT INTO public.company_settings (user_id, company_name, business_type, business_niche)
    VALUES (p_user_id, 'My Business', p_business_niche, p_business_niche)
    ON CONFLICT (user_id) DO UPDATE
    SET business_type = EXCLUDED.business_type,
        business_niche = EXCLUDED.business_niche,
        updated_at = NOW();
  EXCEPTION 
    WHEN foreign_key_violation THEN
      RAISE NOTICE 'Skipping company_settings update for user %', p_user_id;
    WHEN undefined_table THEN
      RAISE NOTICE 'company_settings table does not exist, skipping';
  END;

  -- Update profile business_niche
  BEGIN
    UPDATE public.profiles 
    SET business_niche = p_business_niche, updated_at = NOW()
    WHERE id = p_user_id;
  EXCEPTION 
    WHEN OTHERS THEN
      RAISE NOTICE 'Could not update profile for user %', p_user_id;
  END;

  -- Always initialize job statuses (same for everyone) - only if none exist
  INSERT INTO public.job_statuses (name, color, sequence, user_id, created_by) 
  SELECT 'New', '#3b82f6', 1, p_user_id, p_user_id
  WHERE NOT EXISTS (SELECT 1 FROM public.job_statuses WHERE user_id = p_user_id AND name = 'New');
  
  INSERT INTO public.job_statuses (name, color, sequence, user_id, created_by) 
  SELECT 'In Progress', '#f59e0b', 2, p_user_id, p_user_id
  WHERE NOT EXISTS (SELECT 1 FROM public.job_statuses WHERE user_id = p_user_id AND name = 'In Progress');
  
  INSERT INTO public.job_statuses (name, color, sequence, user_id, created_by) 
  SELECT 'Completed', '#10b981', 3, p_user_id, p_user_id
  WHERE NOT EXISTS (SELECT 1 FROM public.job_statuses WHERE user_id = p_user_id AND name = 'Completed');
  
  INSERT INTO public.job_statuses (name, color, sequence, user_id, created_by) 
  SELECT 'Cancelled', '#ef4444', 4, p_user_id, p_user_id
  WHERE NOT EXISTS (SELECT 1 FROM public.job_statuses WHERE user_id = p_user_id AND name = 'Cancelled');
  
  INSERT INTO public.job_statuses (name, color, sequence, user_id, created_by) 
  SELECT 'On Hold', '#6b7280', 5, p_user_id, p_user_id
  WHERE NOT EXISTS (SELECT 1 FROM public.job_statuses WHERE user_id = p_user_id AND name = 'On Hold');

  -- Delete only niche-specific data, NOT lead sources
  DELETE FROM public.products WHERE user_id = p_user_id;
  DELETE FROM public.tags WHERE user_id = p_user_id;
  DELETE FROM public.job_types WHERE user_id = p_user_id;
  -- DO NOT DELETE lead_sources - they should be universal
  -- DO NOT DELETE payment_methods - they are universal
  -- DO NOT DELETE job_statuses - we want to keep them

  -- Insert niche-specific data based on business type
  IF p_business_niche = 'Appliance Repair' THEN
    -- Appliance Repair Products
    INSERT INTO public.products (name, description, price, category, user_id, created_by, cost, taxable) VALUES
    ('Refrigerator Compressor', 'Replacement compressor for refrigerators', 350.00, 'Parts', p_user_id, p_user_id, 280.00, true),
    ('Refrigerator Door Seal', 'Door seal gasket replacement', 75.00, 'Parts', p_user_id, p_user_id, 50.00, true),
    ('Washer Pump', 'Water pump for washing machines', 85.00, 'Parts', p_user_id, p_user_id, 60.00, true),
    ('Dryer Heating Element', 'Heating element for electric dryers', 125.00, 'Parts', p_user_id, p_user_id, 90.00, true),
    ('Dishwasher Pump', 'Water circulation pump for dishwashers', 145.00, 'Parts', p_user_id, p_user_id, 110.00, true),
    ('Diagnostic Fee', 'Appliance diagnostic service', 85.00, 'Service', p_user_id, p_user_id, 0.00, false),
    ('Labor - Basic Repair', 'Basic appliance repair labor', 125.00, 'Service', p_user_id, p_user_id, 0.00, false),
    ('Installation Service', 'Appliance installation service', 150.00, 'Service', p_user_id, p_user_id, 0.00, false),
    ('Emergency Service', 'Emergency appliance repair', 225.00, 'Service', p_user_id, p_user_id, 0.00, false),
    ('Haul Away Service', 'Old appliance removal', 50.00, 'Service', p_user_id, p_user_id, 0.00, false);
    
    -- Appliance Repair Tags
    INSERT INTO public.tags (name, category, color, user_id, created_by) VALUES
    ('Refrigerator', 'Appliance', '#3b82f6', p_user_id, p_user_id),
    ('Washer', 'Appliance', '#10b981', p_user_id, p_user_id),
    ('Dryer', 'Appliance', '#8b5cf6', p_user_id, p_user_id),
    ('Dishwasher', 'Appliance', '#f59e0b', p_user_id, p_user_id),
    ('Oven', 'Appliance', '#ef4444', p_user_id, p_user_id),
    ('Microwave', 'Appliance', '#f97316', p_user_id, p_user_id),
    ('Repair', 'Service', '#14b8a6', p_user_id, p_user_id),
    ('Installation', 'Service', '#6366f1', p_user_id, p_user_id),
    ('Maintenance', 'Service', '#06b6d4', p_user_id, p_user_id),
    ('Emergency', 'Priority', '#dc2626', p_user_id, p_user_id),
    ('Warranty', 'Service', '#10b981', p_user_id, p_user_id),
    ('Same Day', 'Priority', '#f97316', p_user_id, p_user_id);
    
    -- Appliance Repair Job Types
    INSERT INTO public.job_types (name, description, color, user_id, created_by) VALUES
    ('Diagnostic', 'Diagnose appliance issues', '#3b82f6', p_user_id, p_user_id),
    ('Repair', 'Fix broken appliances', '#ef4444', p_user_id, p_user_id),
    ('Installation', 'Install new appliances', '#8b5cf6', p_user_id, p_user_id),
    ('Maintenance', 'Preventive maintenance service', '#10b981', p_user_id, p_user_id),
    ('Part Replacement', 'Replace specific parts', '#f59e0b', p_user_id, p_user_id),
    ('Emergency Repair', 'Urgent repair service', '#dc2626', p_user_id, p_user_id);

  ELSIF p_business_niche = 'HVAC Services' THEN
    -- HVAC Products
    INSERT INTO public.products (name, description, price, category, user_id, created_by, cost, taxable) VALUES
    ('AC Capacitor', 'Air conditioning capacitor replacement', 125.00, 'Parts', p_user_id, p_user_id, 85.00, true),
    ('Blower Motor', 'HVAC blower motor replacement', 325.00, 'Parts', p_user_id, p_user_id, 250.00, true),
    ('Standard Air Filter', 'Standard HVAC air filter', 15.00, 'Parts', p_user_id, p_user_id, 8.00, true),
    ('Thermostat - Smart', 'Smart programmable thermostat', 325.00, 'Parts', p_user_id, p_user_id, 200.00, true),
    ('Refrigerant R410A', 'AC refrigerant per pound', 125.00, 'Materials', p_user_id, p_user_id, 75.00, true),
    ('AC Tune-Up', 'Complete AC system maintenance', 175.00, 'Service', p_user_id, p_user_id, 0.00, false),
    ('Duct Cleaning', 'Professional air duct cleaning', 425.00, 'Service', p_user_id, p_user_id, 0.00, false),
    ('System Installation', 'New HVAC system installation', 2500.00, 'Service', p_user_id, p_user_id, 0.00, false),
    ('Emergency Repair', 'Emergency HVAC service', 325.00, 'Service', p_user_id, p_user_id, 0.00, false),
    ('Maintenance Plan', 'Annual HVAC maintenance plan', 325.00, 'Service', p_user_id, p_user_id, 0.00, false);
    
    -- HVAC Tags
    INSERT INTO public.tags (name, category, color, user_id, created_by) VALUES
    ('AC Repair', 'Service', '#3b82f6', p_user_id, p_user_id),
    ('Heating', 'Service', '#ef4444', p_user_id, p_user_id),
    ('Ventilation', 'Service', '#10b981', p_user_id, p_user_id),
    ('Installation', 'Service', '#8b5cf6', p_user_id, p_user_id),
    ('Maintenance', 'Service', '#f59e0b', p_user_id, p_user_id),
    ('Duct Cleaning', 'Service', '#f97316', p_user_id, p_user_id),
    ('Filter Change', 'Service', '#6366f1', p_user_id, p_user_id),
    ('Thermostat', 'Component', '#14b8a6', p_user_id, p_user_id),
    ('Emergency', 'Priority', '#dc2626', p_user_id, p_user_id),
    ('Energy Audit', 'Service', '#10b981', p_user_id, p_user_id),
    ('Seasonal', 'Type', '#06b6d4', p_user_id, p_user_id);
    
    -- HVAC Job Types
    INSERT INTO public.job_types (name, description, color, user_id, created_by) VALUES
    ('AC Service', 'Service air conditioning unit', '#3b82f6', p_user_id, p_user_id),
    ('Heating Service', 'Service heating system', '#ef4444', p_user_id, p_user_id),
    ('Installation', 'Install new HVAC system', '#8b5cf6', p_user_id, p_user_id),
    ('Duct Service', 'Clean or repair ductwork', '#f97316', p_user_id, p_user_id),
    ('Maintenance', 'Seasonal maintenance', '#10b981', p_user_id, p_user_id),
    ('Emergency Repair', 'Emergency HVAC service', '#dc2626', p_user_id, p_user_id);

  ELSIF p_business_niche = 'Plumbing Services' THEN
    -- Plumbing Products
    INSERT INTO public.products (name, description, price, category, user_id, created_by, cost, taxable) VALUES
    ('Kitchen Faucet', 'Standard kitchen faucet', 225.00, 'Fixtures', p_user_id, p_user_id, 150.00, true),
    ('Toilet - Standard', 'Standard efficiency toilet', 325.00, 'Fixtures', p_user_id, p_user_id, 200.00, true),
    ('Water Heater - 40 Gal', '40 gallon water heater', 825.00, 'Equipment', p_user_id, p_user_id, 550.00, true),
    ('P-Trap', 'Sink drain P-trap', 15.00, 'Parts', p_user_id, p_user_id, 8.00, true),
    ('Copper Pipe 1/2"', 'Half inch copper pipe per foot', 4.50, 'Materials', p_user_id, p_user_id, 2.50, true),
    ('Drain Cleaning', 'Professional drain cleaning service', 225.00, 'Service', p_user_id, p_user_id, 0.00, false),
    ('Leak Detection', 'Water leak detection service', 275.00, 'Service', p_user_id, p_user_id, 0.00, false),
    ('Water Heater Install', 'Water heater installation', 425.00, 'Service', p_user_id, p_user_id, 0.00, false),
    ('Emergency Service', 'Emergency plumbing service', 325.00, 'Service', p_user_id, p_user_id, 0.00, false);
    
    -- Plumbing Tags
    INSERT INTO public.tags (name, category, color, user_id, created_by) VALUES
    ('Leak Repair', 'Service', '#3b82f6', p_user_id, p_user_id),
    ('Drain Cleaning', 'Service', '#10b981', p_user_id, p_user_id),
    ('Water Heater', 'Service', '#ef4444', p_user_id, p_user_id),
    ('Toilet Repair', 'Service', '#8b5cf6', p_user_id, p_user_id),
    ('Faucet Install', 'Service', '#f59e0b', p_user_id, p_user_id),
    ('Pipe Repair', 'Service', '#f97316', p_user_id, p_user_id),
    ('Sewer Line', 'Service', '#6366f1', p_user_id, p_user_id),
    ('Emergency', 'Priority', '#dc2626', p_user_id, p_user_id),
    ('Preventive', 'Type', '#10b981', p_user_id, p_user_id),
    ('Commercial', 'Type', '#14b8a6', p_user_id, p_user_id),
    ('Residential', 'Type', '#06b6d4', p_user_id, p_user_id);
    
    -- Plumbing Job Types
    INSERT INTO public.job_types (name, description, color, user_id, created_by) VALUES
    ('Leak Repair', 'Fix water leaks', '#3b82f6', p_user_id, p_user_id),
    ('Drain Service', 'Clear clogged drains', '#10b981', p_user_id, p_user_id),
    ('Water Heater', 'Service or install water heater', '#ef4444', p_user_id, p_user_id),
    ('Fixture Install', 'Install plumbing fixtures', '#8b5cf6', p_user_id, p_user_id),
    ('Pipe Repair', 'Repair or replace pipes', '#f97316', p_user_id, p_user_id),
    ('Emergency', '24/7 emergency plumbing', '#dc2626', p_user_id, p_user_id);

  ELSIF p_business_niche = 'Electrical Services' THEN
    -- Electrical Products
    INSERT INTO public.products (name, description, price, category, user_id, created_by, cost, taxable) VALUES
    ('Circuit Breaker 20A', '20 amp circuit breaker', 45.00, 'Parts', p_user_id, p_user_id, 25.00, true),
    ('GFCI Outlet', 'Ground fault circuit interrupter outlet', 25.00, 'Parts', p_user_id, p_user_id, 15.00, true),
    ('Dimmer Switch', 'LED compatible dimmer switch', 35.00, 'Parts', p_user_id, p_user_id, 20.00, true),
    ('Romex 12-2 Wire', '12-2 Romex wire 250ft roll', 125.00, 'Materials', p_user_id, p_user_id, 85.00, true),
    ('Recessed Light', 'LED recessed light fixture', 45.00, 'Fixtures', p_user_id, p_user_id, 25.00, true),
    ('Panel Upgrade', 'Electrical panel upgrade service', 1825.00, 'Service', p_user_id, p_user_id, 0.00, false),
    ('Outlet Installation', 'Install new electrical outlet', 125.00, 'Service', p_user_id, p_user_id, 0.00, false),
    ('Troubleshooting', 'Electrical troubleshooting per hour', 175.00, 'Service', p_user_id, p_user_id, 0.00, false),
    ('Emergency Service', 'Emergency electrical service', 325.00, 'Service', p_user_id, p_user_id, 0.00, false);
    
    -- Electrical Tags
    INSERT INTO public.tags (name, category, color, user_id, created_by) VALUES
    ('Panel Upgrade', 'Service', '#3b82f6', p_user_id, p_user_id),
    ('Outlet Install', 'Service', '#10b981', p_user_id, p_user_id),
    ('Lighting', 'Service', '#f59e0b', p_user_id, p_user_id),
    ('Wiring', 'Service', '#8b5cf6', p_user_id, p_user_id),
    ('Circuit Repair', 'Service', '#ef4444', p_user_id, p_user_id),
    ('Switch Install', 'Service', '#f97316', p_user_id, p_user_id),
    ('GFCI', 'Component', '#6366f1', p_user_id, p_user_id),
    ('Emergency', 'Priority', '#dc2626', p_user_id, p_user_id),
    ('Safety Check', 'Service', '#10b981', p_user_id, p_user_id),
    ('Smart Home', 'Type', '#14b8a6', p_user_id, p_user_id),
    ('Commercial', 'Type', '#06b6d4', p_user_id, p_user_id);
    
    -- Electrical Job Types
    INSERT INTO public.job_types (name, description, color, user_id, created_by) VALUES
    ('Troubleshooting', 'Diagnose electrical issues', '#3b82f6', p_user_id, p_user_id),
    ('Panel Service', 'Service or upgrade panel', '#8b5cf6', p_user_id, p_user_id),
    ('Wiring', 'Install or repair wiring', '#f97316', p_user_id, p_user_id),
    ('Outlet/Switch', 'Install outlets or switches', '#10b981', p_user_id, p_user_id),
    ('Lighting', 'Install lighting fixtures', '#f59e0b', p_user_id, p_user_id),
    ('Emergency', 'Emergency electrical service', '#dc2626', p_user_id, p_user_id);

  ELSIF p_business_niche = 'Garage Door Services' THEN
    -- Garage Door Products
    INSERT INTO public.products (name, description, price, category, user_id, created_by, cost, taxable) VALUES
    ('Torsion Spring', 'Garage door torsion spring', 125.00, 'Parts', p_user_id, p_user_id, 75.00, true),
    ('Extension Spring', 'Garage door extension spring pair', 85.00, 'Parts', p_user_id, p_user_id, 50.00, true),
    ('Chain Drive Opener', 'Chain drive garage door opener', 325.00, 'Equipment', p_user_id, p_user_id, 200.00, true),
    ('Opener Remote', 'Garage door opener remote', 45.00, 'Parts', p_user_id, p_user_id, 25.00, true),
    ('Safety Sensor Set', 'Safety sensor pair', 85.00, 'Parts', p_user_id, p_user_id, 50.00, true),
    ('Spring Replacement', 'Garage door spring replacement', 275.00, 'Service', p_user_id, p_user_id, 0.00, false),
    ('Opener Installation', 'Garage door opener installation', 225.00, 'Service', p_user_id, p_user_id, 0.00, false),
    ('Track Alignment', 'Garage door track alignment', 175.00, 'Service', p_user_id, p_user_id, 0.00, false),
    ('Emergency Service', 'Emergency garage door service', 325.00, 'Service', p_user_id, p_user_id, 0.00, false);
    
    -- Garage Door Tags
    INSERT INTO public.tags (name, category, color, user_id, created_by) VALUES
    ('Residential', 'Type', '#3b82f6', p_user_id, p_user_id),
    ('Commercial', 'Type', '#8b5cf6', p_user_id, p_user_id),
    ('Spring Repair', 'Service', '#ef4444', p_user_id, p_user_id),
    ('Motor Replacement', 'Service', '#10b981', p_user_id, p_user_id),
    ('Track Alignment', 'Service', '#f59e0b', p_user_id, p_user_id),
    ('Sensor Adjustment', 'Service', '#f97316', p_user_id, p_user_id),
    ('Remote Programming', 'Service', '#6366f1', p_user_id, p_user_id),
    ('Installation', 'Service', '#14b8a6', p_user_id, p_user_id),
    ('Maintenance', 'Service', '#06b6d4', p_user_id, p_user_id),
    ('Emergency', 'Priority', '#dc2626', p_user_id, p_user_id),
    ('Safety Inspection', 'Service', '#10b981', p_user_id, p_user_id);
    
    -- Garage Door Job Types
    INSERT INTO public.job_types (name, description, color, user_id, created_by) VALUES
    ('Spring Repair', 'Replace or repair springs', '#ef4444', p_user_id, p_user_id),
    ('Motor Service', 'Repair or replace opener motor', '#10b981', p_user_id, p_user_id),
    ('Installation', 'Install new garage door', '#8b5cf6', p_user_id, p_user_id),
    ('Track Repair', 'Fix or align door tracks', '#f59e0b', p_user_id, p_user_id),
    ('Sensor Service', 'Adjust or replace safety sensors', '#f97316', p_user_id, p_user_id),
    ('Emergency Service', '24/7 emergency repairs', '#dc2626', p_user_id, p_user_id);

  ELSE -- Default for General Handyman and other business types
    -- General Handyman Products
    INSERT INTO public.products (name, description, price, category, user_id, created_by, cost, taxable) VALUES
    ('Hourly Rate', 'General handyman hourly rate', 85.00, 'Service', p_user_id, p_user_id, 0.00, false),
    ('Minimum Service', 'Minimum service call', 125.00, 'Service', p_user_id, p_user_id, 0.00, false),
    ('Emergency Call', 'Emergency handyman service', 225.00, 'Service', p_user_id, p_user_id, 0.00, false),
    ('Project Consultation', 'Project consultation per hour', 95.00, 'Service', p_user_id, p_user_id, 0.00, false),
    ('Drywall Sheet', 'Standard drywall sheet', 15.00, 'Materials', p_user_id, p_user_id, 8.00, true),
    ('Interior Paint', 'Interior paint per gallon', 35.00, 'Materials', p_user_id, p_user_id, 20.00, true),
    ('Wood Stud 2x4', '2x4 wood stud', 8.50, 'Materials', p_user_id, p_user_id, 5.00, true);
    
    -- General Handyman Tags
    INSERT INTO public.tags (name, category, color, user_id, created_by) VALUES
    ('Drywall', 'Service', '#3b82f6', p_user_id, p_user_id),
    ('Painting', 'Service', '#10b981', p_user_id, p_user_id),
    ('Carpentry', 'Service', '#8b5cf6', p_user_id, p_user_id),
    ('Assembly', 'Service', '#f59e0b', p_user_id, p_user_id),
    ('Mounting', 'Service', '#ef4444', p_user_id, p_user_id),
    ('Repair', 'Service', '#f97316', p_user_id, p_user_id),
    ('Maintenance', 'Service', '#6366f1', p_user_id, p_user_id),
    ('Small Job', 'Type', '#14b8a6', p_user_id, p_user_id),
    ('Emergency', 'Priority', '#dc2626', p_user_id, p_user_id),
    ('Indoor', 'Location', '#06b6d4', p_user_id, p_user_id),
    ('Outdoor', 'Location', '#10b981', p_user_id, p_user_id);
    
    -- General Handyman Job Types
    INSERT INTO public.job_types (name, description, color, user_id, created_by) VALUES
    ('General Repair', 'Various home repairs', '#3b82f6', p_user_id, p_user_id),
    ('Assembly', 'Furniture or equipment assembly', '#f59e0b', p_user_id, p_user_id),
    ('Drywall', 'Drywall repair or installation', '#8b5cf6', p_user_id, p_user_id),
    ('Painting', 'Interior or exterior painting', '#10b981', p_user_id, p_user_id),
    ('Carpentry', 'Wood work and repairs', '#f97316', p_user_id, p_user_id),
    ('Maintenance', 'Regular home maintenance', '#6366f1', p_user_id, p_user_id);
  END IF;

  -- Initialize universal lead sources ONLY if the user doesn't have any yet (for new users)
  -- These should NOT change when niche changes
  IF NOT EXISTS (SELECT 1 FROM public.lead_sources WHERE user_id = p_user_id) THEN
    INSERT INTO public.lead_sources (name, user_id) VALUES
    ('Google', p_user_id),
    ('Facebook', p_user_id),
    ('Instagram', p_user_id),
    ('HomeAdvisor', p_user_id),
    ('Angie''s List', p_user_id),
    ('Thumbtack', p_user_id),
    ('Nextdoor', p_user_id),
    ('Yelp', p_user_id),
    ('Website', p_user_id),
    ('Referral', p_user_id),
    ('Phone Call', p_user_id),
    ('Email', p_user_id),
    ('Walk-in', p_user_id),
    ('Repeat Customer', p_user_id),
    ('Flyer/Advertisement', p_user_id),
    ('Trade Show', p_user_id),
    ('Other', p_user_id);
  END IF;

  -- Initialize payment methods ONLY if the user doesn't have any yet (for new users)
  -- These should NOT change when niche changes
  IF NOT EXISTS (SELECT 1 FROM public.payment_methods WHERE user_id = p_user_id) THEN
    INSERT INTO public.payment_methods (name, color, user_id) VALUES
    ('Cash', '#10b981', p_user_id),
    ('Check', '#3b82f6', p_user_id),
    ('Credit Card', '#8b5cf6', p_user_id),
    ('Debit Card', '#06b6d4', p_user_id),
    ('ACH Transfer', '#f59e0b', p_user_id),
    ('Financing', '#ec4899', p_user_id),
    ('Venmo', '#3d95ce', p_user_id),
    ('Zelle', '#6d1ed4', p_user_id);
  END IF;

  RAISE NOTICE 'Successfully initialized user data for % with niche % - Lead sources kept universal', p_user_id, p_business_niche;
END;
$function$;
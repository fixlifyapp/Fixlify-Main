-- Migration to add business niche specific products to users
-- This will add products based on the user's business_niche from their profile

DO $$
DECLARE
    user_record RECORD;
    product_record RECORD;
    niche_products JSON;
BEGIN
    -- Loop through all users with a business niche
    FOR user_record IN 
        SELECT p.id as user_id, p.business_niche
        FROM profiles p
        WHERE p.business_niche IS NOT NULL
    LOOP
        -- Define products for each niche
        niche_products := CASE user_record.business_niche
            WHEN 'Deck Builder' THEN '[
                {"name": "Pressure Treated Lumber 2x6", "description": "16ft pressure treated deck boards", "category": "Materials", "price": 24.99, "cost": 18.50, "ourprice": 20.00, "taxable": true, "tags": ["lumber", "deck", "materials"]},
                {"name": "Composite Decking Board", "description": "16ft composite deck board - gray", "category": "Materials", "price": 42.99, "cost": 32.00, "ourprice": 35.00, "taxable": true, "tags": ["composite", "deck", "materials"]},
                {"name": "Deck Screws 3in Box", "description": "Box of 100 coated deck screws", "category": "Materials", "price": 28.99, "cost": 18.00, "ourprice": 22.00, "taxable": true, "tags": ["fasteners", "deck", "materials"]},
                {"name": "Deck Design Consultation", "description": "Professional deck design and planning", "category": "Service", "price": 299.00, "cost": 100.00, "ourprice": 150.00, "taxable": true, "tags": ["consultation", "design", "service"]},
                {"name": "Deck Installation", "description": "Complete deck installation per sq ft", "category": "Service", "price": 45.00, "cost": 25.00, "ourprice": 30.00, "taxable": true, "tags": ["installation", "labor", "service"]}
            ]'::JSON
            WHEN 'Drain Repair' THEN '[
                {"name": "Drain Cleaning", "description": "Professional drain cleaning service", "category": "Service", "price": 189.00, "cost": 60.00, "ourprice": 80.00, "taxable": true, "tags": ["cleaning", "drain", "service"]},
                {"name": "Video Camera Inspection", "description": "Drain line video inspection", "category": "Service", "price": 299.00, "cost": 100.00, "ourprice": 125.00, "taxable": true, "tags": ["inspection", "camera", "diagnostic"]},
                {"name": "Hydro Jetting", "description": "High pressure drain cleaning", "category": "Service", "price": 450.00, "cost": 150.00, "ourprice": 200.00, "taxable": true, "tags": ["hydro-jet", "cleaning", "service"]},
                {"name": "P-Trap Assembly", "description": "Complete P-trap kit", "category": "Parts", "price": 24.99, "cost": 12.00, "ourprice": 15.00, "taxable": true, "tags": ["p-trap", "plumbing", "parts"]},
                {"name": "Drain Snake 25ft", "description": "Professional grade drain snake", "category": "Equipment", "price": 89.99, "cost": 45.00, "ourprice": 55.00, "taxable": true, "tags": ["snake", "tool", "equipment"]}
            ]'::JSON
            WHEN 'Electrical Services' THEN '[
                {"name": "Electrical Inspection", "description": "Complete electrical system inspection", "category": "Service", "price": 249.00, "cost": 75.00, "ourprice": 100.00, "taxable": true, "tags": ["inspection", "safety", "service"]},
                {"name": "Outlet Installation", "description": "Install new electrical outlet", "category": "Installation", "price": 189.00, "cost": 60.00, "ourprice": 80.00, "taxable": true, "tags": ["outlet", "installation", "service"]},
                {"name": "Circuit Breaker Replacement", "description": "Replace faulty circuit breaker", "category": "Service", "price": 225.00, "cost": 85.00, "ourprice": 110.00, "taxable": true, "tags": ["breaker", "repair", "service"]},
                {"name": "GFCI Outlet", "description": "Ground fault circuit interrupter outlet", "category": "Parts", "price": 24.99, "cost": 12.00, "ourprice": 15.00, "taxable": true, "tags": ["gfci", "outlet", "parts"]},
                {"name": "14 AWG Wire", "description": "14 gauge electrical wire per 100ft", "category": "Materials", "price": 89.99, "cost": 45.00, "ourprice": 55.00, "taxable": true, "tags": ["wire", "14awg", "materials"]}
            ]'::JSON
            WHEN 'Moving Services' THEN '[
                {"name": "Local Moving - 2 Movers", "description": "2 movers with truck for local move", "category": "Service", "price": 149.00, "cost": 70.00, "ourprice": 85.00, "taxable": true, "tags": ["local", "moving", "labor"]},
                {"name": "Local Moving - 3 Movers", "description": "3 movers with truck for local move", "category": "Service", "price": 199.00, "cost": 95.00, "ourprice": 115.00, "taxable": true, "tags": ["local", "moving", "labor"]},
                {"name": "Packing Service", "description": "Professional packing service per hour", "category": "Service", "price": 65.00, "cost": 25.00, "ourprice": 35.00, "taxable": true, "tags": ["packing", "service", "labor"]},
                {"name": "Moving Box - Medium", "description": "Medium moving box 18x18x16", "category": "Materials", "price": 3.99, "cost": 1.80, "ourprice": 2.20, "taxable": true, "tags": ["box", "packing", "supplies"]},
                {"name": "Bubble Wrap Roll", "description": "Bubble wrap 12in x 100ft", "category": "Materials", "price": 24.99, "cost": 12.00, "ourprice": 15.00, "taxable": true, "tags": ["bubble-wrap", "packing", "protection"]}
            ]'::JSON
            WHEN 'Plumbing Services' THEN '[
                {"name": "Drain Cleaning", "description": "Professional drain cleaning service", "category": "Service", "price": 189.00, "cost": 60.00, "ourprice": 80.00, "taxable": true, "tags": ["drain", "cleaning", "service"]},
                {"name": "Leak Detection", "description": "Electronic leak detection service", "category": "Service", "price": 299.00, "cost": 100.00, "ourprice": 125.00, "taxable": true, "tags": ["leak", "detection", "diagnostic"]},
                {"name": "Water Heater Install", "description": "Tank water heater installation", "category": "Installation", "price": 899.00, "cost": 400.00, "ourprice": 500.00, "taxable": true, "tags": ["water-heater", "installation", "service"]},
                {"name": "Kitchen Faucet", "description": "Single handle kitchen faucet", "category": "Fixtures", "price": 189.99, "cost": 95.00, "ourprice": 115.00, "taxable": true, "tags": ["faucet", "kitchen", "fixture"]},
                {"name": "P-Trap Assembly", "description": "Complete P-trap kit", "category": "Parts", "price": 24.99, "cost": 12.00, "ourprice": 15.00, "taxable": true, "tags": ["p-trap", "drain", "parts"]}
            ]'::JSON
            WHEN 'Waterproofing' THEN '[
                {"name": "Foundation Waterproofing", "description": "Exterior foundation waterproofing per ft", "category": "Service", "price": 125.00, "cost": 55.00, "ourprice": 70.00, "taxable": true, "tags": ["foundation", "exterior", "waterproofing"]},
                {"name": "Basement Inspection", "description": "Complete basement moisture inspection", "category": "Service", "price": 299.00, "cost": 100.00, "ourprice": 125.00, "taxable": true, "tags": ["inspection", "basement", "diagnostic"]},
                {"name": "Sump Pump Installation", "description": "Install sump pump system complete", "category": "Installation", "price": 1499.00, "cost": 650.00, "ourprice": 825.00, "taxable": true, "tags": ["sump-pump", "installation", "drainage"]},
                {"name": "Waterproofing Membrane", "description": "Rubberized asphalt membrane per sq ft", "category": "Materials", "price": 4.99, "cost": 2.50, "ourprice": 3.00, "taxable": true, "tags": ["membrane", "materials", "waterproofing"]},
                {"name": "Hydraulic Cement", "description": "50lb bag quick-set hydraulic cement", "category": "Materials", "price": 24.99, "cost": 12.00, "ourprice": 15.00, "taxable": true, "tags": ["cement", "hydraulic", "materials"]}
            ]'::JSON
            ELSE NULL
        END;

        -- Only process if we have products for this niche
        IF niche_products IS NOT NULL THEN
            -- Insert products for this user
            FOR product_record IN SELECT * FROM json_array_elements(niche_products)
            LOOP
                -- Check if product already exists for this user
                IF NOT EXISTS (
                    SELECT 1 FROM products 
                    WHERE name = product_record.value->>'name' 
                    AND user_id = user_record.user_id
                ) THEN
                    INSERT INTO products (
                        name, description, category, price, cost, ourprice, 
                        taxable, tags, user_id, created_by
                    ) VALUES (
                        product_record.value->>'name',
                        product_record.value->>'description',
                        product_record.value->>'category',
                        (product_record.value->>'price')::numeric,
                        (product_record.value->>'cost')::numeric,
                        (product_record.value->>'ourprice')::numeric,
                        (product_record.value->>'taxable')::boolean,
                        ARRAY(SELECT json_array_elements_text(product_record.value->'tags')),
                        user_record.user_id,
                        user_record.user_id
                    );
                END IF;
            END LOOP;
        END IF;
    END LOOP;
END $$;

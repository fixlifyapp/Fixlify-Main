-- Fix: Ensure Starter and Basic have 0 bonus (corrects bug from previous migration)
UPDATE credit_packages SET bonus_credits = 0 WHERE name IN ('Starter', 'Basic');

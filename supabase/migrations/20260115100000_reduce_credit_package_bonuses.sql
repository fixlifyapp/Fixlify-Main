-- Reduce credit package bonuses as requested
-- Popular: 60 -> 30 (half)
-- Value: 200 -> 100 (half)
-- Pro: 500 -> 250 (half)
-- Business: 2000 -> 1000 (half)

-- Fix: Only update Popular (300 credits), not Starter
UPDATE credit_packages SET bonus_credits = 30 WHERE name = 'Popular' OR credits = 300;
UPDATE credit_packages SET bonus_credits = 100 WHERE name = 'Value' OR credits = 700;
UPDATE credit_packages SET bonus_credits = 250 WHERE name = 'Pro' OR credits = 1500;
UPDATE credit_packages SET bonus_credits = 1000 WHERE name = 'Business' OR credits = 5000;

-- Ensure Starter and Basic have 0 bonus (fix any accidental changes)
UPDATE credit_packages SET bonus_credits = 0 WHERE name IN ('Starter', 'Basic');

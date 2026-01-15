-- Reduce credit package bonuses as requested
-- Business: 2000 -> 1000 (half)
-- Pro: 500 -> 250 (half)
-- Value: 200 -> 100 (half)
-- Popular: 60 -> 30 (half for consistency)

UPDATE credit_packages SET bonus_credits = 30 WHERE name = 'Starter' OR credits = 300;
UPDATE credit_packages SET bonus_credits = 100 WHERE name = 'Value' OR credits = 700;
UPDATE credit_packages SET bonus_credits = 250 WHERE name = 'Pro' OR credits = 1500;
UPDATE credit_packages SET bonus_credits = 1000 WHERE name = 'Business' OR credits = 5000;

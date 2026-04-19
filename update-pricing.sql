-- Update pricing in subscription_plans table
UPDATE subscription_plans 
SET price = 19 
WHERE name = 'Starter';

UPDATE subscription_plans 
SET price = 49 
WHERE name = 'Growth';

UPDATE subscription_plans 
SET price = 99 
WHERE name = 'Enterprise';

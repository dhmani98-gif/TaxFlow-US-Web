-- Update existing subscription plans in the database
-- This will update plans to ensure all 3 tiers have correct prices, features, and LemonSqueezy checkout URLs

-- Update Starter plan
UPDATE subscription_plans 
SET 
  id = '550e8400-e29b-41d4-a716-446655440001',
  price = 19,
  billing_period = 'mo',
  features = '["Up to 100 transactions/month", "Basic tax calculation", "1 store connection", "Email support", "Standard reports"]'::jsonb,
  is_featured = false,
  checkout_url = 'https://taxflow.lemonsqueezy.com/checkout/buy/c8c67f51-f003-455f-ae74-fd5098c05d13'
WHERE name = 'Starter';

-- Update Growth plan
UPDATE subscription_plans 
SET 
  id = '550e8400-e29b-41d4-a716-446655440002',
  price = 29,
  billing_period = 'mo',
  features = '["Unlimited transactions", "QuickBooks & Xero sync", "Advanced Nexus monitoring", "IRS-ready Schedule C", "Priority support"]'::jsonb,
  is_featured = true,
  checkout_url = 'https://taxflow.lemonsqueezy.com/checkout/buy/b189330c-85be-4f01-9cee-a4740d9d7567'
WHERE name = 'Growth';

-- Update Enterprise plan
UPDATE subscription_plans 
SET 
  id = '550e8400-e29b-41d4-a716-446655440003',
  price = 69,
  billing_period = 'mo',
  features = '["Unlimited transactions", "Multi-currency support", "Dedicated account manager", "Custom integrations", "24/7 phone support"]'::jsonb,
  is_featured = false,
  checkout_url = 'https://taxflow.lemonsqueezy.com/checkout/buy/e9e4e4cb-da7e-496c-928b-8343e330459a'
WHERE name = 'Enterprise';

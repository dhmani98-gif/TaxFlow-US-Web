-- Ensure all subscription plans exist in the database
-- This will insert or update plans to ensure all 3 tiers are available

-- Insert or update Starter plan
INSERT INTO subscription_plans (id, name, price, billing_period, features, is_featured)
VALUES ('1', 'Starter', 19, 'mo', 
  ARRAY['Up to 100 transactions/month', 'Basic tax calculation', '1 store connection', 'Email support', 'Standard reports'],
  false)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  billing_period = EXCLUDED.billing_period,
  features = EXCLUDED.features,
  is_featured = EXCLUDED.is_featured;

-- Insert or update Growth plan
INSERT INTO subscription_plans (id, name, price, billing_period, features, is_featured)
VALUES ('2', 'Growth', 49, 'mo',
  ARRAY['Unlimited transactions', 'QuickBooks & Xero sync', 'Advanced Nexus monitoring', 'IRS-ready Schedule C', 'Priority support'],
  true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  billing_period = EXCLUDED.billing_period,
  features = EXCLUDED.features,
  is_featured = EXCLUDED.is_featured;

-- Insert or update Enterprise plan
INSERT INTO subscription_plans (id, name, price, billing_period, features, is_featured)
VALUES ('3', 'Enterprise', 99, 'mo',
  ARRAY['Unlimited transactions', 'Multi-currency support', 'Dedicated account manager', 'Custom integrations', '24/7 phone support'],
  false)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  billing_period = EXCLUDED.billing_period,
  features = EXCLUDED.features,
  is_featured = EXCLUDED.is_featured;

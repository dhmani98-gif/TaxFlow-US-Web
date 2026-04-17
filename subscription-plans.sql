-- ============================================
-- Subscription Plans Table
-- ============================================

CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL UNIQUE,
  price DECIMAL(10, 2) NOT NULL,
  billing_period VARCHAR(20) NOT NULL DEFAULT 'mo',
  features JSONB NOT NULL,
  max_transactions INTEGER,
  max_connections INTEGER,
  nexus_monitoring_level VARCHAR(20) DEFAULT 'basic',
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default plans
INSERT INTO subscription_plans (name, price, billing_period, features, max_transactions, max_connections, nexus_monitoring_level, is_featured) VALUES
(
  'Starter',
  29.00,
  'mo',
  '["Up to 500 transactions/mo", "Basic Nexus monitoring", "1 Shopify store connection", "Email support"]'::jsonb,
  500,
  1,
  'basic',
  FALSE
),
(
  'Growth',
  79.00,
  'mo',
  '["Unlimited transactions", "Advanced Nexus Sentinel", "Amazon, Shopify & Stripe", "IRS-ready Schedule C", "Priority CPA support"]'::jsonb,
  NULL,
  3,
  'advanced',
  TRUE
);

-- RLS for subscription_plans
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view subscription plans"
  ON subscription_plans FOR SELECT
  USING (TRUE);

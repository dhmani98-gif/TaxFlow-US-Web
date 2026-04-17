-- ============================================
-- Complete TaxFlow Database Schema for Supabase
-- ============================================

-- ============================================
-- Profiles Table
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE,
  display_name TEXT,
  business_name TEXT,
  tax_id TEXT,
  business_address JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Organizations Table
-- ============================================
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Transactions Table
-- ============================================
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  transaction_date DATE NOT NULL,
  platform TEXT NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  tax_category_id UUID REFERENCES tax_categories(id) ON DELETE SET NULL,
  state_code TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Tax Categories Table
-- ============================================
CREATE TABLE IF NOT EXISTS tax_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  keywords TEXT[] NOT NULL,
  schedule_c_line INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default tax categories
INSERT INTO tax_categories (name, keywords, schedule_c_line) VALUES
('Advertising', ARRAY['ad', 'ads', 'marketing', 'promotion', 'facebook ads', 'google ads'], 8),
('Auto Expenses', ARRAY['gas', 'fuel', 'car', 'vehicle', 'maintenance', 'repair', 'insurance'], 9),
('Contractors', ARRAY['contractor', 'freelancer', 'consultant', 'service provider'], 11),
('Office Expenses', ARRAY['office', 'supplies', 'equipment', 'software', 'tools'], 18),
('Rent', ARRAY['rent', 'lease', 'property'], 20),
('Travel', ARRAY['travel', 'flight', 'hotel', 'meals', 'transportation'], 24),
('Utilities', ARRAY['electricity', 'water', 'internet', 'phone', 'utilities'], 25),
('Wages', ARRAY['salary', 'wage', 'payroll', 'employee', 'compensation'], 26),
('Other Income', ARRAY['interest', 'dividend', 'refund', 'other income'], 6),
('Sales/Revenue', ARRAY['sale', 'revenue', 'income', 'payment received'], 1)
ON CONFLICT DO NOTHING;

-- ============================================
-- Connections Table
-- ============================================
CREATE TABLE IF NOT EXISTS connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  credentials JSONB,
  status TEXT DEFAULT 'active',
  last_successful_sync TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Nexus Status Table
-- ============================================
CREATE TABLE IF NOT EXISTS nexus_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  state_code TEXT NOT NULL,
  has_nexus BOOLEAN DEFAULT FALSE,
  last_checked TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Subscriptions Table
-- ============================================
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES subscription_plans(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'active',
  start_date TIMESTAMPTZ DEFAULT NOW(),
  end_date TIMESTAMPTZ,
  stripe_subscription_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Subscription Plans Table
-- ============================================
CREATE TABLE IF NOT EXISTS subscription_plans (
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
)
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- Row Level Security (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE nexus_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_categories ENABLE ROW LEVEL SECURITY;

-- Profiles RLS
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Organizations RLS
CREATE POLICY "Users can view own organizations"
  ON organizations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = profile_id AND p.id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own organizations"
  ON organizations FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = profile_id AND p.id = auth.uid()
    )
  );

CREATE POLICY "Users can update own organizations"
  ON organizations FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = profile_id AND p.id = auth.uid()
    )
  );

-- Transactions RLS
CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM organizations o
      JOIN profiles p ON p.id = o.profile_id
      WHERE o.id = org_id AND p.id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own transactions"
  ON transactions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM organizations o
      JOIN profiles p ON p.id = o.profile_id
      WHERE o.id = org_id AND p.id = auth.uid()
    )
  );

-- Connections RLS
CREATE POLICY "Users can view own connections"
  ON connections FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM organizations o
      JOIN profiles p ON p.id = o.profile_id
      WHERE o.id = org_id AND p.id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own connections"
  ON connections FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM organizations o
      JOIN profiles p ON p.id = o.profile_id
      WHERE o.id = org_id AND p.id = auth.uid()
    )
  );

CREATE POLICY "Users can update own connections"
  ON connections FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM organizations o
      JOIN profiles p ON p.id = o.profile_id
      WHERE o.id = org_id AND p.id = auth.uid()
    )
  );

-- Nexus Status RLS
CREATE POLICY "Users can view own nexus status"
  ON nexus_status FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM organizations o
      JOIN profiles p ON p.id = o.profile_id
      WHERE o.id = org_id AND p.id = auth.uid()
    )
  );

-- Subscriptions RLS
CREATE POLICY "Users can view own subscriptions"
  ON subscriptions FOR SELECT
  USING (auth.uid() = profile_id);

CREATE POLICY "Users can insert own subscriptions"
  ON subscriptions FOR INSERT
  WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can update own subscriptions"
  ON subscriptions FOR UPDATE
  USING (auth.uid() = profile_id);

-- Subscription Plans RLS (public read-only)
CREATE POLICY "Anyone can view subscription plans"
  ON subscription_plans FOR SELECT
  USING (TRUE);

-- Tax Categories RLS (public read-only)
CREATE POLICY "Anyone can view tax categories"
  ON tax_categories FOR SELECT
  USING (TRUE);

-- ============================================
-- Auto-Mapping Function
-- ============================================
CREATE OR REPLACE FUNCTION auto_map_transaction_category(description TEXT, platform TEXT)
RETURNS UUID AS $$
DECLARE
  matched_category_id UUID;
BEGIN
  SELECT id INTO matched_category_id
  FROM tax_categories
  WHERE description ILIKE ANY(keywords)
  LIMIT 1;
  
  RETURN matched_category_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Trigger for Auto-Mapping
-- ============================================
CREATE OR REPLACE FUNCTION trigger_auto_map_category()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.tax_category_id IS NULL THEN
    NEW.tax_category_id := auto_map_transaction_category(NEW.description, NEW.platform);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS auto_map_category_trigger ON transactions;
CREATE TRIGGER auto_map_category_trigger
  BEFORE INSERT ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION trigger_auto_map_category();

-- ============================================
-- Views for Report Aggregations
-- ============================================

-- View: Schedule C Summary
CREATE OR REPLACE VIEW schedule_c_summary AS
SELECT 
  t.org_id,
  SUM(CASE WHEN tc.schedule_c_line = 1 THEN t.amount ELSE 0 END) AS line_1_gross_receipts,
  SUM(CASE WHEN tc.schedule_c_line = 6 THEN t.amount ELSE 0 END) AS line_6_other_income,
  SUM(CASE WHEN t.amount > 0 THEN t.amount ELSE 0 END) AS total_income,
  SUM(CASE WHEN t.amount < 0 THEN ABS(t.amount) ELSE 0 END) AS total_expenses,
  SUM(CASE WHEN tc.schedule_c_line = 8 AND t.amount < 0 THEN ABS(t.amount) ELSE 0 END) AS line_8_advertising,
  SUM(CASE WHEN tc.schedule_c_line = 9 AND t.amount < 0 THEN ABS(t.amount) ELSE 0 END) AS line_9_auto,
  SUM(CASE WHEN tc.schedule_c_line = 11 AND t.amount < 0 THEN ABS(t.amount) ELSE 0 END) AS line_11_contractors,
  SUM(CASE WHEN tc.schedule_c_line = 18 AND t.amount < 0 THEN ABS(t.amount) ELSE 0 END) AS line_18_office,
  SUM(CASE WHEN tc.schedule_c_line = 20 AND t.amount < 0 THEN ABS(t.amount) ELSE 0 END) AS line_20_rent,
  SUM(CASE WHEN tc.schedule_c_line = 24 AND t.amount < 0 THEN ABS(t.amount) ELSE 0 END) AS line_24_travel,
  SUM(CASE WHEN tc.schedule_c_line = 25 AND t.amount < 0 THEN ABS(t.amount) ELSE 0 END) AS line_25_utilities,
  SUM(CASE WHEN tc.schedule_c_line = 26 AND t.amount < 0 THEN ABS(t.amount) ELSE 0 END) AS line_26_wages
FROM transactions t
LEFT JOIN tax_categories tc ON t.tax_category_id = tc.id
GROUP BY t.org_id;

-- View: Sales Tax by State
CREATE OR REPLACE VIEW sales_tax_by_state AS
SELECT 
  t.org_id,
  t.state_code,
  SUM(CASE WHEN t.amount > 0 THEN t.amount ELSE 0 END) AS gross_sales,
  SUM(CASE WHEN t.amount < 0 THEN ABS(t.amount) ELSE 0 END) AS refunds,
  COUNT(*) AS transaction_count,
  MIN(t.transaction_date) AS first_transaction,
  MAX(t.transaction_date) AS last_transaction
FROM transactions t
WHERE t.state_code IS NOT NULL
GROUP BY t.org_id, t.state_code;

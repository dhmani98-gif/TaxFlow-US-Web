-- ============================================
-- TaxFlow - Supabase Database Schema
-- Relational Database Design for Tax Management
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- Table: Profiles (Users)
-- ============================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  tax_id TEXT, -- Tax identification number (EIN/SSN)
  business_name TEXT,
  business_address JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- Table: Tax Categories
-- Maps expense types to IRS Schedule C line numbers
-- ============================================
CREATE TABLE tax_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  schedule_c_line INTEGER,
  description TEXT,
  keywords TEXT[], -- Array of keywords for auto-mapping
  is_deductible BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default tax categories
INSERT INTO tax_categories (name, display_name, schedule_c_line, description, keywords, is_deductible) VALUES
('advertising', 'Advertising', 8, 'Advertising and promotional expenses', ARRAY['facebook', 'google ads', 'advertising', 'marketing', 'promotion'], TRUE),
('auto_expenses', 'Car & Truck Expenses', 9, 'Vehicle-related expenses', ARRAY['gas', 'fuel', 'maintenance', 'repair', 'vehicle', 'car', 'truck'], TRUE),
('contractors', 'Contractors', 11, 'Payments to contractors and freelancers', ARRAY['contractor', 'freelancer', 'consultant', 'upwork', 'fiverr'], TRUE),
('depreciation', 'Depreciation', 13, 'Depreciation of business assets', ARRAY['depreciation', 'amortization'], TRUE),
('employee_benefits', 'Employee Benefits', 14, 'Employee benefits and retirement plans', ARRAY['401k', 'benefits', 'insurance', 'retirement'], TRUE),
('insurance', 'Insurance', 15, 'Business insurance premiums', ARRAY['insurance', 'liability', 'property'], TRUE),
('interest', 'Interest', 16, 'Interest on business loans and credit cards', ARRAY['interest', 'loan', 'credit card'], TRUE),
('legal_fees', 'Legal & Professional Fees', 17, 'Legal and professional services', ARRAY['legal', 'attorney', 'lawyer', 'accountant', 'professional'], TRUE),
('office_expenses', 'Office Expenses', 18, 'Office supplies and expenses', ARRAY['office', 'supplies', 'printer', 'paper', 'desk'], TRUE),
('rent', 'Rent', 20, 'Business rent or lease payments', ARRAY['rent', 'lease'], TRUE),
('repairs', 'Repairs & Maintenance', 21, 'Repairs and maintenance', ARRAY['repair', 'maintenance', 'fix'], TRUE),
('supplies', 'Supplies', 22, 'Business supplies and materials', ARRAY['supplies', 'materials', 'inventory'], TRUE),
('taxes', 'Taxes & Licenses', 23, 'Business taxes and licenses', ARRAY['tax', 'license', 'permit', 'registration'], TRUE),
('travel', 'Travel', 24, 'Business travel expenses', ARRAY['travel', 'flight', 'hotel', 'airbnb', 'airbnb'], TRUE),
('meals', 'Meals & Entertainment', 24, 'Business meals and entertainment (50% deductible)', ARRAY['meal', 'restaurant', 'dinner', 'lunch', 'entertainment'], TRUE),
('utilities', 'Utilities', 25, 'Business utilities', ARRAY['utility', 'electric', 'water', 'internet', 'phone'], TRUE),
('wages', 'Wages', 26, 'Employee wages and salaries', ARRAY['wage', 'salary', 'payroll', 'employee'], TRUE),
('other_expenses', 'Other Expenses', 27, 'Other business expenses not categorized above', ARRAY['other', 'miscellaneous'], TRUE),
('sales_income', 'Sales Income', 1, 'Gross receipts or sales (income)', ARRAY['order', 'sale', 'payment received'], FALSE),
('other_income', 'Other Income', 6, 'Other income not from sales', ARRAY['refund', 'return', 'interest income'], FALSE);

-- ============================================
-- Table: Organizations
-- ============================================
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  business_type TEXT DEFAULT 'sole_proprietorship',
  tax_year INTEGER DEFAULT EXTRACT(YEAR FROM NOW()),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(profile_id, tax_year)
);

-- ============================================
-- Table: Connections (Platform Integrations)
-- ============================================
CREATE TABLE connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  platform TEXT NOT NULL, -- 'Shopify', 'Stripe', 'Amazon', etc.
  platform_account_id TEXT,
  access_token_encrypted TEXT,
  sync_status TEXT DEFAULT 'disconnected', -- 'connected', 'syncing', 'error'
  last_successful_sync TIMESTAMP WITH TIME ZONE,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(org_id, platform)
);

-- ============================================
-- Table: Transactions
-- ============================================
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  source_id TEXT, -- External ID from platform (e.g., Shopify order ID)
  transaction_date TIMESTAMP WITH TIME ZONE NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL(12, 2) NOT NULL, -- Negative for expenses, positive for income
  state_code TEXT, -- US State code for nexus tracking
  tax_category_id UUID REFERENCES tax_categories(id) ON DELETE SET NULL,
  auto_mapped BOOLEAN DEFAULT FALSE,
  manual_override BOOLEAN DEFAULT FALSE,
  raw_data JSONB DEFAULT '{}', -- Store original platform data
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_transactions_org_id ON transactions(org_id);
CREATE INDEX idx_transactions_date ON transactions(transaction_date DESC);
CREATE INDEX idx_transactions_category ON transactions(tax_category_id);
CREATE INDEX idx_transactions_platform ON transactions(platform);
CREATE INDEX idx_connections_org_id ON connections(org_id);

-- ============================================
-- Table: Nexus Status (Sales Tax Tracking)
-- ============================================
CREATE TABLE nexus_status (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  state_code TEXT NOT NULL,
  has_nexus BOOLEAN DEFAULT FALSE,
  threshold_reached BOOLEAN DEFAULT FALSE,
  total_sales DECIMAL(12, 2) DEFAULT 0,
  last_checked TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(org_id, state_code)
);

-- ============================================
-- Table: Subscriptions
-- ============================================
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  status TEXT DEFAULT 'inactive', -- 'active', 'inactive', 'past_due', 'canceled'
  plan_id TEXT,
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- Function: Auto-map transaction to tax category
-- ============================================
CREATE OR REPLACE FUNCTION auto_map_transaction(
  p_description TEXT,
  p_platform TEXT
) RETURNS UUID AS $$
DECLARE
  v_category_id UUID;
BEGIN
  -- Try to match by keywords in description
  SELECT id INTO v_category_id
  FROM tax_categories
  WHERE p_description ILIKE ANY(keywords)
  LIMIT 1;
  
  -- If no match, try platform-based defaults
  IF v_category_id IS NULL THEN
    IF p_platform = 'Shopify' THEN
      SELECT id INTO v_category_id FROM tax_categories WHERE name = 'sales_income';
    ELSIF p_platform = 'Stripe' THEN
      IF p_description ILIKE '%refund%' THEN
        SELECT id INTO v_category_id FROM tax_categories WHERE name = 'other_income';
      ELSE
        SELECT id INTO v_category_id FROM tax_categories WHERE name = 'sales_income';
      END IF;
    END IF;
  END IF;
  
  RETURN v_category_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Function: Update updated_at timestamp
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_connections_updated_at BEFORE UPDATE ON connections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_nexus_status_updated_at BEFORE UPDATE ON nexus_status
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Row Level Security (RLS) Policies
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE nexus_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_categories ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can only see their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Organizations: Users can only access their own organizations
CREATE POLICY "Users can view own organizations"
  ON organizations FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = profile_id AND auth.uid() = id
  ));

CREATE POLICY "Users can create own organizations"
  ON organizations FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM profiles WHERE id = profile_id AND auth.uid() = id
  ));

-- Transactions: Users can only access transactions from their organizations
CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM organizations o
    JOIN profiles p ON p.id = o.profile_id
    WHERE o.id = org_id AND p.id = auth.uid()
  ));

CREATE POLICY "Users can create own transactions"
  ON transactions FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM organizations o
    JOIN profiles p ON p.id = o.profile_id
    WHERE o.id = org_id AND p.id = auth.uid()
  ));

-- Connections: Users can only access connections from their organizations
CREATE POLICY "Users can view own connections"
  ON connections FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM organizations o
    JOIN profiles p ON p.id = o.profile_id
    WHERE o.id = org_id AND p.id = auth.uid()
  ));

-- Nexus Status: Users can only access nexus data from their organizations
CREATE POLICY "Users can view own nexus"
  ON nexus_status FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM organizations o
    JOIN profiles p ON p.id = o.profile_id
    WHERE o.id = org_id AND p.id = auth.uid()
  ));

-- Subscriptions: Users can only access their own subscriptions
CREATE POLICY "Users can view own subscriptions"
  ON subscriptions FOR SELECT
  USING (auth.uid() = profile_id);

CREATE POLICY "Users can update own subscriptions"
  ON subscriptions FOR UPDATE
  USING (auth.uid() = profile_id);

-- Tax Categories: Everyone can read (reference data)
CREATE POLICY "Anyone can view tax categories"
  ON tax_categories FOR SELECT
  USING (TRUE);

-- ============================================
-- Views for Report Aggregations
-- ============================================

-- View: Schedule C Summary
CREATE VIEW schedule_c_summary AS
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

-- ============================================
-- Subscription Plans
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

-- ============================================
-- Views for Report Aggregations
-- ============================================
CREATE VIEW sales_tax_by_state AS
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

-- ============================================
-- New Tables for April 2026 Features
-- Accountant Portal, AI Categorization, Filing Deadlines
-- ============================================

-- ============================================
-- Table: Accountant-Client Relationships
-- ============================================
CREATE TABLE accountant_clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  accountant_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending', -- 'pending', 'active', 'inactive'
  invitation_email TEXT,
  invitation_sent_at TIMESTAMP WITH TIME ZONE,
  invitation_accepted_at TIMESTAMP WITH TIME ZONE,
  invitation_token TEXT,
  notes TEXT,
  custom_settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(accountant_id, client_id)
);

-- Indexes
CREATE INDEX idx_accountant_clients_accountant ON accountant_clients(accountant_id);
CREATE INDEX idx_accountant_clients_client ON accountant_clients(client_id);
CREATE INDEX idx_accountant_clients_status ON accountant_clients(status);

-- RLS
ALTER TABLE accountant_clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY accountant_clients_accountant_view
  ON accountant_clients
  FOR ALL
  USING (auth.uid() = accountant_id);

CREATE POLICY accountant_clients_client_view
  ON accountant_clients
  FOR SELECT
  USING (auth.uid() = client_id);

-- Trigger
CREATE TRIGGER update_accountant_clients_updated_at
  BEFORE UPDATE ON accountant_clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Table: AI Categorization Log
-- ============================================
CREATE TABLE ai_categorizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  suggested_category_id UUID REFERENCES tax_categories(id),
  confidence_score DECIMAL(3, 2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  ai_model TEXT,
  ai_version TEXT,
  explanation TEXT,
  raw_prompt TEXT,
  raw_response TEXT,
  user_accepted BOOLEAN,
  user_override_category_id UUID REFERENCES tax_categories(id),
  processing_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_ai_categorizations_transaction ON ai_categorizations(transaction_id);
CREATE INDEX idx_ai_categorizations_confidence ON ai_categorizations(confidence_score);
CREATE INDEX idx_ai_categorizations_created ON ai_categorizations(created_at);

-- RLS
ALTER TABLE ai_categorizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY ai_categorizations_org_access
  ON ai_categorizations
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM transactions t
      JOIN organizations o ON t.org_id = o.id
      WHERE t.id = ai_categorizations.transaction_id
      AND o.profile_id = auth.uid()
    )
  );

-- Trigger
CREATE TRIGGER update_ai_categorizations_updated_at
  BEFORE UPDATE ON ai_categorizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Table: Integration Sync Logs
-- ============================================
CREATE TABLE integration_sync_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  connection_id UUID NOT NULL REFERENCES connections(id) ON DELETE CASCADE,
  sync_type TEXT CHECK (sync_type IN ('full', 'incremental', 'manual', 'scheduled')),
  status TEXT CHECK (status IN ('success', 'partial', 'failed', 'in_progress')),
  records_processed INTEGER DEFAULT 0,
  records_failed INTEGER DEFAULT 0,
  records_created INTEGER DEFAULT 0,
  records_updated INTEGER DEFAULT 0,
  error_message TEXT,
  error_details JSONB DEFAULT '{}',
  sync_config JSONB DEFAULT '{}',
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER,
  triggered_by TEXT DEFAULT 'user'
);

-- Indexes
CREATE INDEX idx_sync_logs_connection ON integration_sync_logs(connection_id);
CREATE INDEX idx_sync_logs_date ON integration_sync_logs(started_at DESC);
CREATE INDEX idx_sync_logs_status ON integration_sync_logs(status);

-- RLS
ALTER TABLE integration_sync_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY integration_sync_logs_org_access
  ON integration_sync_logs
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM connections c
      JOIN organizations o ON c.org_id = o.id
      WHERE c.id = integration_sync_logs.connection_id
      AND o.profile_id = auth.uid()
    )
  );

-- ============================================
-- Table: Filing Deadlines
-- ============================================
CREATE TABLE filing_deadlines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  form_type TEXT NOT NULL,
  form_name TEXT,
  jurisdiction TEXT,
  tax_year INTEGER DEFAULT EXTRACT(YEAR FROM NOW()),
  due_date DATE NOT NULL,
  extension_due_date DATE,
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'filed', 'overdue', 'extension_requested', 'extension_granted')),
  reminder_sent BOOLEAN DEFAULT FALSE,
  reminder_sent_at TIMESTAMP WITH TIME ZONE,
  filed_at TIMESTAMP WITH TIME ZONE,
  filed_by TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_filing_deadlines_org ON filing_deadlines(org_id);
CREATE INDEX idx_filing_deadlines_date ON filing_deadlines(due_date);
CREATE INDEX idx_filing_deadlines_status ON filing_deadlines(status);

-- RLS
ALTER TABLE filing_deadlines ENABLE ROW LEVEL SECURITY;

CREATE POLICY filing_deadlines_org_access
  ON filing_deadlines
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM organizations o
      WHERE o.id = filing_deadlines.org_id
      AND o.profile_id = auth.uid()
    )
  );

-- Trigger
CREATE TRIGGER update_filing_deadlines_updated_at
  BEFORE UPDATE ON filing_deadlines
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Enhanced Columns on Existing Tables
-- ============================================

-- Add user_type to profiles
ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS user_type TEXT DEFAULT 'business_owner' 
  CHECK (user_type IN ('business_owner', 'accountant', 'admin', 'bookkeeper'));

ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS phone TEXT;

ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'America/New_York';

ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS avatar_url TEXT;

CREATE INDEX idx_profiles_user_type ON profiles(user_type);

-- Add AI fields to transactions
ALTER TABLE transactions 
  ADD COLUMN IF NOT EXISTS ai_confidence DECIMAL(3, 2) 
  CHECK (ai_confidence >= 0 AND ai_confidence <= 1);

ALTER TABLE transactions 
  ADD COLUMN IF NOT EXISTS categorization_source TEXT 
  CHECK (categorization_source IN ('manual', 'ai', 'rule', 'imported', 'api'));

ALTER TABLE transactions 
  ADD COLUMN IF NOT EXISTS platform_transaction_id TEXT;

ALTER TABLE transactions 
  ADD COLUMN IF NOT EXISTS province_name TEXT;

ALTER TABLE transactions 
  ADD COLUMN IF NOT EXISTS country_code TEXT DEFAULT 'US';

CREATE INDEX idx_transactions_platform_tx_id ON transactions(platform, platform_transaction_id);
CREATE INDEX idx_transactions_cat_source ON transactions(categorization_source);

-- Enhance tax_categories
ALTER TABLE tax_categories 
  ADD COLUMN IF NOT EXISTS ai_keywords TEXT[] DEFAULT '{}';

ALTER TABLE tax_categories 
  ADD COLUMN IF NOT EXISTS typical_amount_range JSONB DEFAULT '{"min": null, "max": null}';

ALTER TABLE tax_categories 
  ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT 100;

ALTER TABLE tax_categories 
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Enhance connections
ALTER TABLE connections 
  ADD COLUMN IF NOT EXISTS last_sync_records INTEGER DEFAULT 0;

ALTER TABLE connections 
  ADD COLUMN IF NOT EXISTS consecutive_errors INTEGER DEFAULT 0;

ALTER TABLE connections 
  ADD COLUMN IF NOT EXISTS sync_schedule TEXT DEFAULT '0 */6 * * *';

ALTER TABLE connections 
  ADD COLUMN IF NOT EXISTS webhook_url TEXT;

ALTER TABLE connections 
  ADD COLUMN IF NOT EXISTS webhook_secret TEXT;

CREATE INDEX idx_connections_sync_status ON connections(sync_status);

-- ============================================
-- Function: Generate Standard Filing Deadlines
-- ============================================
CREATE OR REPLACE FUNCTION generate_standard_deadlines(org_id UUID, tax_year INTEGER)
RETURNS VOID AS $$
BEGIN
  -- Q1 Estimated Tax
  INSERT INTO filing_deadlines (org_id, form_type, form_name, jurisdiction, tax_year, due_date)
  VALUES (org_id, '1040-ES-Q1', 'Q1 Estimated Tax', 'federal', tax_year, make_date(tax_year, 4, 15))
  ON CONFLICT DO NOTHING;
  
  -- Q2 Estimated Tax
  INSERT INTO filing_deadlines (org_id, form_type, form_name, jurisdiction, tax_year, due_date)
  VALUES (org_id, '1040-ES-Q2', 'Q2 Estimated Tax', 'federal', tax_year, make_date(tax_year, 6, 15))
  ON CONFLICT DO NOTHING;
  
  -- Q3 Estimated Tax
  INSERT INTO filing_deadlines (org_id, form_type, form_name, jurisdiction, tax_year, due_date)
  VALUES (org_id, '1040-ES-Q3', 'Q3 Estimated Tax', 'federal', tax_year, make_date(tax_year, 9, 15))
  ON CONFLICT DO NOTHING;
  
  -- Q4 Estimated Tax
  INSERT INTO filing_deadlines (org_id, form_type, form_name, jurisdiction, tax_year, due_date)
  VALUES (org_id, '1040-ES-Q4', 'Q4 Estimated Tax', 'federal', tax_year, make_date(tax_year, 1, 15))
  ON CONFLICT DO NOTHING;
  
  -- Schedule C (with 1040)
  INSERT INTO filing_deadlines (org_id, form_type, form_name, jurisdiction, tax_year, due_date)
  VALUES (org_id, 'Schedule-C', 'Schedule C - Business Profit/Loss', 'federal', tax_year, make_date(tax_year + 1, 4, 15))
  ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql;

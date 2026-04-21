-- ============================================
-- TaxFlow Database Migration - April 21, 2026
-- New features: Accountant Portal, AI Categorization, Enhanced Integrations
-- ============================================

-- ============================================
-- 1. Accountant-Client Relationships (REQUIRED)
-- For the Accountant Portal feature
-- ============================================
CREATE TABLE IF NOT EXISTS accountant_clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  accountant_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending', -- 'pending', 'active', 'inactive'
  invitation_email TEXT,
  invitation_sent_at TIMESTAMP WITH TIME ZONE,
  invitation_accepted_at TIMESTAMP WITH TIME ZONE,
  invitation_token TEXT, -- For secure invitation links
  notes TEXT,
  custom_settings JSONB DEFAULT '{}', -- Accountant-specific settings per client
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(accountant_id, client_id)
);

-- Enable RLS
ALTER TABLE accountant_clients ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY accountant_clients_accountant_view
  ON accountant_clients
  FOR ALL
  USING (auth.uid() = accountant_id);

CREATE POLICY accountant_clients_client_view
  ON accountant_clients
  FOR SELECT
  USING (auth.uid() = client_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_accountant_clients_accountant 
  ON accountant_clients(accountant_id);
CREATE INDEX IF NOT EXISTS idx_accountant_clients_client 
  ON accountant_clients(client_id);
CREATE INDEX IF NOT EXISTS idx_accountant_clients_status 
  ON accountant_clients(status);

-- ============================================
-- 2. AI Categorization Log (REQUIRED)
-- Track AI decisions for auditing and improvement
-- ============================================
CREATE TABLE IF NOT EXISTS ai_categorizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  suggested_category_id UUID REFERENCES tax_categories(id),
  confidence_score DECIMAL(3, 2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  ai_model TEXT, -- 'gemini-1.5-flash', 'gemini-1.5-pro', etc.
  ai_version TEXT, -- Model version for tracking
  explanation TEXT,
  raw_prompt TEXT, -- For debugging/improvement
  raw_response TEXT, -- For debugging/improvement
  user_accepted BOOLEAN, -- NULL = pending, TRUE = accepted, FALSE = rejected
  user_override_category_id UUID REFERENCES tax_categories(id),
  processing_time_ms INTEGER, -- Performance tracking
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE ai_categorizations ENABLE ROW LEVEL SECURITY;

-- RLS Policy - Only organization members can view
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

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ai_categorizations_transaction 
  ON ai_categorizations(transaction_id);
CREATE INDEX IF NOT EXISTS idx_ai_categorizations_confidence 
  ON ai_categorizations(confidence_score);
CREATE INDEX IF NOT EXISTS idx_ai_categorizations_created 
  ON ai_categorizations(created_at);

-- ============================================
-- 3. Integration Sync Logs (RECOMMENDED)
-- Track sync operations for debugging
-- ============================================
CREATE TABLE IF NOT EXISTS integration_sync_logs (
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
  sync_config JSONB DEFAULT '{}', -- What was synced (date range, etc.)
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER,
  triggered_by TEXT DEFAULT 'user' -- 'user', 'scheduled', 'webhook'
);

-- Enable RLS
ALTER TABLE integration_sync_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policy
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

-- Indexes
CREATE INDEX IF NOT EXISTS idx_sync_logs_connection 
  ON integration_sync_logs(connection_id);
CREATE INDEX IF NOT EXISTS idx_sync_logs_date 
  ON integration_sync_logs(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_sync_logs_status 
  ON integration_sync_logs(status);

-- ============================================
-- 4. Filing Deadlines (OPTIONAL - for deadline tracking)
-- ============================================
CREATE TABLE IF NOT EXISTS filing_deadlines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  form_type TEXT NOT NULL, -- '1040-ES', 'Schedule C', 'State-CA', etc.
  form_name TEXT,
  jurisdiction TEXT, -- 'federal', 'CA', 'NY', etc.
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

-- Enable RLS
ALTER TABLE filing_deadlines ENABLE ROW LEVEL SECURITY;

-- RLS Policy
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

-- Indexes
CREATE INDEX IF NOT EXISTS idx_filing_deadlines_org 
  ON filing_deadlines(org_id);
CREATE INDEX IF NOT EXISTS idx_filing_deadlines_date 
  ON filing_deadlines(due_date);
CREATE INDEX IF NOT EXISTS idx_filing_deadlines_status 
  ON filing_deadlines(status);

-- ============================================
-- 5. Profile Enhancements
-- ============================================

-- Add user_type for role-based access
ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS user_type TEXT DEFAULT 'business_owner' 
  CHECK (user_type IN ('business_owner', 'accountant', 'admin', 'bookkeeper'));

-- Add phone number
ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS phone TEXT;

-- Add timezone
ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'America/New_York';

-- Add avatar/profile image
ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Index on user_type for faster filtering
CREATE INDEX IF NOT EXISTS idx_profiles_user_type 
  ON profiles(user_type);

-- ============================================
-- 6. Transactions Enhancements
-- ============================================

-- Add AI confidence score
ALTER TABLE transactions 
  ADD COLUMN IF NOT EXISTS ai_confidence DECIMAL(3, 2) 
  CHECK (ai_confidence >= 0 AND ai_confidence <= 1);

-- Add categorization source tracking
ALTER TABLE transactions 
  ADD COLUMN IF NOT EXISTS categorization_source TEXT 
  CHECK (categorization_source IN ('manual', 'ai', 'rule', 'imported', 'api'));

-- Add platform-specific transaction ID
ALTER TABLE transactions 
  ADD COLUMN IF NOT EXISTS platform_transaction_id TEXT;

-- Add province/state name (in addition to code)
ALTER TABLE transactions 
  ADD COLUMN IF NOT EXISTS province_name TEXT;

-- Add country for international support
ALTER TABLE transactions 
  ADD COLUMN IF NOT EXISTS country_code TEXT DEFAULT 'US';

-- Index on platform_transaction_id for deduplication
CREATE INDEX IF NOT EXISTS idx_transactions_platform_tx_id 
  ON transactions(platform, platform_transaction_id);

-- Index on categorization_source
CREATE INDEX IF NOT EXISTS idx_transactions_cat_source 
  ON transactions(categorization_source);

-- ============================================
-- 7. Tax Categories Enhancements
-- ============================================

-- Add AI training keywords
ALTER TABLE tax_categories 
  ADD COLUMN IF NOT EXISTS ai_keywords TEXT[] DEFAULT '{}';

-- Add example amounts for validation
ALTER TABLE tax_categories 
  ADD COLUMN IF NOT EXISTS typical_amount_range JSONB DEFAULT '{"min": null, "max": null}';

-- Add category priority for suggestions
ALTER TABLE tax_categories 
  ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT 100;

-- Add is_active flag
ALTER TABLE tax_categories 
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- ============================================
-- 8. Connections Enhancements
-- ============================================

-- Add last sync details
ALTER TABLE connections 
  ADD COLUMN IF NOT EXISTS last_sync_records INTEGER DEFAULT 0;

-- Add sync error count for alerting
ALTER TABLE connections 
  ADD COLUMN IF NOT EXISTS consecutive_errors INTEGER DEFAULT 0;

-- Add sync schedule (cron-like)
ALTER TABLE connections 
  ADD COLUMN IF NOT EXISTS sync_schedule TEXT DEFAULT '0 */6 * * *'; -- Every 6 hours

-- Add webhook URL for real-time updates
ALTER TABLE connections 
  ADD COLUMN IF NOT EXISTS webhook_url TEXT;

-- Add webhook secret
ALTER TABLE connections 
  ADD COLUMN IF NOT EXISTS webhook_secret TEXT;

-- Index on sync_status
CREATE INDEX IF NOT EXISTS idx_connections_sync_status 
  ON connections(sync_status);

-- ============================================
-- 9. Create Functions/Triggers
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to new tables
DROP TRIGGER IF EXISTS update_accountant_clients_updated_at ON accountant_clients;
CREATE TRIGGER update_accountant_clients_updated_at
  BEFORE UPDATE ON accountant_clients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_ai_categorizations_updated_at ON ai_categorizations;
CREATE TRIGGER update_ai_categorizations_updated_at
  BEFORE UPDATE ON ai_categorizations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_filing_deadlines_updated_at ON filing_deadlines;
CREATE TRIGGER update_filing_deadlines_updated_at
  BEFORE UPDATE ON filing_deadlines
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 10. Insert Default Filing Deadlines (2024 Tax Year)
-- ============================================

-- Note: This is a template - actual deadlines should be inserted per organization
-- or calculated based on fiscal year

-- Function to generate standard deadlines for an organization
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

-- ============================================
-- Migration Complete
-- ============================================

DO $$
BEGIN
  RAISE NOTICE 'Migration completed successfully!';
  RAISE NOTICE 'New tables created: accountant_clients, ai_categorizations, integration_sync_logs, filing_deadlines';
  RAISE NOTICE 'Enhanced tables: profiles, transactions, tax_categories, connections';
  RAISE NOTICE 'Remember to run generate_standard_deadlines() for each organization after creation';
END $$;

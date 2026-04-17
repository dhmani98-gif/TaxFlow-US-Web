-- ============================================
-- Drop all existing tables
-- ============================================
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS connections CASCADE;
DROP TABLE IF EXISTS nexus_status CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS organizations CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS subscription_plans CASCADE;
DROP TABLE IF EXISTS tax_categories CASCADE;

-- ============================================
-- Drop functions and triggers
-- ============================================
DROP FUNCTION IF EXISTS auto_map_transaction_category;
DROP FUNCTION IF EXISTS trigger_auto_map_category();
DROP TRIGGER IF EXISTS auto_map_category_trigger ON transactions;

-- ============================================
-- Drop views
-- ============================================
DROP VIEW IF EXISTS schedule_c_summary;
DROP VIEW IF EXISTS sales_tax_by_state;

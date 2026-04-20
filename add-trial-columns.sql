-- ============================================
-- Add Trial Columns to Profiles Table
-- ============================================

-- Add trial_starts_at column (when user's trial started)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS trial_starts_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add subscription_status column (active, trialing, expired)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'trialing' 
CHECK (subscription_status IN ('trialing', 'active', 'expired'));

-- Add comment for documentation
COMMENT ON COLUMN profiles.trial_starts_at IS 'Start date of 14-day free trial';
COMMENT ON COLUMN profiles.subscription_status IS 'User subscription status: trialing, active, or expired';

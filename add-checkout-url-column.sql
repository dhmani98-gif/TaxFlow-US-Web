-- Add checkout_url column to subscription_plans table
ALTER TABLE subscription_plans 
ADD COLUMN IF NOT EXISTS checkout_url TEXT;

-- Migration: Add multi-tenancy support
-- Created: 2025-01-09

-- Create User table
CREATE TABLE IF NOT EXISTS "User" (
  id TEXT PRIMARY KEY DEFAULT ('usr_' || substr(md5(random()::text || clock_timestamp()::text), 1, 24)),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create API Key table
CREATE TABLE IF NOT EXISTS "ApiKey" (
  id TEXT PRIMARY KEY DEFAULT ('key_' || substr(md5(random()::text || clock_timestamp()::text), 1, 24)),
  user_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  key_hash TEXT NOT NULL,
  name TEXT,
  last_used TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create Subscription table
CREATE TABLE IF NOT EXISTS "Subscription" (
  id TEXT PRIMARY KEY DEFAULT ('sub_' || substr(md5(random()::text || clock_timestamp()::text), 1, 24)),
  user_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  status TEXT DEFAULT 'inactive', -- active, canceled, past_due, inactive
  plan TEXT DEFAULT 'annual', -- annual ($25/year)
  current_period_end TIMESTAMP,
  trial_end TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Add user_id to Service table
ALTER TABLE "Service" ADD COLUMN IF NOT EXISTS user_id TEXT REFERENCES "User"(id) ON DELETE CASCADE;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_service_user_id ON "Service"(user_id);
CREATE INDEX IF NOT EXISTS idx_apikey_user_id ON "ApiKey"(user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_user_id ON "Subscription"(user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_stripe_customer ON "Subscription"(stripe_customer_id);

-- Add updated_at trigger for User table
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_updated_at BEFORE UPDATE ON "User"
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscription_updated_at BEFORE UPDATE ON "Subscription"
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add RLS (Row Level Security) policies (commented out for now, enable in production)
-- ALTER TABLE "Service" ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY service_isolation ON "Service" USING (user_id = current_setting('app.current_user_id')::TEXT);

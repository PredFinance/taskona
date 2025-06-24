-- Create the taskona schema
CREATE SCHEMA IF NOT EXISTS taskona;

-- Enable UUID extension (this creates it in the public schema by default)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE taskona.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR UNIQUE NOT NULL,
  phone VARCHAR UNIQUE,
  full_name VARCHAR NOT NULL,
  avatar_url VARCHAR,
  referral_code VARCHAR UNIQUE,
  referred_by UUID REFERENCES taskona.users(id),
  is_activated BOOLEAN DEFAULT FALSE,
  activation_date TIMESTAMP,
  balance DECIMAL(10,2) DEFAULT 0,
  total_earned DECIMAL(10,2) DEFAULT 0,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tasks table
CREATE TABLE taskona.tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR NOT NULL,
  description TEXT,
  reward_amount DECIMAL(8,2) NOT NULL,
  task_type VARCHAR NOT NULL,
  requirements JSONB DEFAULT '{}',
  questions JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- User tasks (completed tasks)
CREATE TABLE taskona.user_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES taskona.users(id) NOT NULL,
  task_id UUID REFERENCES taskona.tasks(id) NOT NULL,
  status VARCHAR DEFAULT 'pending',
  answers JSONB DEFAULT '{}',
  proof_url VARCHAR,
  completed_at TIMESTAMP,
  verified_at TIMESTAMP,
  reward_paid DECIMAL(8,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, task_id)
);

-- Transactions table
CREATE TABLE taskona.transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES taskona.users(id) NOT NULL,
  type VARCHAR NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status VARCHAR DEFAULT 'pending',
  reference VARCHAR UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Referrals table
CREATE TABLE taskona.referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id UUID REFERENCES taskona.users(id) NOT NULL,
  referred_id UUID REFERENCES taskona.users(id) NOT NULL,
  bonus_paid DECIMAL(8,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(referrer_id, referred_id)
);

-- Withdrawals table
CREATE TABLE taskona.withdrawals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES taskona.users(id) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  bank_name VARCHAR NOT NULL,
  account_number VARCHAR NOT NULL,
  account_name VARCHAR NOT NULL,
  status VARCHAR DEFAULT 'pending',
  reference VARCHAR UNIQUE,
  processed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Functions for referral code
CREATE OR REPLACE FUNCTION taskona.generate_referral_code()
RETURNS TEXT AS $$
BEGIN
  RETURN 'TSK' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6));
END;
$$ LANGUAGE plpgsql;

-- Trigger to generate referral code if not provided
CREATE OR REPLACE FUNCTION taskona.set_referral_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.referral_code IS NULL THEN
    NEW.referral_code := taskona.generate_referral_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_referral_code ON taskona.users;

CREATE TRIGGER trigger_set_referral_code
  BEFORE INSERT ON taskona.users
  FOR EACH ROW
  EXECUTE FUNCTION taskona.set_referral_code();

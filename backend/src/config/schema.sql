-- InvestLink Database Schema
-- Run this file to initialize the database

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('porteur', 'investisseur', 'admin')),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(30),
  country VARCHAR(100),
  bio TEXT,
  avatar_url VARCHAR(500),
  email_verified BOOLEAN DEFAULT FALSE,
  email_token VARCHAR(255),
  verification_status VARCHAR(20) DEFAULT 'non_verifie' 
    CHECK (verification_status IN ('non_verifie', 'en_attente', 'verifie', 'rejete')),
  trust_score INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  is_suspended BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- KYC Verifications
CREATE TABLE IF NOT EXISTS kyc_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  id_document_url VARCHAR(500),
  selfie_url VARCHAR(500),
  status VARCHAR(20) DEFAULT 'en_attente'
    CHECK (status IN ('en_attente', 'verifie', 'rejete')),
  rejection_reason TEXT,
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMP,
  submitted_at TIMESTAMP DEFAULT NOW()
);

-- Projects
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  problem_description TEXT NOT NULL,
  solution TEXT NOT NULL,
  target_market TEXT NOT NULL,
  business_model TEXT NOT NULL,
  amount_sought DECIMAL(15,2) NOT NULL,
  currency_code VARCHAR(10) DEFAULT 'USD',
  sector VARCHAR(100),
  country VARCHAR(100),
  pitch_deck_url VARCHAR(500),
  image_url VARCHAR(500),
  status VARCHAR(30) DEFAULT 'brouillon'
    CHECK (status IN ('brouillon', 'publié', 'en_recherche', 'financé')),
  views_count INTEGER DEFAULT 0,
  favorites_count INTEGER DEFAULT 0,
  is_validated BOOLEAN DEFAULT FALSE,
  is_flagged BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Project updates
CREATE TABLE IF NOT EXISTS project_updates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Favorites
CREATE TABLE IF NOT EXISTS favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, project_id)
);

-- Conversations
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  user_1_id UUID REFERENCES users(id) ON DELETE CASCADE,
  user_2_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'actif' CHECK (status IN ('actif', 'archivé', 'bloqué')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Messages
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  type VARCHAR(20) DEFAULT 'texte' CHECK (type IN ('texte', 'fichier')),
  file_url VARCHAR(500),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  reference_id UUID,
  reference_type VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Reports (signalements)
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID REFERENCES users(id) ON DELETE CASCADE,
  reported_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  reported_project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  reason TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'ouvert' CHECK (status IN ('ouvert', 'traité', 'fermé')),
  admin_note TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Analytics sessions
CREATE TABLE IF NOT EXISTS analytics_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_key VARCHAR(255) UNIQUE NOT NULL,
  visitor_id VARCHAR(255),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  ip_address VARCHAR(100),
  user_agent TEXT,
  device_name VARCHAR(255),
  first_seen_at TIMESTAMP DEFAULT NOW(),
  last_seen_at TIMESTAMP DEFAULT NOW(),
  request_count INTEGER DEFAULT 1,
  last_path VARCHAR(500),
  last_method VARCHAR(20),
  is_authenticated BOOLEAN DEFAULT FALSE
);

-- Wallets
CREATE TABLE IF NOT EXISTS wallet_accounts (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  base_currency VARCHAR(10) DEFAULT 'USD',
  total_balance NUMERIC(18,2) DEFAULT 150,
  investable_balance NUMERIC(18,2) DEFAULT 150,
  withdrawable_balance NUMERIC(18,2) DEFAULT 0,
  locked_bonus NUMERIC(18,2) DEFAULT 150,
  deposit_status VARCHAR(20) DEFAULT 'developpement',
  withdrawal_status VARCHAR(20) DEFAULT 'developpement',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS wallet_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(30) NOT NULL,
  amount NUMERIC(18,2) NOT NULL,
  currency_code VARCHAR(10) DEFAULT 'USD',
  note TEXT,
  status VARCHAR(20) DEFAULT 'confirmee',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_projects_owner ON projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_sector ON projects(sector);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_users ON conversations(user_1_id, user_2_id);
CREATE INDEX IF NOT EXISTS idx_analytics_sessions_user ON analytics_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_sessions_last_seen ON analytics_sessions(last_seen_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_sessions_ip ON analytics_sessions(ip_address);
CREATE INDEX IF NOT EXISTS idx_analytics_sessions_visitor ON analytics_sessions(visitor_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_user ON wallet_transactions(user_id);

-- Trigger: update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER conversations_updated_at BEFORE UPDATE ON conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Admin user (change password in production!)
INSERT INTO users (email, password_hash, role, first_name, last_name, email_verified, verification_status)
VALUES (
  'admin@investlink.com',
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password
  'admin',
  'Admin',
  'InvestLink',
  TRUE,
  'verifie'
) ON CONFLICT (email) DO NOTHING;

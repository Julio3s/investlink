const fs = require('fs/promises');
const path = require('path');
const pool = require('./db');

const initDb = async () => {
  const { rows } = await pool.query("SELECT to_regclass('public.users') AS users_table");

  if (rows[0]?.users_table) {
    console.log('✅ Schéma PostgreSQL déjà présent');
  } else {
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = await fs.readFile(schemaPath, 'utf8');

    console.log('🛠️  Initialisation du schéma PostgreSQL...');
    await pool.query(schemaSql);
    console.log('✅ Schéma PostgreSQL initialisé');
  }

  await pool.query(`
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
    CREATE INDEX IF NOT EXISTS idx_analytics_sessions_user ON analytics_sessions(user_id);
    CREATE INDEX IF NOT EXISTS idx_analytics_sessions_last_seen ON analytics_sessions(last_seen_at DESC);
    CREATE INDEX IF NOT EXISTS idx_analytics_sessions_ip ON analytics_sessions(ip_address);
    CREATE INDEX IF NOT EXISTS idx_analytics_sessions_visitor ON analytics_sessions(visitor_id);
  `);

  await pool.query(`
    ALTER TABLE analytics_sessions
    ADD COLUMN IF NOT EXISTS visitor_id VARCHAR(255);
  `);

  await pool.query(`
    ALTER TABLE projects
    ADD COLUMN IF NOT EXISTS currency_code VARCHAR(10) DEFAULT 'USD';

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

    CREATE INDEX IF NOT EXISTS idx_wallet_transactions_user ON wallet_transactions(user_id);
  `);

  await pool.query(`
    INSERT INTO wallet_accounts (user_id, base_currency, total_balance, investable_balance, withdrawable_balance, locked_bonus)
    SELECT id, 'USD', 150, 150, 0, 150 FROM users
    ON CONFLICT (user_id) DO NOTHING;
  `);
};

module.exports = initDb;

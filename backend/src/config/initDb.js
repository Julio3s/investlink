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
  `);
};

module.exports = initDb;

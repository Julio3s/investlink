const fs = require('fs/promises');
const path = require('path');
const pool = require('./db');

const initDb = async () => {
  const { rows } = await pool.query("SELECT to_regclass('public.users') AS users_table");

  if (rows[0]?.users_table) {
    console.log('✅ Schéma PostgreSQL déjà présent');
    return;
  }

  const schemaPath = path.join(__dirname, 'schema.sql');
  const schemaSql = await fs.readFile(schemaPath, 'utf8');

  console.log('🛠️  Initialisation du schéma PostgreSQL...');
  await pool.query(schemaSql);
  console.log('✅ Schéma PostgreSQL initialisé');
};

module.exports = initDb;

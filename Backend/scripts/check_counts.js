#!/usr/bin/env node
/**
 * scripts/check_counts.js
 * Muestra conteos de las tablas principales en Heroku Postgres
 * Uso:
 *   $env:HEROKU_DATABASE_URL = (heroku config:get DATABASE_URL --app cfl-alejo)
 *   node scripts/check_counts.js
 */

const { Pool } = require('pg');

async function main() {
  const DATABASE_URL = process.env.HEROKU_DATABASE_URL || process.env.DATABASE_URL;
  if (!DATABASE_URL) {
    console.error('ERROR: define HEROKU_DATABASE_URL');
    process.exit(1);
  }

  const pool = new Pool({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });
  try {
    const tables = ['usuarios','pedidos','historial_pedidos'];
    for (const t of tables) {
      const res = await pool.query(`SELECT COUNT(*)::int AS c FROM ${t}`);
      console.log(`${t}: ${res.rows[0].c}`);
    }
  } catch (err) {
    console.error('Error al leer conteos:', err.message || err);
  } finally {
    await pool.end();
  }
}

main();

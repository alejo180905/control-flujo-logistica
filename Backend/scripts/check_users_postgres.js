#!/usr/bin/env node
/**
 * scripts/check_users_postgres.js
 * Conecta a la base de datos Postgres (HEROKU_DATABASE_URL) y muestra:
 * - COUNT(*) de usuarios
 * - muestras de filas (usuario, rol, contrasena_preview)
 * - detecta si la contraseña parece bcrypt
 *
 * Uso (PowerShell):
 *   $env:HEROKU_DATABASE_URL = (heroku config:get DATABASE_URL --app cfl-alejo)
 *   node scripts/check_users_postgres.js
 */

const { Pool } = require('pg');

async function main() {
  const DATABASE_URL = process.env.HEROKU_DATABASE_URL || process.env.DATABASE_URL;
  if (!DATABASE_URL) {
    console.error('ERROR: define HEROKU_DATABASE_URL (por ejemplo: $env:HEROKU_DATABASE_URL = (heroku config:get DATABASE_URL --app cfl-alejo))');
    process.exit(1);
  }

  const pool = new Pool({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });

  try {
    const cnt = await pool.query('SELECT COUNT(*)::int AS count FROM usuarios');
    console.log('Usuarios en la tabla:', cnt.rows[0].count);

    const sample = await pool.query("SELECT id_usuario, usuario, rol, LEFT(contrasena,60) AS contrasena_preview FROM usuarios ORDER BY id_usuario DESC LIMIT 20");
    console.log('\nMuestra de usuarios (máx 20):');
    console.table(sample.rows);

    const detect = await pool.query("SELECT usuario, CASE WHEN contrasena LIKE '$2%' THEN 'bcrypt' ELSE 'plain' END AS pw_type FROM usuarios LIMIT 20");
    console.log('\nTipo de contraseña (ejemplos):');
    console.table(detect.rows);
  } catch (err) {
    console.error('Error al consultar Postgres:', err.message || err);
  } finally {
    await pool.end();
  }
}

main();

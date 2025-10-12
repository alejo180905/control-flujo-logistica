#!/usr/bin/env node
/**
 * scripts/hash_plain_passwords.js
 *
 * Busca en la tabla `usuarios` valores de `contrasena` que no estén hasheados con bcrypt
 * (no empiecen por '$2') y los reemplaza por su hash bcrypt correspondiente.
 *
 * Uso (PowerShell):
 *   $env:HEROKU_DATABASE_URL = (heroku config:get DATABASE_URL --app cfl-alejo)
 *   node scripts/hash_plain_passwords.js
 *
 * ADVERTENCIA: haz un backup antes de ejecutar en producción:
 *   heroku pg:backups:capture --app cfl-alejo
 */

const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

async function main() {
  const DATABASE_URL = process.env.HEROKU_DATABASE_URL || process.env.DATABASE_URL;
  if (!DATABASE_URL) {
    console.error('ERROR: define HEROKU_DATABASE_URL (ej. $env:HEROKU_DATABASE_URL = (heroku config:get DATABASE_URL --app cfl-alejo))');
    process.exit(1);
  }

  const pool = new Pool({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });

  try {
    const res = await pool.query("SELECT usuario, contrasena FROM usuarios WHERE contrasena IS NOT NULL AND contrasena NOT LIKE '$2%'");
    console.log('Filas con contraseñas en texto plano encontradas:', res.rows.length);

    let updated = 0;
    for (const row of res.rows) {
      const usuario = row.usuario;
      const plain = String(row.contrasena);
      if (!plain || plain.trim().length === 0) {
        console.warn('Skipping empty password for usuario', usuario);
        continue;
      }
      const hash = await bcrypt.hash(plain, 10);
      try {
        await pool.query('UPDATE usuarios SET contrasena = $1 WHERE usuario = $2', [hash, usuario]);
        updated++;
        console.log('Hasheada y actualizada contraseña para usuario:', usuario);
      } catch (err) {
        console.error('Error actualizando usuario', usuario, err.message || err);
      }
    }

    console.log(`Proceso completado. Contraseñas actualizadas: ${updated}`);
  } catch (err) {
    console.error('Error durante la operación:', err.message || err);
  } finally {
    await pool.end();
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

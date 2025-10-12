#!/usr/bin/env node
/**
 * scripts/adjust_sequences.js
 * Ajusta las sequences de las tablas migradas en Heroku Postgres.
 * Uso:
 *   $env:HEROKU_DATABASE_URL = (heroku config:get DATABASE_URL --app cfl-alejo)
 *   node scripts/adjust_sequences.js
 */

const { Pool } = require('pg');

async function main() {
  const DATABASE_URL = process.env.HEROKU_DATABASE_URL || process.env.DATABASE_URL;
  if (!DATABASE_URL) {
    console.error('ERROR: define HEROKU_DATABASE_URL (ej. $env:HEROKU_DATABASE_URL = (heroku config:get DATABASE_URL --app cfl-alejo))');
    process.exit(1);
  }

  const pool = new Pool({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });
  try {
    const seqs = [
      { table: 'usuarios', col: 'id_usuario' },
      { table: 'pedidos', col: 'id_pedido' },
      { table: 'historial_pedidos', col: 'id_historial' }
    ];

    for (const s of seqs) {
      const maxRes = await pool.query(`SELECT COALESCE(MAX(${s.col}),0) as maxid FROM ${s.table}`);
      const maxid = maxRes.rows[0].maxid || 0;
      await pool.query(`SELECT setval(pg_get_serial_sequence('${s.table}','${s.col}'), GREATEST($1,1))`, [maxid]);
      console.log(`Sequence ajustada para ${s.table}.${s.col} -> max=${maxid}`);
    }

    console.log('Todas las sequences ajustadas.');
  } catch (err) {
    console.error('Error ajustando sequences:', err.message || err);
  } finally {
    await pool.end();
  }
}

main();

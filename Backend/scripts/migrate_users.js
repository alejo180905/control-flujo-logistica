#!/usr/bin/env node
/**
 * scripts/migrate_users.js
 *
 * Migra la tabla USUARIOS desde una base MySQL local hacia la base de Heroku Postgres.
 * Uso (PowerShell):
 *   $env:MYSQL_HOST='localhost'; $env:MYSQL_USER='root'; $env:MYSQL_PASS='tu_pass'; $env:MYSQL_DB='controlflujologistico'; $env:HEROKU_DATABASE_URL='postgres://...'; node scripts/migrate_users.js
 *
 * El script manejará columnas `contraseña` o `contrasena` o `password` según exista.
 * Inserta filas en la tabla `usuarios` creada en Postgres. Evita duplicados usando ON CONFLICT (usuario) DO NOTHING.
 */

const mysql = require('mysql2/promise');
const { Pool } = require('pg');

async function main() {
  const MYSQL_HOST = process.env.MYSQL_HOST || 'localhost';
  const MYSQL_USER = process.env.MYSQL_USER || 'root';
  const MYSQL_PASS = process.env.MYSQL_PASS || '';
  const MYSQL_DB   = process.env.MYSQL_DB   || 'controlflujologistico';
  const HEROKU_DATABASE_URL = process.env.HEROKU_DATABASE_URL || process.env.DATABASE_URL;

  if (!HEROKU_DATABASE_URL) {
    console.error('ERROR: debes definir HEROKU_DATABASE_URL (o DATABASE_URL) en las variables de entorno');
    process.exit(1);
  }

  console.log('Conectando a MySQL %s@%s/%s', MYSQL_USER, MYSQL_HOST, MYSQL_DB);
  const mysqlPool = mysql.createPool({
    host: MYSQL_HOST,
    user: MYSQL_USER,
    password: MYSQL_PASS,
    database: MYSQL_DB,
    waitForConnections: true,
    connectionLimit: 10,
  });

  console.log('Conectando a Postgres (Heroku)');
  const pgPool = new Pool({ connectionString: HEROKU_DATABASE_URL, ssl: { rejectUnauthorized: false } });

  try {
    const [rows] = await mysqlPool.query('SELECT * FROM USUARIOS');
    console.log('Filas obtenidas desde MySQL:', rows.length);

    let inserted = 0;
    for (const r of rows) {
      // Normalizar campos: soportar distintas columnas
      const id = r.id_usuario ?? r.id ?? null;
      const nombre = r.nombre ?? null;
      const usuario = r.usuario ?? null;
      const hashed = r['contraseña'] ?? r.contrasena ?? r.password ?? null;
      const rol = r.rol ?? 'Bodega';
      const activo = typeof r.activo !== 'undefined' ? r.activo : true;
      const fecha_creacion = r.fecha_creacion ?? r.created_at ?? null;

      if (!usuario) {
        console.warn('Skipping row without usuario:', r);
        continue;
      }

      // Insertar en Postgres; se evita duplicado por usuario
      const sql = `INSERT INTO usuarios (id_usuario, nombre, usuario, contrasena, rol, activo, fecha_creacion)
        VALUES ($1,$2,$3,$4,$5,$6,$7)
        ON CONFLICT (usuario) DO NOTHING`;

      try {
        await pgPool.query(sql, [id, nombre, usuario, hashed, rol, activo, fecha_creacion]);
        inserted++;
      } catch (err) {
        console.error('Error insertando usuario', usuario, err.message || err);
      }
    }

    console.log(`Migración completada. Insertadas: ${inserted}, procesadas: ${rows.length}`);
  } catch (err) {
    console.error('Error durante migración:', err);
  } finally {
    await mysqlPool.end();
    await pgPool.end();
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

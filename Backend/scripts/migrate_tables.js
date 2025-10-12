#!/usr/bin/env node
/**
 * scripts/migrate_tables.js
 *
 * Migra las tablas PEDIDOS y HISTORIAL_PEDIDOS desde MySQL local hacia Heroku Postgres.
 * Preserva los ids (id_pedido, id_historial) y ajusta las sequences en Postgres.
 * Uso (PowerShell):
 *   $env:HEROKU_DATABASE_URL = (heroku config:get DATABASE_URL --app cfl-alejo)
 *   $env:MYSQL_HOST='localhost'; $env:MYSQL_USER='root'; $env:MYSQL_PASS='...'; $env:MYSQL_DB='controlflujologistico'
 *   node scripts/migrate_tables.js
 */

const mysql = require('mysql2/promise');
const { Pool } = require('pg');

function pick(row, names) {
  for (const n of names) {
    if (typeof row[n] !== 'undefined') return row[n];
  }
  return null;
}

async function main() {
  const MYSQL_HOST = process.env.MYSQL_HOST || 'localhost';
  const MYSQL_USER = process.env.MYSQL_USER || 'root';
  const MYSQL_PASS = process.env.MYSQL_PASS || '';
  const MYSQL_DB   = process.env.MYSQL_DB   || 'controlflujologistico';
  const HEROKU_DATABASE_URL = process.env.HEROKU_DATABASE_URL || process.env.DATABASE_URL;

  if (!HEROKU_DATABASE_URL) {
    console.error('ERROR: define HEROKU_DATABASE_URL (o DATABASE_URL) en las variables de entorno');
    process.exit(1);
  }

  const mysqlPool = mysql.createPool({ host: MYSQL_HOST, user: MYSQL_USER, password: MYSQL_PASS, database: MYSQL_DB, waitForConnections: true, connectionLimit: 10 });
  const pgPool = new Pool({ connectionString: HEROKU_DATABASE_URL, ssl: { rejectUnauthorized: false } });

  try {
    // Migrar PEDIDOS
    console.log('Obteniendo filas de PEDIDOS desde MySQL...');
    const [pedidos] = await mysqlPool.query('SELECT * FROM PEDIDOS');
    console.log('Filas PEDIDOS:', pedidos.length);

    let insertedPedidos = 0;
    for (const r of pedidos) {
      const id_pedido = pick(r, ['id_pedido','ID_PEDIDO','id','Id']);
      const numero_pedido = pick(r, ['numero_pedido','numeroPedido','numero_pedido']);
      const estado = pick(r, ['estado']);
      const fecha_creacion = pick(r, ['fecha_creacion','created_at','fecha_creacion']);
      const started_at = pick(r, ['started_at','startedAt']);
      const completed_at = pick(r, ['completed_at','completedAt']);
      const mensajero_que_recogio = pick(r, ['mensajero_que_recogio','mensajero_que_recogio']);
      const maquila_que_recibio = pick(r, ['maquila_que_recibio','maquila_que_recibio']);

      const sql = `INSERT INTO pedidos (id_pedido, numero_pedido, estado, fecha_creacion, started_at, completed_at, mensajero_que_recogio, maquila_que_recibio)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
        ON CONFLICT (id_pedido) DO NOTHING`;
      try {
        await pgPool.query(sql, [id_pedido, numero_pedido, estado, fecha_creacion, started_at, completed_at, mensajero_que_recogio, maquila_que_recibio]);
        insertedPedidos++;
      } catch (err) {
        console.error('Error insertando pedido id_pedido=', id_pedido, err.message || err);
      }
    }
    console.log('Pedidos insertados (aprox):', insertedPedidos);

    // Ajustar sequence de pedidos
    try {
      await pgPool.query("SELECT setval(pg_get_serial_sequence('pedidos','id_pedido'), COALESCE((SELECT MAX(id_pedido) FROM pedidos),1))");
      console.log('Sequence de pedidos ajustada');
    } catch (err) {
      console.error('Error ajustando sequence de pedidos:', err.message || err);
    }

    // Migrar HISTORIAL_PEDIDOS
    console.log('Obteniendo filas de HISTORIAL_PEDIDOS desde MySQL...');
    const [historial] = await mysqlPool.query('SELECT * FROM HISTORIAL_PEDIDOS');
    console.log('Filas HISTORIAL_PEDIDOS:', historial.length);

    let insertedHist = 0;
    for (const r of historial) {
      const id_historial = pick(r, ['id_historial','ID_HISTORIAL','id','Id']);
      const id_pedido = pick(r, ['id_pedido','ID_PEDIDO']);
      const id_usuario = pick(r, ['id_usuario','ID_USUARIO']);
      const accion = pick(r, ['accion']);
      const etapa = pick(r, ['etapa']);
      const fecha = pick(r, ['fecha','created_at','fecha']);

      try {
        if (id_historial !== null && typeof id_historial !== 'undefined') {
          const sql = `INSERT INTO historial_pedidos (id_historial, id_pedido, id_usuario, accion, etapa, fecha)
            VALUES ($1,$2,$3,$4,$5,$6)
            ON CONFLICT (id_historial) DO NOTHING`;
          await pgPool.query(sql, [id_historial, id_pedido, id_usuario, accion, etapa, fecha]);
        } else {
          // Inserta sin id_historial para que la sequence lo asigne
          const sql2 = `INSERT INTO historial_pedidos (id_pedido, id_usuario, accion, etapa, fecha)
            VALUES ($1,$2,$3,$4,$5)`;
          await pgPool.query(sql2, [id_pedido, id_usuario, accion, etapa, fecha]);
        }
        insertedHist++;
      } catch (err) {
        console.error('Error insertando historial id_historial=', id_historial, err.message || err);
      }
    }
    console.log('Historial insertado (aprox):', insertedHist);

    // Ajustar sequence de historial_pedidos
    try {
      await pgPool.query("SELECT setval(pg_get_serial_sequence('historial_pedidos','id_historial'), COALESCE((SELECT MAX(id_historial) FROM historial_pedidos),1))");
      console.log('Sequence de historial_pedidos ajustada');
    } catch (err) {
      console.error('Error ajustando sequence de historial_pedidos:', err.message || err);
    }

    console.log('Migración de tablas completada.');
  } catch (err) {
    console.error('Error durante migración:', err.message || err);
  } finally {
    await mysqlPool.end();
    await pgPool.end();
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

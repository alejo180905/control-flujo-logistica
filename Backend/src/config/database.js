

require('dotenv').config();

let db = null;
let dbType = '';

if (process.env.DATABASE_URL) {
	// Heroku/PostgreSQL
	const { Pool } = require('pg');
	const pool = new Pool({
		connectionString: process.env.DATABASE_URL,
		ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
	});

	// Exponer un wrapper compatible con mysql2.promise().query
	// Los controladores usan db.query(sql, params) y esperan recibir [rows, fields]
	dbType = 'postgres';

	db = {
		query: async (sql, params) => {
			const debugSql = process.env.DEBUG_SQL === 'true';
			try {
				if (params && params.length) {
					let i = 0;
					const text = sql.replace(/\?/g, () => `$${++i}`);
					if (debugSql) console.log('[SQL DEBUG] text:', text, 'params:', params);
					const res = await pool.query(text, params);
					return [res.rows, res.fields];
				} else {
					if (debugSql) console.log('[SQL DEBUG] text:', sql, 'params: none');
					const res = await pool.query(sql);
					return [res.rows, res.fields];
				}
			} catch (err) {
				if (debugSql) console.error('[SQL DEBUG] error executing:', err, 'sql:', sql, 'params:', params);
				throw err;
			}
		},
		_pool: pool
	};

	// Probar conexión corta
	pool.query('SELECT 1').then(() => console.log('Conectado a PostgreSQL')).catch(err => console.error('Error de conexión a PostgreSQL:', err));

	const bcrypt = require('bcryptjs');

	// Auto-bootstrap: crear tablas principales si no existen (solo para facilitar despliegue inicial)
	(async function ensureTables() {
		const createUsuarios = `
		CREATE TABLE IF NOT EXISTS usuarios (
			id_usuario SERIAL PRIMARY KEY,
			nombre VARCHAR(100) NOT NULL,
			usuario VARCHAR(50) UNIQUE NOT NULL,
			contrasena VARCHAR(255) NOT NULL,
			rol VARCHAR(20) NOT NULL,
			activo BOOLEAN DEFAULT TRUE,
			fecha_creacion TIMESTAMPTZ DEFAULT now()
		);
		`;

		const createPedidos = `
		CREATE TABLE IF NOT EXISTS pedidos (
			id_pedido SERIAL PRIMARY KEY,
			numero_pedido VARCHAR(100) UNIQUE NOT NULL,
			estado VARCHAR(50) DEFAULT 'En_Bodega',
			fecha_creacion TIMESTAMPTZ DEFAULT now(),
			started_at TIMESTAMPTZ DEFAULT now(),
			completed_at TIMESTAMPTZ NULL,
			mensajero_que_recogio VARCHAR(100),
			maquila_que_recibio VARCHAR(100)
		);
		`;

		const createHistorial = `
		CREATE TABLE IF NOT EXISTS historial_pedidos (
			id_historial SERIAL PRIMARY KEY,
			id_pedido INTEGER NOT NULL REFERENCES pedidos(id_pedido) ON DELETE CASCADE,
			id_usuario INTEGER NOT NULL REFERENCES usuarios(id_usuario),
			accion VARCHAR(20) NOT NULL,
			etapa VARCHAR(20) NOT NULL,
			fecha TIMESTAMPTZ DEFAULT now()
		);
		`;

		try {
			await pool.query(createUsuarios);
			await pool.query(createPedidos);
			await pool.query(createHistorial);
			console.log('✅ Tablas principales aseguradas en PostgreSQL (usuarios, pedidos, historial_pedidos)');

			// Semilla: crear usuario admin por defecto si no hay usuarios
			try {
				const res = await pool.query('SELECT COUNT(*)::int AS count FROM usuarios');
				const count = res.rows && res.rows[0] ? res.rows[0].count : 0;
				if (count === 0) {
					const defaultPass = process.env.DEFAULT_ADMIN_PASSWORD || 'admin123';
					const hashed = await bcrypt.hash(defaultPass, 10);
					await pool.query('INSERT INTO usuarios (nombre, usuario, contrasena, rol, activo) VALUES ($1, $2, $3, $4, $5)', ['Administrador', 'admin', hashed, 'Admin', true]);
					console.log('🔐 Usuario admin inicial creado: usuario=admin (usa DEFAULT_ADMIN_PASSWORD para cambiar)');
				} else {
					console.log('ℹ️ Usuarios existentes detectados, no se creó usuario admin por defecto');
				}
			} catch (err) {
				console.error('❌ Error al verificar/crear usuario admin por defecto:', err);
			}
		} catch (err) {
			console.error('❌ Error creando tablas iniciales en PostgreSQL:', err);
		}
	})();

} else {
	// Local/MySQL
	const mysql = require('mysql2');
	const pool = mysql.createPool({
		host: process.env.DB_HOST || 'localhost',
		user: process.env.DB_USER || 'root',
		password: process.env.DB_PASSWORD || '',
		database: process.env.DB_NAME || 'ControlFlujoLogistico',
		waitForConnections: true,
		connectionLimit: 10,
		queueLimit: 0
	});
	db = pool.promise();
	dbType = 'mysql';
	pool.getConnection((err, connection) => {
		if (err) {
			console.error('Error de conexión a MySQL:', err);
		} else {
			console.log('Conectado a MySQL');
			connection.release();
		}
	});
}

// Exportar la conexión directamente porque los controladores usan `db.query`
// También adjuntamos el tipo de DB como propiedad por compatibilidad.
if (db) {
	try {
		db.dbType = dbType;
	} catch (e) {
		// ignore
	}
}

module.exports = db;

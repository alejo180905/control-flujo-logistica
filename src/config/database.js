
const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
	host: process.env.DB_HOST || 'localhost',
	user: process.env.DB_USER || 'root',
	password: process.env.DB_PASSWORD || '',
	database: process.env.DB_NAME || 'ControlFlujoLogistico',
	waitForConnections: true,
	connectionLimit: 10,
	queueLimit: 0
});

module.exports = pool.promise();

// Verificar conexión al iniciar
pool.getConnection((err, connection) => {
	if (err) {
		console.error('Error de conexión a la BD:', err);
	} else {
		console.log('DB conectada');
		connection.release();
	}
});

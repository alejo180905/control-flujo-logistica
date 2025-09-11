
const db = require('../config/database');

exports.crearPedido = async (req, res) => {
	const { usuario_id, producto, cantidad } = req.body;
	try {
		await db.query('INSERT INTO pedidos (usuario_id, producto, cantidad, fecha) VALUES (?, ?, ?, NOW())', [usuario_id, producto, cantidad]);
		res.status(201).json({ mensaje: 'Pedido creado correctamente' });
	} catch (error) {
		res.status(500).json({ mensaje: 'Error al crear pedido', error });
	}
};

exports.verHistorial = async (req, res) => {
	const { id } = req.params;
	try {
		const [rows] = await db.query('SELECT * FROM pedidos WHERE usuario_id = ? ORDER BY fecha DESC', [id]);
		res.json(rows);
	} catch (error) {
		res.status(500).json({ mensaje: 'Error al obtener historial', error });
	}
};

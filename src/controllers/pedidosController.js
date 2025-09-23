const db = require('../config/database');

// Crear pedido
exports.crearPedido = async (req, res) => {
  const { numero_pedido, estado } = req.body;
  try {
    await db.query(
      'INSERT INTO PEDIDOS (numero_pedido, estado, started_at, fecha_creacion) VALUES (?, ?, NOW(), NOW())',
      [numero_pedido, estado || 'BODEGA']
    );
    res.status(201).json({ mensaje: 'Pedido creado correctamente' });
  } catch (error) {
    console.error('ERROR CREAR PEDIDO:', error, error?.sqlMessage);
    res.status(500).json({ mensaje: 'Error al crear pedido', error: error?.sqlMessage || error });
  }
};

// Ver historial de pedidos (sin usuario_id porque no existe)
exports.verHistorial = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM PEDIDOS ORDER BY fecha_creacion DESC');
    res.json(rows);
  } catch (error) {
    console.error('ERROR HISTORIAL:', error, error?.sqlMessage);
    res.status(500).json({ mensaje: 'Error al obtener historial', error: error?.sqlMessage || error });
  }
};

// ========================
// Bodega
// ========================
exports.recibirBodega = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query("INSERT INTO historial_pedidos (id_pedido, id_usuario, accion, etapa, fecha) VALUES (?, ?, ?, ?, NOW())", [id, req.usuario?.id, 'RECIBIDO', 'BODEGA']);
    res.json({ mensaje: "Pedido recibido en bodega" });
  } catch (error) {
    console.error('ERROR BODEGA RECIBIR:', error, error?.sqlMessage);
    res.status(500).json({ mensaje: "Error al actualizar pedido en bodega", error: error?.sqlMessage || error });
  }
};

exports.entregarBodega = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query("INSERT INTO historial_pedidos (id_pedido, id_usuario, accion, etapa, fecha) VALUES (?, ?, ?, ?, NOW())", [id, req.usuario?.id, 'ENTREGADO', 'BODEGA']);
    res.json({ mensaje: "Pedido entregado por bodega" });
  } catch (error) {
    console.error('ERROR BODEGA ENTREGAR:', error, error?.sqlMessage);
    res.status(500).json({ mensaje: "Error al actualizar pedido en bodega", error: error?.sqlMessage || error });
  }
};

// ========================
// Despachos
// ========================
exports.recibirDespacho = async (req, res) => {
  const { id } = req.params;
  try {
    console.log('Recibiendo en despacho:', { id_pedido: id, id_usuario: req.usuario?.id });
    await db.query("INSERT INTO historial_pedidos (id_pedido, id_usuario, accion, etapa, fecha) VALUES (?, ?, ?, ?, NOW())", [id, req.usuario?.id, 'RECIBIDO', 'DESPACHOS']);
    res.json({ mensaje: "Pedido recibido en despacho" });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al actualizar pedido en despacho", error });
  }
};

exports.entregarDespacho = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query("INSERT INTO historial_pedidos (id_pedido, id_usuario, accion, etapa, fecha) VALUES (?, ?, ?, ?, NOW())", [id, req.usuario?.id, 'ENTREGADO', 'DESPACHOS']);
    res.json({ mensaje: "Pedido entregado en despacho" });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al actualizar pedido en despacho", error });
  }
};

// ========================
// Mensajero
// ========================
exports.recibirMensajero = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query("INSERT INTO historial_pedidos (id_pedido, id_usuario, accion, etapa, fecha) VALUES (?, ?, ?, ?, NOW())", [id, req.usuario?.id, 'RECIBIDO', 'MENSAJERO']);
    res.json({ mensaje: "Pedido recibido por mensajero" });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al actualizar pedido en mensajero", error });
  }
};

exports.entregarMensajero = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query("INSERT INTO historial_pedidos (id_pedido, id_usuario, accion, etapa, fecha) VALUES (?, ?, ?, ?, NOW())", [id, req.usuario?.id, 'ENTREGADO', 'MENSAJERO']);
    res.json({ mensaje: "Pedido entregado por mensajero" });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al actualizar pedido en mensajero", error });
  }
};

// ========================
// Maquilas
// ========================
exports.recibirMaquila = async (req, res) => {
  const { id } = req.params;
  try {
    // Insertar en historial
    await db.query("INSERT INTO historial_pedidos (id_pedido, id_usuario, accion, etapa, fecha) VALUES (?, ?, ?, ?, NOW())", [id, req.usuario?.id, 'RECIBIDO', 'MAQUILAS']);
    
    // Marcar pedido como FINALIZADO
    await db.query("UPDATE pedidos SET estado = 'FINALIZADO', completed_at = NOW() WHERE id_pedido = ?", [id]);
    
    res.json({ mensaje: "Pedido recibido en maquila y marcado como FINALIZADO" });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al actualizar pedido en maquila", error });
  }
};
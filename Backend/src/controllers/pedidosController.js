const db = require('../config/database');
const util = require('util');

// Crear pedido
exports.crearPedido = async (req, res) => {
    const { numero_pedido } = req.body;
    const usuario = req.usuario; // Viene del middleware de autenticación

    try {
        // Validar rol del usuario
        if (!usuario || !['Admin', 'Bodega'].includes(usuario.rol)) {
            return res.status(403).json({
                mensaje: 'No tienes permisos para crear pedidos',
                detalles: 'Se requiere rol de Admin o Bodega'
            });
        }

        // Validar número de pedido
        if (!numero_pedido) {
            return res.status(400).json({
                mensaje: 'El número de pedido es requerido',
                detalles: 'Proporciona un número de pedido válido'
            });
        }

        // Verificar si el número de pedido ya existe
        const [pedidosExistentes] = await db.query(
            'SELECT id_pedido FROM PEDIDOS WHERE numero_pedido = ?',
            [numero_pedido]
        );

        if (pedidosExistentes.length > 0) {
            return res.status(400).json({
                mensaje: 'El número de pedido ya existe',
                detalles: 'Usa un número de pedido diferente'
            });
        }

        // Iniciar transacción
        await db.query('START TRANSACTION');

        // Crear el pedido
        const [result] = await db.query(
            'INSERT INTO PEDIDOS (numero_pedido, estado, started_at, fecha_creacion) VALUES (?, ?, NOW(), NOW())',
            [numero_pedido, 'BODEGA']
        );

        // Registrar en historial
        await db.query(
            'INSERT INTO HISTORIAL_PEDIDOS (id_pedido, id_usuario, accion, etapa, fecha) VALUES (?, ?, ?, ?, NOW())',
            [result.insertId, usuario.id, 'RECIBIDO', 'BODEGA']
        );

        // Confirmar transacción
        await db.query('COMMIT');

        // Responder
        return res.status(201).json({
            mensaje: 'Pedido creado correctamente',
            datos: {
                id_pedido: result.insertId,
                numero_pedido,
                estado: 'BODEGA',
                created_by: usuario.nombre
            }
        });

    } catch (error) {
        // Revertir transacción en caso de error
        await db.query('ROLLBACK');
        
        console.error('❌ ERROR AL CREAR PEDIDO:', util.inspect(error, { depth: null }));
        return res.status(500).json({
            mensaje: 'Error al crear el pedido',
            error: error?.sqlMessage || error?.message || 'Error interno del servidor'
        });
    }
};

// Listar pedidos
exports.listarPedidos = async (req, res) => {
    const usuario = req.usuario;
    const { estado } = req.query;

    try {
        let query = `
            SELECT 
                p.*,
                (SELECT COUNT(*) FROM HISTORIAL_PEDIDOS WHERE id_pedido = p.id_pedido) as total_movimientos
            FROM PEDIDOS p
        `;

        const params = [];

        // Filtrar por estado si se proporciona
        if (estado) {
            query += ' WHERE p.estado = ?';
            params.push(estado);
        }

        // Ordenar por fecha de creación, más recientes primero
        query += ' ORDER BY p.fecha_creacion DESC';

        const [pedidos] = await db.query(query, params);

        return res.json({
            mensaje: 'Pedidos recuperados correctamente',
            datos: pedidos
        });

    } catch (error) {
        console.error('❌ ERROR AL LISTAR PEDIDOS:', util.inspect(error, { depth: null }));
        return res.status(500).json({
            mensaje: 'Error al obtener los pedidos',
            error: error?.sqlMessage || error?.message || 'Error interno del servidor'
        });
    }
};

// Ver historial de un pedido específico
exports.verHistorialPedido = async (req, res) => {
    const { id } = req.params;

    try {
        const [historial] = await db.query(`
            SELECT 
                h.*,
                u.nombre as nombre_usuario,
                u.rol as rol_usuario
            FROM HISTORIAL_PEDIDOS h
            LEFT JOIN USUARIOS u ON h.id_usuario = u.id_usuario
            WHERE h.id_pedido = ?
            ORDER BY h.fecha DESC
        `, [id]);

        return res.json({
            mensaje: 'Historial recuperado correctamente',
            datos: historial
        });

    } catch (error) {
        console.error('❌ ERROR AL OBTENER HISTORIAL:', util.inspect(error, { depth: null }));
        return res.status(500).json({
            mensaje: 'Error al obtener el historial del pedido',
            error: error?.sqlMessage || error?.message || 'Error interno del servidor'
        });
    }
};

// ========================
// Bodega
// ========================
// Funciones para transiciones de estado
exports.entregarBodega = async (req, res) => {
    const { id } = req.params;
    const usuario = req.usuario;

    try {
        // Validar que el pedido existe y está en BODEGA
        const [pedido] = await db.query('SELECT estado FROM PEDIDOS WHERE id_pedido = ?', [id]);
        if (pedido.length === 0) {
            return res.status(404).json({
                mensaje: 'Pedido no encontrado'
            });
        }

        if (pedido[0].estado !== 'BODEGA') {
            return res.status(400).json({
                mensaje: 'El pedido debe estar en BODEGA para ser entregado a DESPACHOS'
            });
        }

        // Iniciar transacción
        await db.query('START TRANSACTION');

        // Actualizar estado a DESPACHOS
        await db.query('UPDATE PEDIDOS SET estado = ? WHERE id_pedido = ?', ['DESPACHOS', id]);

        // Registrar entrega en BODEGA
        await db.query(
            'INSERT INTO HISTORIAL_PEDIDOS (id_pedido, id_usuario, accion, etapa, fecha) VALUES (?, ?, ?, ?, NOW())',
            [id, usuario.id, 'ENTREGADO', 'BODEGA']
        );

        // Confirmar transacción
        await db.query('COMMIT');

        return res.json({
            mensaje: 'Pedido entregado a DESPACHOS correctamente'
        });

    } catch (error) {
        await db.query('ROLLBACK');
        console.error('❌ ERROR AL ENTREGAR DE BODEGA:', error);
        return res.status(500).json({
            mensaje: 'Error al entregar el pedido',
            error: error?.sqlMessage || error?.message
        });
    }
};

exports.entregarDespacho = async (req, res) => {
    const { id } = req.params;
    const usuario = req.usuario;

    try {
        const [pedido] = await db.query('SELECT estado FROM PEDIDOS WHERE id_pedido = ?', [id]);
        if (pedido.length === 0) {
            return res.status(404).json({
                mensaje: 'Pedido no encontrado'
            });
        }

        if (pedido[0].estado !== 'DESPACHOS') {
            return res.status(400).json({
                mensaje: 'El pedido debe estar en DESPACHOS para ser entregado a MENSAJERO'
            });
        }

        await db.query('START TRANSACTION');

        await db.query('UPDATE PEDIDOS SET estado = ? WHERE id_pedido = ?', ['MENSAJERO', id]);

        await db.query(
            'INSERT INTO HISTORIAL_PEDIDOS (id_pedido, id_usuario, accion, etapa, fecha) VALUES (?, ?, ?, ?, NOW())',
            [id, usuario.id, 'ENTREGADO', 'DESPACHOS']
        );

        await db.query('COMMIT');

        return res.json({
            mensaje: 'Pedido entregado a MENSAJERO correctamente'
        });

    } catch (error) {
        await db.query('ROLLBACK');
        console.error('❌ ERROR AL ENTREGAR DE DESPACHOS:', error);
        return res.status(500).json({
            mensaje: 'Error al entregar el pedido',
            error: error?.sqlMessage || error?.message
        });
    }
};

exports.entregarMensajero = async (req, res) => {
    const { id } = req.params;
    const usuario = req.usuario;

    try {
        const [pedido] = await db.query('SELECT estado FROM PEDIDOS WHERE id_pedido = ?', [id]);
        if (pedido.length === 0) {
            return res.status(404).json({
                mensaje: 'Pedido no encontrado'
            });
        }

        if (pedido[0].estado !== 'MENSAJERO') {
            return res.status(400).json({
                mensaje: 'El pedido debe estar con MENSAJERO para ser entregado a MAQUILAS'
            });
        }

        await db.query('START TRANSACTION');

        await db.query('UPDATE PEDIDOS SET estado = ? WHERE id_pedido = ?', ['MAQUILAS', id]);

        await db.query(
            'INSERT INTO HISTORIAL_PEDIDOS (id_pedido, id_usuario, accion, etapa, fecha) VALUES (?, ?, ?, ?, NOW())',
            [id, usuario.id, 'ENTREGADO', 'MENSAJERO']
        );

        await db.query('COMMIT');

        return res.json({
            mensaje: 'Pedido entregado a MAQUILAS correctamente'
        });

    } catch (error) {
        await db.query('ROLLBACK');
        console.error('❌ ERROR AL ENTREGAR DE MENSAJERO:', error);
        return res.status(500).json({
            mensaje: 'Error al entregar el pedido',
            error: error?.sqlMessage || error?.message
        });
    }
};

exports.recibirMaquila = async (req, res) => {
    const { id } = req.params;
    const usuario = req.usuario;

    try {
        const [pedido] = await db.query('SELECT estado FROM PEDIDOS WHERE id_pedido = ?', [id]);
        if (pedido.length === 0) {
            return res.status(404).json({
                mensaje: 'Pedido no encontrado'
            });
        }

        if (pedido[0].estado !== 'MAQUILAS') {
            return res.status(400).json({
                mensaje: 'El pedido debe estar en MAQUILAS para ser recibido'
            });
        }

        await db.query('START TRANSACTION');

        // Marcar pedido como FINALIZADO y actualizar completed_at
        await db.query(
            'UPDATE PEDIDOS SET estado = ?, completed_at = NOW() WHERE id_pedido = ?', 
            ['FINALIZADO', id]
        );

        // Registrar recepción en MAQUILAS
        await db.query(
            'INSERT INTO HISTORIAL_PEDIDOS (id_pedido, id_usuario, accion, etapa, fecha) VALUES (?, ?, ?, ?, NOW())',
            [id, usuario.id, 'RECIBIDO', 'MAQUILAS']
        );

        await db.query('COMMIT');

        return res.json({
            mensaje: 'Pedido recibido y FINALIZADO correctamente'
        });

    } catch (error) {
        await db.query('ROLLBACK');
        console.error('❌ ERROR AL RECIBIR EN MAQUILAS:', error);
        return res.status(500).json({
            mensaje: 'Error al recibir el pedido',
            error: error?.sqlMessage || error?.message
        });
    }
};
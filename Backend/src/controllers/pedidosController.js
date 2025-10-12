const db = require('../config/database');
const util = require('util');

// Crear pedido
exports.crearPedido = async (req, res) => {
    const { numero_pedido } = req.body;
    const usuario = req.usuario; // Viene del middleware de autenticación

    try {
        // Validar rol del usuario - Solo Admin puede crear pedidos
        if (!usuario || usuario.rol !== 'Admin') {
            return res.status(403).json({
                mensaje: 'No tienes permisos para crear pedidos',
                detalles: 'Se requiere rol de Admin'
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

        // Crear el pedido con estado En_Bodega (debe coincidir con ENUM de la BD)
        const [result] = await db.query(
            'INSERT INTO PEDIDOS (numero_pedido, estado) VALUES (?, ?)',
            [numero_pedido, 'En_Bodega']
        );

        // Registrar en historial - pedido creado y almacenado en bodega
        await db.query(
            'INSERT INTO HISTORIAL_PEDIDOS (id_pedido, id_usuario, accion, etapa, fecha) VALUES (?, ?, ?, ?, NOW())',
            [result.insertId, usuario.id_usuario, 'RECIBIDO', 'BODEGA']
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
            ORDER BY h.fecha ASC
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
// BODEGA - Marcar listo para despacho
// ========================
exports.marcarListoDespacho = async (req, res) => {
    const { id } = req.params;
    const usuario = req.usuario;

    try {
        // Validar rol de Bodega
        if (usuario.rol !== 'Bodega' && usuario.rol !== 'Admin') {
            return res.status(403).json({
                mensaje: 'No tienes permisos para esta acción',
                detalles: 'Se requiere rol de Bodega'
            });
        }

        // Validar que el pedido existe y está en BODEGA
        const [pedido] = await db.query('SELECT estado FROM PEDIDOS WHERE id_pedido = ?', [id]);
        if (pedido.length === 0) {
            return res.status(404).json({
                mensaje: 'Pedido no encontrado'
            });
        }

        if (pedido[0].estado !== 'BODEGA') {
            return res.status(400).json({
                mensaje: 'El pedido debe estar en BODEGA para marcarlo como listo'
            });
        }

        // Iniciar transacción
        await db.query('START TRANSACTION');

        // Actualizar estado a LISTO_DESPACHO
        await db.query('UPDATE PEDIDOS SET estado = ? WHERE id_pedido = ?', ['DESPACHOS', id]);

        // Registrar en historial
        await db.query(
            'INSERT INTO HISTORIAL_PEDIDOS (id_pedido, id_usuario, accion, etapa, fecha) VALUES (?, ?, ?, ?, NOW())',
            [id, usuario.id, 'ENTREGADO', 'BODEGA']
        );

        // Confirmar transacción
        await db.query('COMMIT');

        return res.json({
            mensaje: 'Pedido marcado como listo para despacho'
        });

    } catch (error) {
        await db.query('ROLLBACK');
        console.error('❌ ERROR AL MARCAR LISTO DESPACHO:', error);
        return res.status(500).json({
            mensaje: 'Error al marcar el pedido como listo',
            error: error?.sqlMessage || error?.message
        });
    }
};

// ========================
// DESPACHOS - Marcar recibido
// ========================
exports.marcarRecibidoDespacho = async (req, res) => {
    const { id } = req.params;
    const usuario = req.usuario;

    try {
        // Validar rol de Despachos
        if (usuario.rol !== 'Despachos' && usuario.rol !== 'Admin') {
            return res.status(403).json({
                mensaje: 'No tienes permisos para esta acción',
                detalles: 'Se requiere rol de Despachos'
            });
        }

        const [pedido] = await db.query('SELECT estado FROM PEDIDOS WHERE id_pedido = ?', [id]);
        if (pedido.length === 0) {
            return res.status(404).json({
                mensaje: 'Pedido no encontrado'
            });
        }

        if (pedido[0].estado !== 'DESPACHOS') {
            return res.status(400).json({
                mensaje: 'El pedido debe estar en DESPACHOS para marcarlo como recibido'
            });
        }

        await db.query('START TRANSACTION');

        // Actualizar a estado RECIBIDO_DESPACHO (usamos DESPACHOS por ahora)
        await db.query('UPDATE PEDIDOS SET estado = ? WHERE id_pedido = ?', ['DESPACHOS', id]);

        await db.query(
            'INSERT INTO HISTORIAL_PEDIDOS (id_pedido, id_usuario, accion, etapa, fecha) VALUES (?, ?, ?, ?, NOW())',
            [id, usuario.id, 'RECIBIDO', 'DESPACHOS']
        );

        await db.query('COMMIT');

        return res.json({
            mensaje: 'Pedido marcado como recibido por Despachos'
        });

    } catch (error) {
        await db.query('ROLLBACK');
        console.error('❌ ERROR AL MARCAR RECIBIDO DESPACHO:', error);
        return res.status(500).json({
            mensaje: 'Error al marcar como recibido',
            error: error?.sqlMessage || error?.message
        });
    }
};

// ========================
// DESPACHOS - Confirmar salida
// ========================
exports.confirmarSalida = async (req, res) => {
    const { id } = req.params;
    const usuario = req.usuario;

    try {
        // Validar rol de Despachos
        if (usuario.rol !== 'Despachos' && usuario.rol !== 'Admin') {
            return res.status(403).json({
                mensaje: 'No tienes permisos para esta acción',
                detalles: 'Se requiere rol de Despachos'
            });
        }

        const [pedido] = await db.query('SELECT estado FROM PEDIDOS WHERE id_pedido = ?', [id]);
        if (pedido.length === 0) {
            return res.status(404).json({
                mensaje: 'Pedido no encontrado'
            });
        }

        if (pedido[0].estado !== 'DESPACHOS') {
            return res.status(400).json({
                mensaje: 'El pedido debe estar en DESPACHOS para confirmar salida'
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
            mensaje: 'Salida confirmada, pedido enviado a Mensajero'
        });

    } catch (error) {
        await db.query('ROLLBACK');
        console.error('❌ ERROR AL CONFIRMAR SALIDA:', error);
        return res.status(500).json({
            mensaje: 'Error al confirmar salida',
            error: error?.sqlMessage || error?.message
        });
    }
};

// ========================
// MENSAJERO - Confirmar paquete recibido
// ========================
exports.confirmarRecibidoMensajero = async (req, res) => {
    const { id } = req.params;
    const usuario = req.usuario;

    try {
        // Validar rol de Mensajero
        if (usuario.rol !== 'Mensajero' && usuario.rol !== 'Admin') {
            return res.status(403).json({
                mensaje: 'No tienes permisos para esta acción',
                detalles: 'Se requiere rol de Mensajero'
            });
        }

        const [pedido] = await db.query('SELECT estado FROM PEDIDOS WHERE id_pedido = ?', [id]);
        if (pedido.length === 0) {
            return res.status(404).json({
                mensaje: 'Pedido no encontrado'
            });
        }

        if (pedido[0].estado !== 'MENSAJERO') {
            return res.status(400).json({
                mensaje: 'El pedido debe estar con MENSAJERO para confirmar recepción'
            });
        }

        await db.query('START TRANSACTION');

        // Mantenemos en MENSAJERO pero registramos que fue recibido
        await db.query(
            'INSERT INTO HISTORIAL_PEDIDOS (id_pedido, id_usuario, accion, etapa, fecha) VALUES (?, ?, ?, ?, NOW())',
            [id, usuario.id, 'RECIBIDO', 'MENSAJERO']
        );

        await db.query('COMMIT');

        return res.json({
            mensaje: 'Paquete confirmado como recibido por Mensajero'
        });

    } catch (error) {
        await db.query('ROLLBACK');
        console.error('❌ ERROR AL CONFIRMAR RECIBIDO MENSAJERO:', error);
        return res.status(500).json({
            mensaje: 'Error al confirmar recepción',
            error: error?.sqlMessage || error?.message
        });
    }
};

// ========================
// MENSAJERO - Confirmar entrega
// ========================
exports.confirmarEntrega = async (req, res) => {
    const { id } = req.params;
    const usuario = req.usuario;

    try {
        // Validar rol de Mensajero
        if (usuario.rol !== 'Mensajero' && usuario.rol !== 'Admin') {
            return res.status(403).json({
                mensaje: 'No tienes permisos para esta acción',
                detalles: 'Se requiere rol de Mensajero'
            });
        }

        const [pedido] = await db.query('SELECT estado FROM PEDIDOS WHERE id_pedido = ?', [id]);
        if (pedido.length === 0) {
            return res.status(404).json({
                mensaje: 'Pedido no encontrado'
            });
        }

        if (pedido[0].estado !== 'MENSAJERO') {
            return res.status(400).json({
                mensaje: 'El pedido debe estar con MENSAJERO para confirmar entrega'
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
            mensaje: 'Entrega confirmada, pedido enviado a Maquilas'
        });

    } catch (error) {
        await db.query('ROLLBACK');
        console.error('❌ ERROR AL CONFIRMAR ENTREGA:', error);
        return res.status(500).json({
            mensaje: 'Error al confirmar entrega',
            error: error?.sqlMessage || error?.message
        });
    }
};

// ========================
// MAQUILAS - Confirmar paquete recibido
// ========================
exports.confirmarRecibidoMaquilas = async (req, res) => {
    const { id } = req.params;
    const usuario = req.usuario;

    try {
        // Validar rol de Maquilas
        if (usuario.rol !== 'Maquilas' && usuario.rol !== 'Admin') {
            return res.status(403).json({
                mensaje: 'No tienes permisos para esta acción',
                detalles: 'Se requiere rol de Maquilas'
            });
        }

        const [pedido] = await db.query('SELECT estado FROM PEDIDOS WHERE id_pedido = ?', [id]);
        if (pedido.length === 0) {
            return res.status(404).json({
                mensaje: 'Pedido no encontrado'
            });
        }

        if (pedido[0].estado !== 'MAQUILAS') {
            return res.status(400).json({
                mensaje: 'El pedido debe estar en MAQUILAS para confirmar recepción'
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
        console.error('❌ ERROR AL CONFIRMAR RECIBIDO MAQUILAS:', error);
        return res.status(500).json({
            mensaje: 'Error al confirmar recepción en Maquilas',
            error: error?.sqlMessage || error?.message
        });
    }
};

// Eliminar pedido (Solo Admin)
exports.eliminarPedido = async (req, res) => {
    const { id } = req.params;
    const usuario = req.usuario;

    try {
        // Validar que sea Admin
        if (!usuario || usuario.rol !== 'Admin') {
            return res.status(403).json({
                mensaje: 'No tienes permisos para eliminar pedidos',
                detalles: 'Se requiere rol de Admin'
            });
        }

        // Verificar que el pedido existe
        const [pedido] = await db.query(
            'SELECT * FROM PEDIDOS WHERE id_pedido = ?',
            [id]
        );

        if (pedido.length === 0) {
            return res.status(404).json({
                mensaje: 'Pedido no encontrado'
            });
        }

        // Iniciar transacción
        await db.query('START TRANSACTION');

        // Eliminar historial del pedido primero (por restricción de clave foránea)
        await db.query(
            'DELETE FROM HISTORIAL_PEDIDOS WHERE id_pedido = ?',
            [id]
        );

        // Eliminar el pedido
        await db.query(
            'DELETE FROM PEDIDOS WHERE id_pedido = ?',
            [id]
        );

        // Confirmar transacción
        await db.query('COMMIT');

        return res.json({
            mensaje: 'Pedido eliminado correctamente',
            datos: {
                id_pedido: id,
                numero_pedido: pedido[0].numero_pedido,
                eliminado_por: usuario.nombre
            }
        });

    } catch (error) {
        await db.query('ROLLBACK');
        console.error('❌ ERROR AL ELIMINAR PEDIDO:', error);
        return res.status(500).json({
            mensaje: 'Error al eliminar el pedido',
            error: error?.sqlMessage || error?.message || 'Error interno del servidor'
        });
    }
};

// Editar pedido (Solo Admin y solo en estado BODEGA)
exports.editarPedido = async (req, res) => {
    const { id } = req.params;
    const { numero_pedido } = req.body;
    const usuario = req.usuario;

    try {
        // Validar que sea Admin
        if (!usuario || usuario.rol !== 'Admin') {
            return res.status(403).json({
                mensaje: 'No tienes permisos para editar pedidos',
                detalles: 'Se requiere rol de Admin'
            });
        }

        // Validar número de pedido
        if (!numero_pedido || numero_pedido.trim() === '') {
            return res.status(400).json({
                mensaje: 'El número de pedido es requerido',
                detalles: 'Proporciona un número de pedido válido'
            });
        }

        // Verificar que el pedido existe
        const [pedido] = await db.query(
            'SELECT * FROM PEDIDOS WHERE id_pedido = ?',
            [id]
        );

        if (pedido.length === 0) {
            return res.status(404).json({
                mensaje: 'Pedido no encontrado'
            });
        }

        // Validar que el pedido esté en estado BODEGA
        if (pedido[0].estado !== 'BODEGA') {
            return res.status(400).json({
                mensaje: 'Solo se pueden editar pedidos en estado BODEGA',
                detalles: `El pedido está en estado ${pedido[0].estado}`
            });
        }

        // Verificar si el nuevo número ya existe (excepto en el mismo pedido)
        const [pedidosExistentes] = await db.query(
            'SELECT id_pedido FROM PEDIDOS WHERE numero_pedido = ? AND id_pedido != ?',
            [numero_pedido.trim(), id]
        );

        if (pedidosExistentes.length > 0) {
            return res.status(400).json({
                mensaje: 'El número de pedido ya existe',
                detalles: 'Usa un número de pedido diferente'
            });
        }

        // Iniciar transacción
        await db.query('START TRANSACTION');

        const numeroAnterior = pedido[0].numero_pedido;

        // Actualizar el número de pedido
        await db.query(
            'UPDATE PEDIDOS SET numero_pedido = ? WHERE id_pedido = ?',
            [numero_pedido.trim(), id]
        );

        // Registrar en historial
        await db.query(
            'INSERT INTO HISTORIAL_PEDIDOS (id_pedido, id_usuario, accion, etapa, fecha) VALUES (?, ?, ?, ?, NOW())',
            [id, usuario.id, 'EDITADO', 'BODEGA']
        );

        // Confirmar transacción
        await db.query('COMMIT');

        return res.json({
            mensaje: 'Pedido editado correctamente',
            datos: {
                id_pedido: id,
                numero_anterior: numeroAnterior,
                numero_nuevo: numero_pedido.trim(),
                editado_por: usuario.nombre,
                estado: 'BODEGA'
            }
        });

    } catch (error) {
        await db.query('ROLLBACK');
        console.error('❌ ERROR AL EDITAR PEDIDO:', error);
        return res.status(500).json({
            mensaje: 'Error al editar el pedido',
            error: error?.sqlMessage || error?.message || 'Error interno del servidor'
        });
    }
};

// ========================================
// FUNCIONES PARA EL FLUJO LOGÍSTICO
// ========================================

// 🏪 BODEGA: Marcar como entregado a despachos
exports.marcarEntregadoDespachos = async (req, res) => {
    const { id } = req.params;
    const usuario = req.usuario;

    try {
        // Verificar rol
        if (usuario.rol !== 'Bodega') {
            return res.status(403).json({
                mensaje: 'Solo Bodega puede marcar entregas a despachos'
            });
        }

        // Verificar que el pedido existe y está en estado correcto
        const [pedido] = await db.query(
            'SELECT * FROM PEDIDOS WHERE id_pedido = ? AND estado = ?',
            [id, 'En_Bodega']
        );

        if (pedido.length === 0) {
            return res.status(404).json({
                mensaje: 'Pedido no encontrado o no está en estado En_Bodega'
            });
        }

        // Actualizar estado y fecha de inicio del proceso
        console.log(`🔄 Actualizando pedido ${id} de En_Bodega a Entregado_a_Despachos`);
        await db.query(
            'UPDATE PEDIDOS SET estado = ?, started_at = NOW() WHERE id_pedido = ?',
            ['Entregado_a_Despachos', id]
        );

        // Registrar en historial - aparece en la etapa de DESTINO (DESPACHOS)
        console.log(`📝 Registrando en historial: Usuario ${usuario.id_usuario} entregó a DESPACHOS`);
        await db.query(
            'INSERT INTO HISTORIAL_PEDIDOS (id_pedido, id_usuario, accion, etapa, fecha) VALUES (?, ?, ?, ?, NOW())',
            [id, usuario.id_usuario, 'ENTREGADO', 'DESPACHOS']
        );

        console.log(`✅ Pedido ${id} marcado exitosamente como Entregado_a_Despachos`);
        res.json({
            mensaje: 'Pedido marcado como entregado a despachos',
            pedido_id: id,
            nuevo_estado: 'Entregado_a_Despachos'
        });

    } catch (error) {
        console.error('Error al marcar entregado a despachos:', error);
        res.status(500).json({
            mensaje: 'Error interno del servidor',
            detalle: error.message
        });
    }
};

// 🚚 MENSAJERO: Marcar como recogido por mensajero
exports.marcarRecogidoMensajero = async (req, res) => {
    const { id } = req.params;
    const usuario = req.usuario;

    try {
        // Verificar rol
        if (usuario.rol !== 'Mensajero') {
            return res.status(403).json({
                mensaje: 'Solo Mensajero puede marcar como recogido'
            });
        }

        // Verificar que el pedido existe y está disponible para recoger
        const [pedido] = await db.query(
            'SELECT * FROM PEDIDOS WHERE id_pedido = ? AND estado = ?',
            [id, 'Entregado_por_Despachos']
        );

        if (pedido.length === 0) {
            return res.status(404).json({
                mensaje: 'Pedido no encontrado o no disponible para recoger'
            });
        }

        // Actualizar estado solamente - el historial ya se registró cuando despachos entregó
        await db.query(
            'UPDATE PEDIDOS SET estado = ? WHERE id_pedido = ?',
            ['Recibido_por_Mensajero', id]
        );

        // Registrar en historial
        await db.query(
            'INSERT INTO HISTORIAL_PEDIDOS (id_pedido, id_usuario, accion, etapa, fecha) VALUES (?, ?, ?, ?, NOW())',
            [id, usuario.id_usuario, 'RECIBIDO', 'MENSAJERO']
        );

        res.json({
            mensaje: 'Pedido marcado como recogido por mensajero',
            pedido_id: id,
            mensajero: usuario.usuario,
            nuevo_estado: 'Recibido_por_Mensajero'
        });

    } catch (error) {
        console.error('Error al marcar recogido por mensajero:', error);
        res.status(500).json({
            mensaje: 'Error interno del servidor',
            detalle: error.message
        });
    }
};

// 🚚 MENSAJERO: Marcar como entregado a maquila
exports.marcarEntregadoMaquila = async (req, res) => {
    const { id } = req.params;
    const usuario = req.usuario;

    try {
        // Verificar rol
        if (usuario.rol !== 'Mensajero') {
            return res.status(403).json({
                mensaje: 'Solo Mensajero puede marcar entregas a maquila'
            });
        }

        // Verificar que el pedido está en estado correcto (cualquier mensajero puede entregar)
        console.log(`🔍 Verificando pedido ${id} en estado Recibido_por_Mensajero`);
        const [pedido] = await db.query(
            'SELECT * FROM PEDIDOS WHERE id_pedido = ? AND estado = ?',
            [id, 'Recibido_por_Mensajero']
        );

        if (pedido.length === 0) {
            return res.status(404).json({
                mensaje: 'Pedido no encontrado o no está en estado Recibido_por_Mensajero'
            });
        }

        // Actualizar estado y agregar columna notas si no existe
        console.log(`🔄 Actualizando pedido ${id} de Recibido_por_Mensajero a Entregado_a_Maquila`);
        await db.query(
            'UPDATE PEDIDOS SET estado = ? WHERE id_pedido = ?',
            ['Entregado_a_Maquila', id]
        );

        // Registrar en historial - aparece en la etapa de DESTINO (MAQUILAS)
        console.log(`📝 Registrando en historial: Usuario ${usuario.id_usuario} entregó a MAQUILAS`);
        await db.query(
            'INSERT INTO HISTORIAL_PEDIDOS (id_pedido, id_usuario, accion, etapa, fecha) VALUES (?, ?, ?, ?, NOW())',
            [id, usuario.id_usuario, 'ENTREGADO', 'MAQUILAS']
        );

        console.log(`✅ Pedido ${id} marcado exitosamente como Entregado_a_Maquila`);
        res.json({
            mensaje: 'Pedido marcado como entregado a maquila',
            pedido_id: id,
            mensajero: usuario.usuario,
            nuevo_estado: 'Entregado_a_Maquila'
        });

    } catch (error) {
        console.error('Error al marcar entregado a maquila:', error);
        res.status(500).json({
            mensaje: 'Error interno del servidor',
            detalle: error.message
        });
    }
};

// 🏭 MAQUILA: Marcar como recibido por maquila
exports.marcarRecibidoMaquila = async (req, res) => {
    const { id } = req.params;
    const usuario = req.usuario;

    try {
        // Verificar rol
        if (usuario.rol !== 'Maquilas') {
            return res.status(403).json({
                mensaje: 'Solo Maquilas puede marcar como recibido'
            });
        }

        // Verificar que el pedido está disponible para maquila
        const [pedido] = await db.query(
            'SELECT * FROM PEDIDOS WHERE id_pedido = ? AND estado = ?',
            [id, 'Entregado_a_Maquila']
        );

        if (pedido.length === 0) {
            return res.status(404).json({
                mensaje: 'Pedido no encontrado o no disponible para maquila'
            });
        }

        // Actualizar estado y marcar como completado (proceso final)
        await db.query(
            'UPDATE PEDIDOS SET estado = ?, completed_at = NOW() WHERE id_pedido = ?',
            ['Recibido_por_Maquila', id]
        );

        // Registrar en historial
        await db.query(
            'INSERT INTO HISTORIAL_PEDIDOS (id_pedido, id_usuario, accion, etapa, fecha) VALUES (?, ?, ?, ?, NOW())',
            [id, usuario.id_usuario, 'RECIBIDO', 'MAQUILAS']
        );

        res.json({
            mensaje: 'Pedido marcado como recibido por maquila',
            pedido_id: id,
            maquila: usuario.usuario,
            nuevo_estado: 'Recibido_por_Maquila'
        });

    } catch (error) {
        console.error('Error al marcar recibido por maquila:', error);
        res.status(500).json({
            mensaje: 'Error interno del servidor',
            detalle: error.message
        });
    }
};

// 📦 DESPACHOS: Marcar como recibido por despachos
exports.marcarRecibidoDespachos = async (req, res) => {
    const { id } = req.params;
    const usuario = req.usuario;

    try {
        // Verificar rol
        if (usuario.rol !== 'Despachos') {
            return res.status(403).json({
                mensaje: 'Solo Despachos puede marcar como recibido'
            });
        }

        // Verificar que el pedido está disponible para despachos
        const [pedido] = await db.query(
            'SELECT * FROM PEDIDOS WHERE id_pedido = ? AND estado = ?',
            [id, 'Entregado_a_Despachos']
        );

        if (pedido.length === 0) {
            return res.status(404).json({
                mensaje: 'Pedido no encontrado o no disponible para despachos'
            });
        }

        // Actualizar estado solamente - el historial ya se registró cuando bodega entregó
        console.log(`🔄 Actualizando pedido ${id} de Entregado_a_Despachos a Recibido_por_Despachos`);
        await db.query(
            'UPDATE PEDIDOS SET estado = ? WHERE id_pedido = ?',
            ['Recibido_por_Despachos', id]
        );

        // Registrar en historial
        console.log(`📝 Registrando en historial: Usuario ${usuario.id_usuario} recibió en DESPACHOS`);
        await db.query(
            'INSERT INTO HISTORIAL_PEDIDOS (id_pedido, id_usuario, accion, etapa, fecha) VALUES (?, ?, ?, ?, NOW())',
            [id, usuario.id_usuario, 'RECIBIDO', 'DESPACHOS']
        );

        console.log(`✅ Pedido ${id} marcado exitosamente como Recibido_por_Despachos`);
        res.json({
            mensaje: 'Pedido marcado como recibido por despachos',
            pedido_id: id,
            usuario_despachos: usuario.usuario,
            nuevo_estado: 'Recibido_por_Despachos'
        });

    } catch (error) {
        console.error('Error al marcar recibido por despachos:', error);
        res.status(500).json({
            mensaje: 'Error interno del servidor',
            detalle: error.message
        });
    }
};

// 📦 DESPACHOS: Marcar como entregado por despachos
exports.marcarEntregadoDespachosMensajero = async (req, res) => {
    const { id } = req.params;
    const usuario = req.usuario;

    try {
        // Verificar rol
        if (usuario.rol !== 'Despachos') {
            return res.status(403).json({
                mensaje: 'Solo Despachos puede marcar entregas'
            });
        }

        // Verificar que el pedido está con despachos
        const [pedido] = await db.query(
            'SELECT * FROM PEDIDOS WHERE id_pedido = ? AND estado = ?',
            [id, 'Recibido_por_Despachos']
        );

        if (pedido.length === 0) {
            return res.status(404).json({
                mensaje: 'Pedido no encontrado o no disponible para entregar'
            });
        }

        // Actualizar estado
        await db.query(
            'UPDATE PEDIDOS SET estado = ? WHERE id_pedido = ?',
            ['Entregado_por_Despachos', id]
        );

        // Registrar en historial - aparece en la etapa de DESTINO (MENSAJERO)
        await db.query(
            'INSERT INTO HISTORIAL_PEDIDOS (id_pedido, id_usuario, accion, etapa, fecha) VALUES (?, ?, ?, ?, NOW())',
            [id, usuario.id_usuario, 'ENTREGADO', 'MENSAJERO']
        );

        res.json({
            mensaje: 'Pedido marcado como entregado por despachos',
            pedido_id: id,
            usuario_despachos: usuario.usuario,
            nuevo_estado: 'Entregado_por_Despachos'
        });

    } catch (error) {
        console.error('Error al marcar entregado por despachos:', error);
        res.status(500).json({
            mensaje: 'Error interno del servidor',
            detalle: error.message
        });
    }
};

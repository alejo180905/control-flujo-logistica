const db = require('../config/database');
const util = require('util');

exports.getStats = async (req, res) => {
    try {
        console.log('📊 Obteniendo estadísticas del dashboard');
        
        // Consulta para obtener el total de pedidos
        const [totalPedidos] = await db.query('SELECT COUNT(*) as total FROM PEDIDOS');
        console.log('🔍 Total de pedidos query result:', totalPedidos);

        // Consulta para obtener pedidos pendientes (no completados)
        const [pedidosPendientes] = await db.query(`
            SELECT COUNT(*) as pendientes
            FROM PEDIDOS
            WHERE estado != 'Recibido_por_Maquila'
        `);
        console.log('🔍 Pedidos pendientes query result:', pedidosPendientes);

        // Consulta para obtener pedidos completados
        const [pedidosCompletados] = await db.query(`
            SELECT COUNT(*) as completados
            FROM PEDIDOS
            WHERE estado = 'Recibido_por_Maquila'
        `);
        console.log('🔍 Pedidos completados query result:', pedidosCompletados);

        // Consulta para obtener usuarios activos
        const [usuariosActivos] = await db.query('SELECT COUNT(*) as activos FROM USUARIOS WHERE activo = 1');
        console.log('🔍 Usuarios activos query result:', usuariosActivos);

        // Construir objeto de respuesta
        const stats = {
            totalPedidos: totalPedidos[0].total || 0,
            pedidosPendientes: pedidosPendientes[0].pendientes || 0,
            pedidosCompletados: pedidosCompletados[0].completados || 0,
            usuariosActivos: usuariosActivos[0].activos || 0
        };

        console.log('📤 Enviando estadísticas:', stats);
        return res.json(stats);
    } catch (error) {
        console.error('❌ ERROR AL OBTENER ESTADÍSTICAS:', util.inspect(error, { depth: null }));
        return res.status(500).json({
            mensaje: 'Error al obtener estadísticas del dashboard',
            error: error?.sqlMessage || error?.message || 'Revisa los logs del servidor'
        });
    }
};
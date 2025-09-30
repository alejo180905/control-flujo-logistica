// src/middleware/auth.js

const jwt = require("jsonwebtoken");

// 🔒 Middleware para verificar token JWT
exports.verificarToken = (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];

    if (!authHeader) {
      console.warn('🚨 Intento de acceso sin token desde IP:', req.ip);
      return res.status(401).json({
        mensaje: "Token de acceso requerido",
        detalle: "Debes incluir el header Authorization"
      });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      console.warn('🚨 Formato de token inválido desde IP:', req.ip);
      return res.status(401).json({
        mensaje: "Formato de token inválido",
        detalle: "Formato esperado: Bearer <token>"
      });
    }

    // Verificar y decodificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secreto");

    // Agregar información del usuario a la request
    req.usuario = {
      id: decoded.id,
      id_usuario: decoded.id_usuario || decoded.id, // Compatibilidad para historial
      usuario: decoded.usuario,
      rol: decoded.rol,
      nombre: decoded.nombre || decoded.usuario // Para el historial
    };

    console.log('✅ Token válido - Usuario:', req.usuario.usuario, 'Rol:', req.usuario.rol);
    next();

  } catch (error) {
    console.error('❌ Error verificando token:', error.message);

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        mensaje: "Token expirado",
        detalle: "Tu sesión ha expirado. Inicia sesión nuevamente"
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        mensaje: "Token inválido",
        detalle: "El token proporcionado no es válido"
      });
    }

    return res.status(500).json({
      mensaje: "Error interno del servidor",
      detalle: "Error al procesar el token"
    });
  }
};

// 🛡️ Middleware para verificar roles específicos
exports.verificarRol = (rolesPermitidos) => {
  const roles = Array.isArray(rolesPermitidos) ? rolesPermitidos : [rolesPermitidos];

  return (req, res, next) => {
    if (!req.usuario) {
      console.error('🚨 verificarRol llamado sin verificarToken previo');
      return res.status(401).json({
        mensaje: "Usuario no autenticado",
        detalle: "Middleware verificarToken debe ejecutarse primero"
      });
    }

    const rolUsuario = req.usuario.rol;
    const rolUsuarioNormalizado = rolUsuario ? rolUsuario.toLowerCase() : '';
    const rolesNormalizados = roles.map(rol => rol.toLowerCase());

    if (!rolesNormalizados.includes(rolUsuarioNormalizado)) {
      console.warn('🚨 Acceso denegado - Usuario:', req.usuario.usuario, 'Rol:', rolUsuario, 'Roles permitidos:', roles);
      return res.status(403).json({
        mensaje: "No tienes permisos para esta acción",
        detalle: `Se requiere uno de los siguientes roles: ${roles.join(', ')}`,
        rolActual: rolUsuario
      });
    }

    console.log('✅ Rol verificado - Usuario:', req.usuario.usuario, 'Rol:', rolUsuario);
    next();
  };
};

// 🎯 Middlewares específicos para tu sistema logístico

// Solo Admin (crear pedidos, ver usuarios, etc.)
exports.soloAdmin = [
  exports.verificarToken,
  exports.verificarRol(['Admin', 'admin', 'ADMIN'])
];

// Solo Bodega
exports.soloBodega = [
  exports.verificarToken,
  exports.verificarRol(['Bodega', 'bodega', 'BODEGA'])
];

// Solo Despachos
exports.soloDespachos = [
  exports.verificarToken,
  exports.verificarRol(['Despachos', 'despachos', 'DESPACHOS'])
];

// Solo Mensajero
exports.soloMensajero = [
  exports.verificarToken,
  exports.verificarRol(['Mensajero', 'mensajero', 'MENSAJERO'])
];

// Solo Maquilas
exports.soloMaquilas = [
  exports.verificarToken,
  exports.verificarRol(['Maquilas', 'maquilas', 'MAQUILAS'])
];

// Admin o Bodega (para algunas operaciones compartidas)
exports.adminOBodega = [
  exports.verificarToken,
  exports.verificarRol(['Admin', 'admin', 'ADMIN', 'Bodega', 'bodega', 'BODEGA'])
];

// Admin o Despachos
exports.adminODespachos = [
  exports.verificarToken,
  exports.verificarRol(['Admin', 'admin', 'ADMIN', 'Despachos', 'despachos', 'DESPACHOS'])
];

// Admin o Mensajero
exports.adminOMensajero = [
  exports.verificarToken,
  exports.verificarRol(['Admin', 'admin', 'ADMIN', 'Mensajero', 'mensajero', 'MENSAJERO'])
];

// Cualquier usuario autenticado (para ver historial propio, etc.)
exports.usuarioAutenticado = exports.verificarToken;

// 📊 Para operaciones de solo lectura - cualquier rol operativo
exports.rolesOperativos = [
  exports.verificarToken,
  exports.verificarRol([
    'Admin', 'admin', 'ADMIN',
    'Bodega', 'bodega', 'BODEGA',
    'Despachos', 'despachos', 'DESPACHOS',
    'Mensajero', 'mensajero', 'MENSAJERO',
    'Maquilas', 'maquilas', 'MAQUILAS'
  ])
];

// 🔧 Middleware para desarrollo (opcional)
exports.debugAuth = (req, res, next) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('🐛 DEBUG AUTH:', {
      method: req.method,
      url: req.originalUrl,
      usuario: req.usuario ? `${req.usuario.usuario} (${req.usuario.rol})` : 'No autenticado',
      ip: req.ip
    });
  }
  next();
};
// src/controllers/usuariosController.js

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const util = require('util');
const db = require('../config/database');

// Obtener usuario por ID
exports.obtenerUsuarioPorId = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query('SELECT id_usuario, nombre, usuario, rol, activo FROM USUARIOS WHERE id_usuario = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({
        mensaje: 'Usuario no encontrado'
      });
    }

    return res.json(rows[0]);
  } catch (error) {
    console.error('❌ ERROR OBTENER USUARIO:', util.inspect(error, { depth: null }));
    return res.status(500).json({
      mensaje: 'Error al obtener el usuario',
      error: error?.sqlMessage || error?.message || 'Revisa logs del servidor'
    });
  }
};

// Cambiar estado del usuario (activar/desactivar)
exports.toggleEstadoUsuario = async (req, res) => {
  const { id } = req.params;
  try {
    // Primero obtenemos el estado actual
    const [rows] = await db.query('SELECT activo FROM USUARIOS WHERE id_usuario = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({
        mensaje: 'Usuario no encontrado'
      });
    }

    const nuevoEstado = rows[0].activo ? 0 : 1;

    await db.query('UPDATE USUARIOS SET activo = ? WHERE id_usuario = ?', [nuevoEstado, id]);

    return res.json({
      mensaje: `Usuario ${nuevoEstado ? 'activado' : 'desactivado'} correctamente`,
      activo: Boolean(nuevoEstado)
    });
  } catch (error) {
    console.error('❌ ERROR TOGGLE ESTADO:', util.inspect(error, { depth: null }));
    return res.status(500).json({
      mensaje: 'Error al cambiar el estado del usuario',
      error: error?.sqlMessage || error?.message || 'Revisa logs del servidor'
    });
  }
};

// Eliminar usuario
exports.eliminarUsuario = async (req, res) => {
  const { id } = req.params;
  try {
    // Verificar que el usuario existe
    const [rows] = await db.query('SELECT id_usuario, rol FROM USUARIOS WHERE id_usuario = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({
        mensaje: 'Usuario no encontrado'
      });
    }

    // No permitir eliminar al último admin
    if (rows[0].rol.toLowerCase() === 'admin') {
      const [admins] = await db.query('SELECT COUNT(*) as count FROM USUARIOS WHERE rol = "Admin"');
      if (admins[0].count <= 1) {
        return res.status(400).json({
          mensaje: 'No se puede eliminar al último administrador del sistema'
        });
      }
    }

    // Verificar si el usuario tiene historial de pedidos
    const [historial] = await db.query('SELECT COUNT(*) as count FROM HISTORIAL_PEDIDOS WHERE id_usuario = ?', [id]);

    if (historial[0].count > 0) {
      return res.status(400).json({
        mensaje: 'No se puede eliminar este usuario porque tiene historial de pedidos asociado',
        detalles: `El usuario tiene ${historial[0].count} registro(s) en el historial de pedidos. Para mantener la integridad de los datos, no se puede eliminar.`
      });
    }

    // Eliminar el usuario
    await db.query('DELETE FROM USUARIOS WHERE id_usuario = ?', [id]);

    return res.json({
      mensaje: 'Usuario eliminado correctamente'
    });
  } catch (error) {
    console.error('❌ ERROR ELIMINAR USUARIO:', util.inspect(error, { depth: null }));
    return res.status(500).json({
      mensaje: 'Error al eliminar el usuario',
      error: error?.sqlMessage || error?.message || 'Revisa logs del servidor'
    });
  }
};

// Obtener todos los usuarios
exports.obtenerUsuarios = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM USUARIOS');
    return res.json(rows);
  } catch (error) {
    console.error('❌ ERROR OBTENER USUARIOS:', util.inspect(error, { depth: null }));
    return res.status(500).json({
      mensaje: 'Error al obtener usuarios',
      error: error?.sqlMessage || error?.message || 'Revisa logs del servidor'
    });
  }
};

// Registrar usuario
exports.registrarUsuario = async (req, res) => {
  const body = req.body || {};
  const nombre = body.nombre;
  const rol = body.rol;
  const usuario = body.usuario;
  const rawPassword = body['contraseña'] ?? body.contrasena ?? body.password;

  console.log('➡️ LLEGA AL CONTROLADOR DE REGISTRO:', util.inspect(body, { depth: null }));

  try {
    // 🚫 BLOQUEAR CREACIÓN DE ADMIN por parte del público
    // Si la petición viene de un usuario autenticado con rol 'Admin' (req.usuario), permitimos crear Admin.
    // Para poder crear temporalmente un Admin desde un entorno no autenticado, puedes activar
    // la variable de entorno ALLOW_PUBLIC_ADMIN_CREATION=true en el entorno de Heroku.
    const allowPublicAdmin = process.env.ALLOW_PUBLIC_ADMIN_CREATION === 'true';
    if ((rol === "Admin" || rol === "admin" || rol === "ADMIN") && !(req.usuario && req.usuario.rol === 'Admin') && !allowPublicAdmin) {
      console.warn('🚨 Intento de crear usuario Admin bloqueado (no autenticado/Admin):', { usuario, rol });
      return res.status(403).json({
        mensaje: "No tienes permisos para crear un usuario Admin",
        detalle: "Solo los administradores del sistema autenticados pueden crear usuarios Admin"
      });
    }

    if (allowPublicAdmin && (rol === "Admin" || rol === "admin" || rol === "ADMIN")) {
      console.warn('⚠️ Creación pública de Admin permitida temporalmente por ALLOW_PUBLIC_ADMIN_CREATION=true');
    }

    // Validaciones mínimas
    if (!nombre || !usuario || !rawPassword) {
      console.warn('Datos incompletos en registro:', { nombre, usuario });
      return res.status(400).json({ mensaje: 'Campos obligatorios: nombre, usuario, contraseña' });
    }

    // Verificar duplicados - USANDO NOMBRES CORRECTOS DE COLUMNAS
    const [rows] = await db.query('SELECT usuario, id_usuario FROM USUARIOS WHERE usuario = ?', [usuario]);
    if (rows.length > 0) {
      const detalle = {
        usuarioDuplicado: true
      };
      console.warn('Intento de registro con duplicados:', detalle);
      return res.status(400).json({ mensaje: 'El usuario ya existe', detalle });
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    // Preparar INSERT - USANDO NOMBRES CORRECTOS DE COLUMNAS
    // Nota: La columna de contraseña parece llamarse "contraseña" en tu BD
  const insertSql = 'INSERT INTO USUARIOS (nombre, rol, usuario, contrasena) VALUES (?, ?, ?, ?)';
    const params = [nombre, rol, usuario, hashedPassword];
    console.log('📌 Ejecutando INSERT:', insertSql, params);

    await db.query(insertSql, params);

    console.log('✅ Usuario registrado exitosamente:', { usuario, rol });
    return res.status(201).json({ mensaje: 'Usuario registrado correctamente' });
  } catch (error) {
    console.error('❌ ERROR REGISTRO:', util.inspect(error, { depth: null }));
    return res.status(500).json({
      mensaje: 'Error al registrar usuario',
      error: error?.sqlMessage || error?.message || 'Revisa logs del servidor'
    });
  }
};

// Login
exports.login = async (req, res) => {
  const body = req.body || {};
  const usuario = body.usuario;
  const rawPassword = body['contraseña'] ?? body.contrasena ?? body.password;

  try {
    if (!usuario || !rawPassword) {
      return res.status(400).json({ mensaje: 'Usuario y contraseña son obligatorios' });
    }

    // Buscar por usuario - USANDO NOMBRES CORRECTOS DE COLUMNAS
    const [rows] = await db.query('SELECT * FROM USUARIOS WHERE usuario = ?', [usuario]);
    if (rows.length === 0) {
      return res.status(400).json({ mensaje: 'Usuario no encontrado' });
    }

    const usuarioEncontrado = rows[0];
    // Soporte para ambas posibles columnas: 'contraseña' (original) o 'contrasena' (sin acento)
    const hashed = usuarioEncontrado['contraseña'] ?? usuarioEncontrado.contrasena ?? usuarioEncontrado.password;

    const passwordValida = await bcrypt.compare(rawPassword, hashed);
    if (!passwordValida) {
      return res.status(401).json({ mensaje: 'Contraseña incorrecta' });
    }

    // Generar token JWT - USANDO NOMBRES CORRECTOS DE COLUMNAS
    const token = jwt.sign(
      {
        id: usuarioEncontrado.id_usuario, // Cambiado a id_usuario
        id_usuario: usuarioEncontrado.id_usuario, // Para compatibilidad con historial
        usuario: usuarioEncontrado.usuario,
        rol: usuarioEncontrado.rol,
        nombre: usuarioEncontrado.nombre || usuarioEncontrado.usuario
      },
      process.env.JWT_SECRET || 'secreto',
      { expiresIn: '1h' }
    );

    console.log('✅ Login exitoso para:', usuario);
    return res.json({ mensaje: 'Login exitoso', token });
  } catch (error) {
    console.error('❌ ERROR LOGIN:', util.inspect(error, { depth: null }));
    return res.status(500).json({
      mensaje: 'Error al iniciar sesión',
      error: error?.sqlMessage || error?.message || 'Revisa logs del servidor'
    });
  }
};

// Editar perfil del usuario (nombre y contraseña)
exports.editarPerfil = async (req, res) => {
  const { nombre, passwordActual, password, confirmarPassword } = req.body;
  const usuario = req.usuario; // Viene del middleware de autenticación

  console.log('🔍 EDITANDO PERFIL - Usuario del token:', usuario);
  console.log('🔍 EDITANDO PERFIL - Datos recibidos:', { nombre, tienePasswordActual: !!passwordActual, tienePassword: !!password });

  try {
    // Validar que el usuario esté autenticado
    if (!usuario || !usuario.id) {
      return res.status(401).json({
        mensaje: 'Usuario no autenticado'
      });
    }

    // Validar nombre
    if (!nombre || nombre.trim().length < 2) {
      return res.status(400).json({
        mensaje: 'El nombre debe tener al menos 2 caracteres'
      });
    }

    // Validar contraseña si se proporciona
    if (password) {
      // Verificar que se proporcione la contraseña actual
      if (!passwordActual) {
        return res.status(400).json({
          mensaje: 'Debes proporcionar tu contraseña actual para cambiarla'
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          mensaje: 'La contraseña nueva debe tener al menos 6 caracteres'
        });
      }

      if (password !== confirmarPassword) {
        return res.status(400).json({
          mensaje: 'Las contraseñas nuevas no coinciden'
        });
      }
    }

    // Verificar que el usuario existe y obtener su contraseña actual
    const [usuarioExistente] = await db.query(
      'SELECT * FROM USUARIOS WHERE id_usuario = ?',
      [usuario.id]
    );

    console.log('🔍 VERIFICACIÓN - Usuario encontrado:', usuarioExistente);

    if (usuarioExistente.length === 0) {
      return res.status(404).json({
        mensaje: 'Usuario no encontrado'
      });
    }

    // Si se quiere cambiar la contraseña, verificar la contraseña actual
    if (password) {
    const contraseñaValida = await bcrypt.compare(passwordActual, usuarioExistente[0]['contraseña'] ?? usuarioExistente[0].contrasena ?? usuarioExistente[0].password);
      if (!contraseñaValida) {
        return res.status(400).json({
          mensaje: 'La contraseña actual es incorrecta'
        });
      }
    }

    // Preparar la actualización
    let updateQuery = 'UPDATE USUARIOS SET nombre = ?';
    let updateParams = [nombre.trim()];

    // Si se proporciona nueva contraseña, encriptarla
    if (password) {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
  updateQuery += ', contrasena = ?';
      updateParams.push(hashedPassword);
    }

    updateQuery += ' WHERE id_usuario = ?';
    updateParams.push(usuario.id);

    console.log('🔍 ACTUALIZACIÓN - Query:', updateQuery);
    console.log('🔍 ACTUALIZACIÓN - Params:', updateParams);

    // Ejecutar la actualización
    await db.query(updateQuery, updateParams);

    console.log('✅ Perfil actualizado para usuario:', usuario.usuario);

    return res.json({
      mensaje: 'Perfil actualizado correctamente',
      datos: {
        id_usuario: usuario.id,
        nombre: nombre.trim(),
        usuario: usuario.usuario,
        rol: usuario.rol,
        password_actualizada: !!password
      }
    });

  } catch (error) {
    console.error('❌ ERROR AL ACTUALIZAR PERFIL:', util.inspect(error, { depth: null }));
    return res.status(500).json({
      mensaje: 'Error al actualizar el perfil',
      error: error?.sqlMessage || error?.message || 'Error interno del servidor'
    });
  }
};

// Reset de contraseña por Admin
exports.resetearPassword = async (req, res) => {
  const { id_usuario, nueva_password } = req.body;
  const adminUsuario = req.usuario; // Admin que está haciendo el reset

  try {
    // Validar que sea Admin
    if (!adminUsuario || adminUsuario.rol !== 'Admin') {
      return res.status(403).json({
        mensaje: 'No tienes permisos para resetear contraseñas',
        detalles: 'Se requiere rol de Admin'
      });
    }

    // Validar parámetros
    if (!id_usuario || !nueva_password) {
      return res.status(400).json({
        mensaje: 'ID de usuario y nueva contraseña son requeridos'
      });
    }

    if (nueva_password.length < 6) {
      return res.status(400).json({
        mensaje: 'La nueva contraseña debe tener al menos 6 caracteres'
      });
    }

    // Verificar que el usuario a resetear existe
    const [usuarioTarget] = await db.query(
      'SELECT id_usuario, usuario, nombre, rol FROM USUARIOS WHERE id_usuario = ?',
      [id_usuario]
    );

    if (usuarioTarget.length === 0) {
      return res.status(404).json({
        mensaje: 'Usuario no encontrado'
      });
    }

    // Encriptar la nueva contraseña
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(nueva_password, saltRounds);

    // Actualizar la contraseña
    await db.query(
      'UPDATE USUARIOS SET contrasena = ? WHERE id_usuario = ?',
      [hashedPassword, id_usuario]
    );

    console.log(`✅ Contraseña reseteada para usuario: ${usuarioTarget[0].usuario} por Admin: ${adminUsuario.usuario}`);

    return res.json({
      mensaje: 'Contraseña reseteada correctamente',
      datos: {
        usuario_actualizado: usuarioTarget[0].usuario,
        nombre: usuarioTarget[0].nombre,
        rol: usuarioTarget[0].rol,
        nueva_password_temporal: nueva_password,
        reseteado_por: adminUsuario.nombre
      }
    });

  } catch (error) {
    console.error('❌ ERROR AL RESETEAR PASSWORD:', util.inspect(error, { depth: null }));
    return res.status(500).json({
      mensaje: 'Error al resetear la contraseña',
      error: error?.sqlMessage || error?.message || 'Error interno del servidor'
    });
  }
};

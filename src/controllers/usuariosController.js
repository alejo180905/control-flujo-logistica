// src/controllers/usuariosController.js

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const util = require('util');
const db = require('../config/database');

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
    // 🚫 BLOQUEAR CREACIÓN DE ADMIN
  //  if (rol === "Admin" || rol === "admin" || rol === "ADMIN") {
   //   console.warn('🚨 Intento de crear usuario Admin bloqueado:', { usuario, rol });
   //   return res.status(403).json({
     //   mensaje: "No tienes permisos para crear un usuario Admin",
    //    detalle: "Solo los administradores del sistema pueden crear usuarios Admin"
    //  });
   // }

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
    const insertSql = 'INSERT INTO USUARIOS (nombre, rol, usuario, contraseña) VALUES (?, ?, ?, ?)';
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
    // La columna de contraseña parece llamarse "contraseña" en tu BD
    const hashed = usuarioEncontrado.contraseña;

    const passwordValida = await bcrypt.compare(rawPassword, hashed);
    if (!passwordValida) {
      return res.status(401).json({ mensaje: 'Contraseña incorrecta' });
    }

    // Generar token JWT - USANDO NOMBRES CORRECTOS DE COLUMNAS
    const token = jwt.sign(
      {
        id: usuarioEncontrado.id_usuario, // Cambiado a id_usuario
        usuario: usuarioEncontrado.usuario,
        rol: usuarioEncontrado.rol
      },
      process.env.JWT_SECRET || 'secreto_local',
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

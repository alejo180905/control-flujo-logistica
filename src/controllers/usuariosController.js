// src/controllers/usuariosController.js

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const util = require('util');
const db = require('../config/database'); // asegúrate que exporta pool/query usable con await

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
  // aceptamos varios nombres posibles de contraseña por si el JSON usa distinta clave
  const body = req.body || {};
  const nombre = body.nombre;
  const email = body.email;
  const rol = body.rol;
  const usuario = body.usuario;
  const rawPassword = body['contraseña'] ?? body.contrasena ?? body.password;

  console.log('➡️ LLEGA AL CONTROLADOR DE REGISTRO:', util.inspect(body, { depth: null }));

  try {
    // Validaciones mínimas
    if (!nombre || !usuario || !rawPassword) {
      console.warn('Datos incompletos en registro:', { nombre, usuario });
      return res.status(400).json({ mensaje: 'Campos obligatorios: nombre, usuario, contraseña' });
    }

    // Verificar duplicados
    const [rows] = await db.query('SELECT usuario, email, id_usuarios FROM USUARIOS WHERE usuario = ? OR email = ?', [usuario, email]);
    if (rows.length > 0) {
      // identificar cuál campo está duplicado
      const existeUsuario = rows.some(r => r.usuario === usuario);
      const existeEmail = email ? rows.some(r => r.email === email) : false;
      const detalle = {
        usuarioDuplicado: existeUsuario,
        emailDuplicado: existeEmail
      };
      console.warn('Intento de registro con duplicados:', detalle);
      return res.status(400).json({ mensaje: 'El usuario o email ya existe', detalle });
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    // Preparar INSERT (log para debug)
    const insertSql = 'INSERT INTO USUARIOS (nombre, email, rol, usuario, contraseña) VALUES (?, ?, ?, ?, ?)';
    const params = [nombre, email, rol, usuario, hashedPassword];
    console.log('📌 Ejecutando INSERT:', insertSql, params);

    await db.query(insertSql, params);

    return res.status(201).json({ mensaje: 'Usuario registrado correctamente' });
  } catch (error) {
    // Log detallado en consola para debugging
    console.error('❌ ERROR REGISTRO:', util.inspect(error, { depth: null }));
    // Respuesta al cliente: mensaje claro, detalle mínimo (no exponer todo el objeto error en producción)
    return res.status(500).json({
      mensaje: 'Error al registrar usuario',
      error: error?.sqlMessage || error?.message || 'Revisa logs del servidor'
    });
  }
};

// Login
exports.login = async (req, res) => {
  const body = req.body || {};
  const email = body.email;
  const rawPassword = body['contraseña'] ?? body.contrasena ?? body.password;

  try {
    if (!email || !rawPassword) {
      return res.status(400).json({ mensaje: 'Email y contraseña son obligatorios' });
    }

    const [rows] = await db.query('SELECT * FROM USUARIOS WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(400).json({ mensaje: 'Usuario no encontrado' });
    }

    const usuario = rows[0];
    // usar propiedad de la fila tal como viene (puede ser 'contraseña')
    const hashed = usuario['contraseña'] ?? usuario.contrasena ?? usuario.password;

    const passwordValida = await bcrypt.compare(rawPassword, hashed);
    if (!passwordValida) {
      return res.status(401).json({ mensaje: 'Contraseña incorrecta' });
    }

    // Generar token JWT
    const token = jwt.sign(
      { id: usuario.id_usuarios, usuario: usuario.usuario, rol: usuario.rol },
      process.env.JWT_SECRET || 'secreto_local',
      { expiresIn: '1h' }
    );

    return res.json({ mensaje: 'Login exitoso', token });
  } catch (error) {
    console.error('❌ ERROR LOGIN:', util.inspect(error, { depth: null }));
    return res.status(500).json({
      mensaje: 'Error al iniciar sesión',
      error: error?.sqlMessage || error?.message || 'Revisa logs del servidor'
    });
  }
};


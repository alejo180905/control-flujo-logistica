const express = require('express');
const router = express.Router();
const usuariosController = require('../controllers/usuariosController');
const { soloAdmin } = require('../middleware/auth'); // 👈 AGREGAR ESTA LÍNEA

// Rutas públicas (sin cambios)
router.post('/registro', usuariosController.registrarUsuario);
router.post('/login', usuariosController.login);

// Esta ruta ahora requiere ser Admin
router.get('/', soloAdmin, usuariosController.obtenerUsuarios); // 👈 AGREGAR soloAdmin

module.exports = router;


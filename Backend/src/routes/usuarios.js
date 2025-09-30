const express = require('express');
const router = express.Router();
const usuariosController = require('../controllers/usuariosController');
const { soloAdmin, verificarToken } = require('../middleware/auth');

// Rutas públicas (sin cambios)
router.post('/registro', usuariosController.registrarUsuario);
router.post('/login', usuariosController.login);

// Rutas protegidas para todos los usuarios autenticados
router.put('/perfil', verificarToken, usuariosController.editarPerfil);

// Rutas solo para Admin
router.post('/', soloAdmin, usuariosController.registrarUsuario); // Crear usuario como admin
router.get('/', soloAdmin, usuariosController.obtenerUsuarios);
router.get('/:id', soloAdmin, usuariosController.obtenerUsuarioPorId);
router.put('/:id/toggle-status', soloAdmin, usuariosController.toggleEstadoUsuario);
router.delete('/:id', soloAdmin, usuariosController.eliminarUsuario);
router.post('/reset-password', soloAdmin, usuariosController.resetearPassword);

module.exports = router;


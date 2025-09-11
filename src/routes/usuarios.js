const express = require('express');
const router = express.Router();
const usuariosController = require('../controllers/usuariosController');


// 👇 IMPORTANTE: sin paréntesis
router.post('/registro', usuariosController.registrarUsuario);
router.post('/login', usuariosController.login);
router.get('/', usuariosController.obtenerUsuarios);

module.exports = router;


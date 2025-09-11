const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');


/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Iniciar sesión de usuario
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               contraseña:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login exitoso
 *       400:
 *         description: Usuario no encontrado
 *       401:
 *         description: Contraseña incorrecta
 */
router.post('/login', authController.login);

/**
 * @swagger
 * /api/auth/registro:
 *   post:
 *     summary: Registrar un nuevo usuario
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               email:
 *                 type: string
 *               rol:
 *                 type: string
 *               usuario:
 *                 type: string
 *               contraseña:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuario registrado correctamente
 *       400:
 *         description: El usuario o email ya existe
 */
router.post('/registro', authController.registro);

module.exports = router;


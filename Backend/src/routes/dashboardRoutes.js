const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { verificarToken } = require('../middleware/auth');

// Ruta protegida para obtener estadísticas del dashboard
router.get('/stats', verificarToken, dashboardController.getStats);

module.exports = router;
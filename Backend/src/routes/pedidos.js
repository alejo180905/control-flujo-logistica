const express = require("express");
const router = express.Router();
const pedidosController = require("../controllers/pedidosController");
const { verificarToken, verificarRol, soloBodega, soloDespachos, soloMensajero, soloMaquilas, soloAdmin } = require("../middleware/auth");

// Rutas básicas de pedidos (protegidas con token)
router.post("/", soloAdmin, pedidosController.crearPedido);
router.get("/", verificarToken, pedidosController.listarPedidos);
router.get("/:id/historial", verificarToken, pedidosController.verHistorialPedido);

// Rutas para cambios de estado
router.put("/:id/bodega/entregar", soloBodega, pedidosController.entregarBodega);
router.put("/:id/despacho/entregar", soloDespachos, pedidosController.entregarDespacho);
router.put("/:id/mensajero/entregar", soloMensajero, pedidosController.entregarMensajero);
router.put("/:id/maquila/recibir", soloMaquilas, pedidosController.recibirMaquila);

module.exports = router;
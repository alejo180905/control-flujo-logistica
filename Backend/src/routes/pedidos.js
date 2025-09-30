const express = require("express");
const router = express.Router();
const pedidosController = require("../controllers/pedidosController");
const { verificarToken, verificarRol, soloBodega, soloDespachos, soloMensajero, soloMaquilas, soloAdmin } = require("../middleware/auth");

// Rutas básicas de pedidos (protegidas con token)
router.post("/", soloAdmin, pedidosController.crearPedido);
router.get("/", verificarToken, pedidosController.listarPedidos);
router.get("/:id/historial", verificarToken, pedidosController.verHistorialPedido);
router.put("/:id", soloAdmin, pedidosController.editarPedido);
router.delete("/:id", soloAdmin, pedidosController.eliminarPedido);

// Rutas para cambios de estado según el flujo logístico
// 🏪 BODEGA - Marcar como entregado a despachos
router.put("/:id/bodega/entregar-despachos", soloBodega, pedidosController.marcarEntregadoDespachos);

// � DESPACHOS - Recibir y entregar a mensajeros
router.put("/:id/despachos/recibir", soloDespachos, pedidosController.marcarRecibidoDespachos);
router.put("/:id/despachos/entregar-mensajero", soloDespachos, pedidosController.marcarEntregadoDespachosMensajero);

// �🚚 MENSAJERO - Recoger de despachos y entregar a maquila
router.put("/:id/mensajero/recoger", soloMensajero, pedidosController.marcarRecogidoMensajero);
router.put("/:id/mensajero/entregar-maquila", soloMensajero, pedidosController.marcarEntregadoMaquila);

// 🏭 MAQUILAS - Confirmar recepción
router.put("/:id/maquilas/recibir", soloMaquilas, pedidosController.marcarRecibidoMaquila);

module.exports = router;
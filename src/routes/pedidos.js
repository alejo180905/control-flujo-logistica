const express = require("express");
const router = express.Router();
const pedidosController = require("../controllers/pedidosController");

// ========================
// ADMIN
// ========================
router.post("/", pedidosController.crearPedido);        // Crear pedido
router.get("/historial", pedidosController.verHistorial); // Ver historial

// ========================
// BODEGA
// ========================
router.put("/:id/bodega/recibir", pedidosController.recibirBodega);
router.put("/:id/bodega/entregar", pedidosController.entregarBodega);

// ========================
// DESPACHOS
// ========================
router.put("/:id/despacho/recibir", pedidosController.recibirDespacho);
router.put("/:id/despacho/entregar", pedidosController.entregarDespacho);

// ========================
// MENSAJERO
// ========================
router.put("/:id/mensajero/recibir", pedidosController.recibirMensajero);
router.put("/:id/mensajero/entregar", pedidosController.entregarMensajero);

// ========================
// MAQUILAS
// ========================
router.put("/:id/maquila/recibir", pedidosController.recibirMaquila);

module.exports = router;
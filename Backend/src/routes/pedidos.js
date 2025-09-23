const express = require("express");
const router = express.Router();
const pedidosController = require("../controllers/pedidosController");
const { soloAdmin, soloBodega, soloDespachos, soloMensajero, soloMaquilas, rolesOperativos } = require("../middleware/auth"); // 👈 AGREGAR ESTA LÍNEA

// Solo Admin puede crear pedidos
router.post("/", soloAdmin, pedidosController.crearPedido); // 👈 AGREGAR soloAdmin

// Todos los roles operativos pueden ver historial
router.get("/historial", rolesOperativos, pedidosController.verHistorial); // 👈 AGREGAR rolesOperativos

// Solo Bodega puede hacer estas operaciones
router.put("/:id/bodega/recibir", soloBodega, pedidosController.recibirBodega); // 👈 AGREGAR soloBodega
router.put("/:id/bodega/entregar", soloBodega, pedidosController.entregarBodega); // 👈 AGREGAR soloBodega

// Solo Despachos puede hacer estas operaciones
router.put("/:id/despacho/recibir", soloDespachos, pedidosController.recibirDespacho); // 👈 AGREGAR soloDespachos
router.put("/:id/despacho/entregar", soloDespachos, pedidosController.entregarDespacho); // 👈 AGREGAR soloDespachos

// Solo Mensajero puede hacer estas operaciones
router.put("/:id/mensajero/recibir", soloMensajero, pedidosController.recibirMensajero); // 👈 AGREGAR soloMensajero
router.put("/:id/mensajero/entregar", soloMensajero, pedidosController.entregarMensajero); // 👈 AGREGAR soloMensajero

// Solo Maquilas puede hacer esta operación
router.put("/:id/maquila/recibir", soloMaquilas, pedidosController.recibirMaquila); // 👈 AGREGAR soloMaquilas

module.exports = router;
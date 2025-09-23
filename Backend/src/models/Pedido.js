const db = require("../config/database");

class Pedido {
  static async crear({ numero_pedido, estado }) {
    const [result] = await db.query(
      "INSERT INTO pedidos (numero_pedido, estado) VALUES (?, ?)",
      [numero_pedido, estado]
    );
    return result.insertId;
  }

  static async obtenerPorEstado(estado) {
    const [rows] = await db.query("SELECT * FROM pedidos WHERE estado = ?", [estado]);
    return rows;
  }

  static async actualizarEstado(id_pedido, nuevoEstado) {
    await db.query("UPDATE pedidos SET estado = ? WHERE id_pedido = ?", [nuevoEstado, id_pedido]);
  }
}

module.exports = Pedido;
const db = require("../config/database");

class Usuario {
  static async obtenerTodos() {
    const [rows] = await db.query("SELECT * FROM usuarios");
    return rows;
  }

  static async buscarPorUsuario(usuario) {
    const [rows] = await db.query("SELECT * FROM usuarios WHERE usuario = ?", [usuario]);
    return rows[0];
  }

  static async crear({ nombre, usuario, contraseña, rol }) {
    const [result] = await db.query(
      "INSERT INTO usuarios (nombre, usuario, contraseña, rol) VALUES (?, ?, ?, ?)",
      [nombre, usuario, contraseña, rol]
    );
    return result.insertId;
  }
}

module.exports = Usuario;

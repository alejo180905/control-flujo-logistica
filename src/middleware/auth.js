const jwt = require("jsonwebtoken");

exports.verificarToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res.status(403).json({ mensaje: "Token requerido" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(403).json({ mensaje: "Formato de token inválido" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secreto");
    req.usuario = decoded; // ahora tenemos id y email en req.usuario
    next();
  } catch (error) {
    return res.status(401).json({ mensaje: "Token inválido o expirado" });
  }
};

exports.verificarRol = (rolesPermitidos) => {
  return (req, res, next) => {
    if (!rolesPermitidos.includes(req.usuario.rol)) {
      return res.status(403).json({ mensaje: "No tienes permisos para esta acción" });
    }
    next();
  };
};

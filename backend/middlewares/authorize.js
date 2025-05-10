function authorizeRole(requiredRole) {
  return (req, res, next) => {
    // Verifica que ya se haya autenticado el usuario
    if (!req.user) {
      return res.status(401).json({ message: "No autenticado" });
    }
    // Comprueba que el rol del usuario coincida con el rol requerido para acceder a la ruta)
    if (req.user.rol !== requiredRole) {
      return res
        .status(403)
        .json({ message: "Acceso denegado: rol no autorizado" });
    }
    next();
  };
}

module.exports = authorizeRole;

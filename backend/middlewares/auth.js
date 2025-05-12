const jwt = require("jsonwebtoken");

// Utiliza una variable de entorno para la clave secreta
const JWT_SECRET = process.env.JWT_SECRET;

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Token no proporcionado" });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Token inválido o expirado" });
    }
    // Agregamos al request la información decodificada del token
    req.user = decoded;
    next();
  });
}

module.exports = authenticateToken;

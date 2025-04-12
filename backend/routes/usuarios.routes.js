const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Usuario } = require("../models");

// Endpoint para registrar un nuevo usuario
router.post("/register", async (req, res) => {
  try {
    const { nombre, apellido, email, password, direccion, telefono, rol } =
      req.body;
    if (!nombre || !apellido || !email || !password || !rol) {
      return res.status(400).json({ message: "Faltan datos requeridos." });
    }
    const usuarioExistente = await Usuario.findOne({ where: { email } });
    if (usuarioExistente) {
      return res.status(400).json({ message: "El email ya está registrado." });
    }
    const hash = await bcrypt.hash(password, 10);
    const nuevoUsuario = await Usuario.create({
      nombre,
      apellido,
      email,
      password: hash,
      direccion,
      telefono,
      rol,
    });
    return res
      .status(201)
      .json({ message: "Usuario creado correctamente", usuario: nuevoUsuario });
  } catch (error) {
    console.error("Error en registro:", error);
    return res.status(500).json({ message: "Error en el servidor" });
  }
});

// Endpoint para iniciar sesión
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Se requiere email y password." });
    }
    const usuario = await Usuario.findOne({ where: { email } });
    if (!usuario) {
      return res.status(400).json({ message: "Credenciales incorrectas." });
    }
    const esValido = await bcrypt.compare(password, usuario.password);
    if (!esValido) {
      return res.status(400).json({ message: "Credenciales incorrectas." });
    }
    // Generación del token JWT
    const token = jwt.sign(
      { usuarioID: usuario.usuarioID, email: usuario.email, rol: usuario.rol },
      process.env.JWT_SECRET || "tu_clave_secreta",
      { expiresIn: "1h" }
    );
    return res.json({
      message: "Inicio de sesión exitoso.",
      token,
      usuario: {
        usuarioID: usuario.usuarioID,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
        rol: usuario.rol,
        direccion: usuario.direccion,
        telefono: usuario.telefono,
      },
    });
  } catch (error) {
    console.error("Error en login:", error);
    return res.status(500).json({ message: "Error en el servidor." });
  }
});

module.exports = router;

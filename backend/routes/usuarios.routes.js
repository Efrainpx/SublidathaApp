const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authenticateToken = require("../middlewares/auth");
const { Usuario } = require("../models");

// Multer storage para avatars
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `avatar_${req.user.usuarioID}${ext}`);
  },
});
const uploadAvatar = multer({ storage: avatarStorage });

//Endpoint para subir avatar
router.post(
  "/me/avatar",
  authenticateToken,
  uploadAvatar.single("avatar"),
  async (req, res) => {
    try {
      const usuario = await Usuario.findByPk(req.user.usuarioID);
      if (!usuario)
        return res.status(404).json({ message: "Usuario no encontrado" });

      // Construye la URL pública
      usuario.profileImage = `${req.protocol}://${req.get("host")}/uploads/${
        req.file.filename
      }`;
      await usuario.save();

      res.json({
        message: "Avatar actualizado",
        profileImage: usuario.profileImage,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Error al subir avatar" });
    }
  }
);

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

// Endpoint para obtener datos del usuario logueado
router.get("/me", authenticateToken, async (req, res) => {
  try {
    const user = await Usuario.findByPk(req.user.usuarioID, {
      attributes: { exclude: ["password"] },
    });
    if (!user)
      return res.status(404).json({ message: "Usuario no encontrado" });
    return res.json(user);
  } catch (err) {
    console.error("Error al obtener perfil:", err);
    return res.status(500).json({ message: "Error en el servidor" });
  }
});

//Endpoint para actualizar datos del Usuario
router.put("/me", authenticateToken, async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.user.usuarioID);
    if (!usuario)
      return res.status(404).json({ message: "Usuario no encontrado" });

    const { nombre, apellido, email, password, direccion, telefono } = req.body;

    if (nombre !== undefined) usuario.nombre = nombre;
    if (apellido !== undefined) usuario.apellido = apellido;
    if (email !== undefined) usuario.email = email;
    if (direccion !== undefined) usuario.direccion = direccion;
    if (telefono !== undefined) usuario.telefono = telefono;
    if (password !== undefined && password.trim() !== "") {
      const salt = await bcrypt.genSalt(10);
      usuario.password = await bcrypt.hash(password, salt);
    }

    await usuario.save();
    const { password: _, ...sinPass } = usuario.toJSON();
    res.json(sinPass);
  } catch (err) {
    console.error("Error al actualizar perfil:", err);
    res.status(500).json({ message: "Error al actualizar perfil" });
  }
});

module.exports = router;

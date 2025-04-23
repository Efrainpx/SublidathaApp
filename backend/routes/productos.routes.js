// routes/productos.routes.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const { Producto } = require("../models");
// Importar middlewares de autenticación y autorización
const authenticateToken = require("../middlewares/auth");
const authorizeRole = require("../middlewares/authorize");

// Multer storage para imágenes de productos
const prodStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `producto_${Date.now()}`;
    cb(null, name + ext);
  },
});
const uploadProductImage = multer({ storage: prodStorage });

//Endpoint para crear producto con imagen
router.post(
  "/",
  authenticateToken,
  uploadProductImage.single("imagen"),
  async (req, res) => {
    try {
      const { nombre, descripcion, precio, stock } = req.body;
      const imagenUrl = req.file
        ? `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`
        : null;

      const prod = await Producto.create({
        nombre,
        descripcion,
        precio,
        stock,
        imagen: imagenUrl,
      });
      res.status(201).json(prod);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Error al crear producto" });
    }
  }
);

//Endpoint para actualizar sólo la imagen de un producto
router.put(
  "/:id/imagen",
  authenticateToken,
  uploadProductImage.single("imagen"),
  async (req, res) => {
    try {
      const prod = await Producto.findByPk(req.params.id);
      if (!prod)
        return res.status(404).json({ message: "Producto no encontrado" });

      prod.imagen = `${req.protocol}://${req.get("host")}/uploads/${
        req.file.filename
      }`;
      await prod.save();
      res.json({
        message: "Imagen de producto actualizada",
        imagen: prod.imagen,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Error al actualizar imagen" });
    }
  }
);

// Endpoint para listar todos los productos
router.get("/", async (req, res) => {
  try {
    const productos = await Producto.findAll();
    return res.json(productos);
  } catch (error) {
    console.error("Error al listar productos:", error);
    return res.status(500).json({ message: "Error en el servidor" });
  }
});

// Endpoint para obtener los detalles de un producto por su ID
router.get("/:id", async (req, res) => {
  try {
    const prod = await Producto.findByPk(req.params.id);
    if (!prod)
      return res.status(404).json({ message: "Producto no encontrado" });
    return res.json(prod);
  } catch (err) {
    console.error("Error al obtener producto:", err);
    return res.status(500).json({ message: "Error en el servidor" });
  }
});

// Endpoint para agregar un nuevo producto (solo para administradores)
router.post(
  "/",
  authenticateToken,
  authorizeRole("administrador"),
  async (req, res) => {
    try {
      const { nombre, descripcion, precio, stock, imagen } = req.body;
      if (!nombre || precio === undefined || stock === undefined) {
        return res.status(400).json({
          message:
            "Faltan datos requeridos. Se requiere al menos nombre, precio y stock.",
        });
      }
      const nuevoProducto = await Producto.create({
        nombre,
        descripcion,
        precio,
        stock,
        imagen,
      });
      return res.status(201).json({
        message: "Producto creado correctamente",
        producto: nuevoProducto,
      });
    } catch (error) {
      console.error("Error al agregar producto:", error);
      return res.status(500).json({ message: "Error en el servidor" });
    }
  }
);

// Endpoint para actualizar un producto (solo para administradores)
router.put(
  "/:id",
  authenticateToken,
  authorizeRole("administrador"),
  async (req, res) => {
    try {
      const producto = await Producto.findByPk(req.params.id);
      if (!producto) {
        return res.status(404).json({ message: "Producto no encontrado" });
      }
      const { nombre, descripcion, precio, stock, imagen } = req.body;
      producto.nombre = nombre !== undefined ? nombre : producto.nombre;
      producto.descripcion =
        descripcion !== undefined ? descripcion : producto.descripcion;
      producto.precio = precio !== undefined ? precio : producto.precio;
      producto.stock = stock !== undefined ? stock : producto.stock;
      producto.imagen = imagen !== undefined ? imagen : producto.imagen;
      await producto.save();
      return res.json({
        message: "Producto actualizado correctamente",
        producto,
      });
    } catch (error) {
      console.error("Error al actualizar producto:", error);
      return res.status(500).json({ message: "Error en el servidor" });
    }
  }
);

// Endpoint para eliminar un producto (solo para administradores)
router.delete(
  "/:id",
  authenticateToken,
  authorizeRole("administrador"),
  async (req, res) => {
    try {
      const producto = await Producto.findByPk(req.params.id);
      if (!producto) {
        return res.status(404).json({ message: "Producto no encontrado" });
      }
      await producto.destroy();
      return res.json({ message: "Producto eliminado correctamente" });
    } catch (error) {
      console.error("Error al eliminar producto:", error);
      return res.status(500).json({ message: "Error en el servidor" });
    }
  }
);

module.exports = router;
